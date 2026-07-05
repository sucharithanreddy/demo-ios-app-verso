import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkDatabaseConnection } from '@/lib/api-utils';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { validateThought } from '@/lib/input-validation';
import { runEngine, type UserProfile } from '@/lib/engine/runEngine';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(request: NextRequest) {
  try {
    // Safe auth - works even when Clerk isn't configured
    const { userId } = await getAuth();
    const clientId = userId || getClientIdentifier(request);

    const rateLimit = checkRateLimit(clientId, 'reframe');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.', retryAfter: rateLimit.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    const body = await request.json();
    const { userMessage, conversationHistory = [], sessionContext } = body as {
      userMessage: string;
      conversationHistory?: ChatMessage[];
      sessionContext?: Record<string, unknown>;
    };

    const validation = validateThought(userMessage);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Hydrate the user's Sales Wellbeing Map profile from the DB, if available.
    // Best-effort: if the DB is unreachable or the user has never taken the
    // assessment, we proceed WITHOUT a profile — the engine falls back to
    // its original (non-personalized) behaviour. This keeps the public /
    // unauthenticated path working.
    const userProfile = await loadUserProfile(userId);

    const out = await runEngine({
      userText: validation.sanitized,
      conversationHistory,
      sessionContext: sessionContext as any,
      userProfile,
    });

    return NextResponse.json(out, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to process thought' }, { status: 500 });
  }
}

/**
 * Fetch the user's most recent DiagnosticResult and project it into the
 * UserProfile shape the engine expects. Returns undefined if there's no
 * auth, no DB, no user row, or no diagnostic result yet.
 *
 * This is the single integration point that delivers the Phase 3
 * "AI Companion" promise from the product briefing: the AI now knows
 * the user's dominant pressure archetype and can personalize every
 * response.
 */
async function loadUserProfile(clerkUserId: string | null): Promise<UserProfile | undefined> {
  if (!clerkUserId) return undefined;

  try {
    const dbCheck = await checkDatabaseConnection();
    if (!dbCheck.connected) return undefined;

    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });
    if (!user) return undefined;

    const latest = await db.diagnosticResult.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
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

    if (!latest) return undefined;

    return {
      primaryProfile: latest.primaryProfile,
      secondaryProfile: latest.secondaryProfile,
      driverScore: latest.driverScore,
      strategistScore: latest.strategistScore,
      connectorScore: latest.connectorScore,
      reactorScore: latest.reactorScore,
      isPaid: latest.isPaid,
      completedAt: latest.createdAt.toISOString(),
    };
  } catch (err) {
    // Non-fatal — engine works without a profile
    console.warn('loadUserProfile: failed to load, proceeding without profile:', err);
    return undefined;
  }
}
