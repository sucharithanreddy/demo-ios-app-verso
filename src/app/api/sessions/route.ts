import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

type UserIntent = 'AUTO' | 'CALM' | 'CLARITY' | 'NEXT_STEP' | 'MEANING' | 'LISTEN';
type QuestionType = 'choice' | 'open' | '';

function normalizeForCompare(s: string): string {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function uniqRecent(items: string[], limit = 25): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of items) {
    const n = normalizeForCompare(x);
    if (!n) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(x);
    if (out.length >= limit) break;
  }
  return out;
}

function isChoiceQuestionText(q: string): boolean {
  const s = (q || '').toLowerCase();
  if (!s) return false;
  return (
    s.includes('comfort right now') ||
    s.includes('tiny practical step') ||
    (s.includes('comfort') && s.includes('practical')) ||
    (s.includes('do you want') && s.includes('or'))
  );
}

function computeSessionContext(session: any) {
  const messages = (session?.messages ?? []) as any[];

  // Pull from structured columns first (best), fall back to parsing JSON content only if needed.
  const assistantMsgs = messages.filter(m => m.role === 'assistant').slice(-20);
  const userMsgs = messages.filter(m => m.role === 'user');

  const previousQuestions: string[] = [];
  const previousReframes: string[] = [];
  const previousDistortions: string[] = [];
  const previousAcknowledgments: string[] = [];
  const previousEncouragements: string[] = [];

  for (const m of assistantMsgs) {
    if (typeof m.question === 'string' && m.question.trim()) previousQuestions.push(m.question.trim());
    if (typeof m.reframe === 'string' && m.reframe.trim()) previousReframes.push(m.reframe.trim());
    if (typeof m.thoughtPattern === 'string' && m.thoughtPattern.trim())
      previousDistortions.push(m.thoughtPattern.trim());
    if (typeof m.acknowledgment === 'string' && m.acknowledgment.trim())
      previousAcknowledgments.push(m.acknowledgment.trim());
    if (typeof m.encouragement === 'string' && m.encouragement.trim())
      previousEncouragements.push(m.encouragement.trim());
  }

  const originalTrigger =
    typeof session?.originalTrigger === 'string' && session.originalTrigger.trim()
      ? session.originalTrigger.trim()
      : (userMsgs?.[0]?.content as string) || '';

  const lastQuestion = previousQuestions[0] || '';
  const lastQuestionType: QuestionType = isChoiceQuestionText(lastQuestion) ? 'choice' : lastQuestion ? 'open' : '';

  return {
    previousQuestions: uniqRecent(previousQuestions, 25),
    previousReframes: uniqRecent(previousReframes, 25),
    previousDistortions: uniqRecent(previousDistortions, 10),
    previousAcknowledgments: uniqRecent(previousAcknowledgments, 25),
    previousEncouragements: uniqRecent(previousEncouragements, 25),

    originalTrigger,

    groundingMode: !!session?.groundingMode,
    groundingTurns: Number.isFinite(session?.groundingTurns) ? session.groundingTurns : 0,

    lastQuestionType,
    coreBeliefAlreadyDetected: !!session?.coreBeliefAlreadyDetected,

    // reflect-only (UI sets it per call; but we store last used for analytics)
    userIntent: (session?.lastIntentUsed as UserIntent) || 'AUTO',
  };
}

// GET all sessions for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ sessions: [] });

    const sessions = await db.session.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          // keep payload light: only what we need for context + UI playback
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,

            // structured fields (if present in schema)
            acknowledgment: true,
            thoughtPattern: true,
            patternNote: true,
            reframe: true,
            question: true,
            encouragement: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // attach computed context to each session (backwards compatible)
    const sessionsWithContext = sessions.map((s: any) => ({
      ...s,
      sessionContext: computeSessionContext(s),
    }));

    return NextResponse.json({ sessions: sessionsWithContext });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST create a new session
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, firstThought } = body;

    let user = await db.user.findUnique({ where: { clerkId: userId } });

    if (!user) {
      const userResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      });

      const userData = await userResponse.json();
      const email = userData.email_addresses?.[0]?.email_address || `${userId}@placeholder.com`;
      const name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User';
      const avatarUrl = userData.image_url;

      user = await db.user.create({
        data: { clerkId: userId, email, name, avatarUrl },
      });
    }

    const derivedTitle = title || firstThought?.slice(0, 50) || 'New Session';
    const session = await db.session.create({
      data: {
        userId: user.id,
        title: derivedTitle,

        // ✅ engine defaults (schema must support these)
        originalTrigger: typeof firstThought === 'string' ? firstThought : undefined,
        currentLayer: 'SURFACE',
        coreBelief: null,
        coreBeliefAlreadyDetected: false,
        lastQuestionType: '',
        groundingMode: false,
        groundingTurns: 0,
        lastIntentUsed: 'AUTO',
        lastUpdatedAt: new Date(),
      } as any,
    });

    return NextResponse.json({
      session,
      sessionContext: computeSessionContext({ ...session, messages: [] }),
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
