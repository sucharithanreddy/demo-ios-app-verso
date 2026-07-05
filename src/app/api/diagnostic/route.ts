import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { checkDatabaseConnection } from '@/lib/api-utils';
import { validateDiagnosticBody } from '@/lib/diagnostic-validation';

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

    return NextResponse.json({ results });
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

    const result = await db.diagnosticResult.create({
      data: {
        userId: user.id,
        driverScore: validation.driverScore!,
        strategistScore: validation.strategistScore!,
        connectorScore: validation.connectorScore!,
        reactorScore: validation.reactorScore!,
        primaryProfile: validation.primaryProfile!,
        secondaryProfile: validation.secondaryProfile ?? null,
        answers: validation.answers!,
        strengths: validation.strengths ?? null,
        wellbeingRisks: validation.wellbeingRisks ?? null,
        recommendations: validation.recommendations ?? null,
        isPaid: validation.isPaid ?? false,
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
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      result,
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
