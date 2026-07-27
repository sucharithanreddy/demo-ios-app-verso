import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { checkDatabaseConnection } from '@/lib/api-utils';
import { validateDiagnosticBody } from '@/lib/diagnostic-validation';
import {
  scoreFullMapServerSide,
  scoreSnapshotServerSide,
  recomputeFromStoredAnswers,
  ScoringError,
} from '@/lib/diagnostic-server-scoring';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Return the current user's diagnostic history (most recent first)
// Replaces the previous stub that always returned { results: [] }.
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ results: [] });
    }

    const dbCheck = await checkDatabaseConnection();
    if (!dbCheck.connected) {
      // DB unavailable — fall back to empty rather than 503, so the UI keeps working
      return NextResponse.json({ results: [], dbUnavailable: true });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ results: [] });
    }

    const results = await db.diagnosticResult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // -----------------------------------------------------------------
    // SELF-HEALING READ (PDF spec §5 + §21)
    //
    // Every stored row carries the user's raw answers. On read, we
    // re-derive the scores from those answers and OVERWRITE the row's
    // stored computed fields. This means:
    //
    //   1. If a row was tampered with at write time (e.g. via an older
    //      API build that trusted client-supplied scores), it self-
    //      heals the first time anyone reads it.
    //   2. If we ever fix a scoring bug server-side, every existing
    //      row automatically picks up the fix on next read.
    //   3. Dashboards, the AI Companion, and manager reports always
    //      see canonical scores — never stale or tampered values.
    //
    // Rows whose answers are missing/unparseable (e.g. very old rows
    // from before answers were persisted) pass through unchanged.
    // -----------------------------------------------------------------
    const healedResults = results.map(row => {
      const recomputed = recomputeFromStoredAnswers(
        row.answers,
        row.completionTimeSeconds ?? 0,
      );
      if (!recomputed) return row;
      return {
        ...row,
        driverScore: recomputed.driverScore,
        strategistScore: recomputed.strategistScore,
        connectorScore: recomputed.connectorScore,
        reactorScore: recomputed.reactorScore,
        primaryProfile: recomputed.primaryProfile,
        secondaryProfile: recomputed.secondaryProfile,
        dimensionScores: recomputed.dimensionScores,
        derivedMeasures: recomputed.derivedMeasures,
        sustainabilityIndex: recomputed.sustainabilityIndex,
        profileClassification: recomputed.profileClassification,
        blendedArchetypes: recomputed.blendedArchetypes,
        responseQualityFlags: recomputed.responseQualityFlags,
        assessmentVersion: recomputed.assessmentVersion,
      };
    });

    return NextResponse.json({ results: healedResults });
  } catch (error) {
    console.error('GET /api/diagnostic error:', error);
    return NextResponse.json({ results: [], error: 'Failed to load' }, { status: 500 });
  }
}

// POST - Persist a DiagnosticResult row.
//
// Replaces the previous no-op stub. This fixes the critical persistence bug
// where results lived only in localStorage, so manager/admin dashboards
// (which read DiagnosticResult from the DB) always returned empty archetype
// data, and the AI engine had no profile to hydrate prompts with.
//
// Expected body shape (mirrors what the client already builds for localStorage):
// {
//   driverScore, strategistScore, connectorScore, reactorScore,
//   primaryProfile, secondaryProfile?,
//   answers: [{ questionId, score }],
//   strengths?: string[],
//   wellbeingRisks?: string[],
//   recommendations?: string[],
//   isPaid?: boolean (default false),
//   attemptSource?: 'snapshot' | 'full_map' (default 'snapshot')
// }
//
// Backward compatibility: if the client doesn't call this endpoint at all
// (older builds), nothing breaks — they just don't get server-side persistence.
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required to save diagnostic results' },
        { status: 401 }
      );
    }

    const dbCheck = await checkDatabaseConnection();
    if (!dbCheck.connected) {
      return NextResponse.json(
        { error: 'Database unavailable. Results saved locally only.' },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Find or auto-create the User row linked to this Clerk user
    let user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      // Auto-create a minimal User row. The full profile is captured later
      // via /api/auth/complete-profile. Mirror the pattern used in
      // /api/sessions and /api/mood for race-condition safety.
      try {
        user = await db.user.create({
          data: {
            clerkId: userId,
            email: `pending+${userId.slice(-8)}@clerk.local`, // placeholder until /complete-profile runs
            userType: 'INDIVIDUAL',
          },
          select: { id: true },
        });
      } catch {
        // Race: another request created the user between findUnique and create
        user = await db.user.findUnique({
          where: { clerkId: userId },
          select: { id: true },
        });
        if (!user) throw new Error('Could not resolve user after race');
      }
    }

    // Validate the body using the shared helper. This keeps the route
    // thin and makes the validation logic unit-testable without mocking
    // Next.js request/response objects.
    const validation = validateDiagnosticBody(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------
    // SERVER-SIDE SCORING (source of truth)
    //
    // For a PAID test, client-supplied scores are an integrity hole.
    // We re-derive every score from the raw answers server-side and
    // IGNORE every computed field the client sent (driverScore,
    // dimensionScores, sustainabilityIndex, etc.). The client still
    // computes locally for its immediate results-page render, but the
    // persisted DB row is always the server's computation.
    //
    // If server-side scoring fails (e.g. fewer than 64 answers for a
    // Full Map), we 400 — the client must fix and resubmit.
    // -----------------------------------------------------------------
    const isFullMap = validation.attemptSource === 'full_map';
    let scored;
    try {
      scored = isFullMap
        ? scoreFullMapServerSide(
            validation.answers,
            validation.completionTimeSeconds ?? 0,
            validation.attemptSource,
          )
        : scoreSnapshotServerSide(
            validation.answers,
            validation.completionTimeSeconds ?? 0,
          );
    } catch (err) {
      const msg = err instanceof ScoringError
        ? err.message
        : 'Server-side scoring failed';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const result = await db.diagnosticResult.create({
      data: {
        userId: user.id,
        // Server-computed archetype scores (title-cased primary/secondary)
        driverScore: scored.driverScore,
        strategistScore: scored.strategistScore,
        connectorScore: scored.connectorScore,
        reactorScore: scored.reactorScore,
        primaryProfile: scored.primaryProfile,
        secondaryProfile: scored.secondaryProfile,
        // Raw answers preserved (PDF spec §5 — retain original responses)
        answers: validation.answers!,
        strengths: validation.strengths ?? null,
        wellbeingRisks: validation.wellbeingRisks ?? null,
        recommendations: validation.recommendations ?? null,
        isPaid: validation.isPaid ?? false,
        attemptSource: scored.attemptSource,
        assessmentVersion: scored.assessmentVersion,
        // Server-computed Full Map structured fields
        dimensionScores: scored.dimensionScores,
        derivedMeasures: scored.derivedMeasures,
        sustainabilityIndex: scored.sustainabilityIndex,
        profileClassification: scored.profileClassification,
        blendedArchetypes: scored.blendedArchetypes,
        responseQualityFlags: scored.responseQualityFlags,
        completionTimeSeconds: validation.completionTimeSeconds ?? null,
      },
      select: {
        id: true,
        primaryProfile: true,
        secondaryProfile: true,
        driverScore: true,
        strategistScore: true,
        connectorScore: true,
        reactorScore: true,
        isPaid: true,
        attemptSource: true,
        assessmentVersion: true,
        sustainabilityIndex: true,
        profileClassification: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      result,
      // Echo the server-computed scores back so the client can verify
      // its local computation matches (and refresh its localStorage
      // cache if it doesn't).
      serverComputed: {
        driverScore: scored.driverScore,
        strategistScore: scored.strategistScore,
        connectorScore: scored.connectorScore,
        reactorScore: scored.reactorScore,
        sustainabilityIndex: scored.sustainabilityIndex,
        profileClassification: scored.profileClassification,
      },
      message: 'Diagnostic result persisted to database',
    });
  } catch (error) {
    console.error('POST /api/diagnostic error:', error);
    return NextResponse.json(
      { error: 'Failed to persist diagnostic result' },
      { status: 500 }
    );
  }
}
