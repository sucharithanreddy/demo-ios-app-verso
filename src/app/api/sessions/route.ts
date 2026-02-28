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

function computeSessionContext(session: {
  messages?: Array<{
    role: string;
    content: string;
    question?: string | null;
    reframe?: string | null;
    thoughtPattern?: string | null;
    acknowledgment?: string | null;
    encouragement?: string | null;
  }>;
  groundingMode?: boolean;
  groundingTurns?: number;
  coreBeliefAlreadyDetected?: boolean;
  lastIntentUsed?: string | null;
}) {
  const messages = session?.messages ?? [];

  // Messages are fetched ASC, so take last N and reverse to get newest-first for memory
  const assistantMsgs = messages
    .filter(m => m.role === 'assistant')
    .slice(-30)
    .reverse()
    .slice(0, 20);

  const userMsgs = messages.filter(m => m.role === 'user');

  const previousQuestions: string[] = [];
  const previousReframes: string[] = [];
  const previousDistortions: string[] = [];
  const previousAcknowledgments: string[] = [];
  const previousEncouragements: string[] = [];

  for (const m of assistantMsgs) {
    if (m.question?.trim()) previousQuestions.push(m.question.trim());
    if (m.reframe?.trim()) previousReframes.push(m.reframe.trim());
    if (m.thoughtPattern?.trim()) previousDistortions.push(m.thoughtPattern.trim());
    if (m.acknowledgment?.trim()) previousAcknowledgments.push(m.acknowledgment.trim());
    if (m.encouragement?.trim()) previousEncouragements.push(m.encouragement.trim());
  }

  // ✅ No originalTrigger field in Session schema -> compute from first user msg
  const originalTrigger = (userMsgs?.[0]?.content || '').trim();

  const lastQuestion = previousQuestions[0] || '';
  const lastQuestionType: QuestionType = isChoiceQuestionText(lastQuestion)
    ? 'choice'
    : lastQuestion
      ? 'open'
      : '';

  return {
    previousQuestions: uniqRecent(previousQuestions, 25),
    previousReframes: uniqRecent(previousReframes, 25),
    previousDistortions: uniqRecent(previousDistortions, 10),
    previousAcknowledgments: uniqRecent(previousAcknowledgments, 25),
    previousEncouragements: uniqRecent(previousEncouragements, 25),

    originalTrigger,

    groundingMode: !!session?.groundingMode,
    groundingTurns: Number.isFinite(session?.groundingTurns) ? Number(session.groundingTurns) : 0,

    lastQuestionType,
    coreBeliefAlreadyDetected: !!session?.coreBeliefAlreadyDetected,

    userIntent: (session?.lastIntentUsed as UserIntent) || 'AUTO',
  };
}

// GET all sessions for the current user
export async function GET() {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    console.log('📖 GET /api/sessions - userId:', userId);
    
    if (!userId) {
      console.log('❌ GET /api/sessions - No userId, returning unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await db.user.findUnique({ where: { clerkId: userId } });
    
    console.log('👤 GET /api/sessions - User found:', user ? user.id : 'null');
    
    if (!user) {
      console.log('⚠️ GET /api/sessions - User not found in DB, returning empty sessions');
      return NextResponse.json({ sessions: [] });
    }

    const sessions = await db.session.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,

            acknowledgment: true,
            thoughtPattern: true,
            patternNote: true,
            reframe: true,
            question: true,
            encouragement: true,

            icebergLayer: true,
            layerInsight: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sessionsWithContext = sessions.map(s => ({
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
    const authResult = await auth();
    const userId = authResult?.userId;
    
    console.log('📝 POST /api/sessions - userId:', userId);
    
    if (!userId) {
      console.log('❌ POST /api/sessions - No userId, returning unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, firstThought } = body as { title?: string; firstThought?: string };
    
    console.log('📝 POST /api/sessions - title:', title, 'firstThought:', firstThought?.slice(0, 50));

    let user = await db.user.findUnique({ where: { clerkId: userId } });
    
    console.log('👤 POST /api/sessions - User found:', user ? user.id : 'null');

    if (!user) {
      console.log('🆕 POST /api/sessions - Creating new user for clerkId:', userId);
      
      if (!process.env.CLERK_SECRET_KEY) {
        console.log('❌ POST /api/sessions - CLERK_SECRET_KEY not set!');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }
      
      const userResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      });
      const userData = await userResponse.json();
      
      console.log('📦 POST /api/sessions - Clerk user data:', JSON.stringify(userData).slice(0, 200));

      const email =
        userData.email_addresses?.[0]?.email_address || `${userId}@placeholder.com`;

      const name =
        `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User';

      const avatarUrl = userData.image_url;

      user = await db.user.create({
        data: { clerkId: userId, email, name, avatarUrl },
      });
      
      console.log('✅ POST /api/sessions - Created user:', user.id);
    }

    const derivedTitle = title || (firstThought ? String(firstThought).slice(0, 50) : '') || 'New Session';
    
    console.log('📋 POST /api/sessions - Creating session with title:', derivedTitle);

    const session = await db.session.create({
      data: {
        userId: user.id,
        title: derivedTitle,

        // ✅ Match schema defaults
        currentLayer: 'surface',
        coreBelief: null,
        isCompleted: false,
        distortions: null,

        coreBeliefAlreadyDetected: false,
        lastQuestionType: null,
        groundingMode: false,
        groundingTurns: 0,
        lastIntentUsed: 'AUTO',
      },
    });
    
    console.log('✅ POST /api/sessions - Created session:', session.id);

    // ✅ If you want originalTrigger saved, do it via first Message (no schema change)
    if (typeof firstThought === 'string' && firstThought.trim()) {
      await db.message.create({
        data: {
          sessionId: session.id,
          role: 'user',
          content: firstThought.trim(),
        },
      });
    }

    const fullSession = await db.session.findFirst({
      where: { id: session.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
            acknowledgment: true,
            thoughtPattern: true,
            patternNote: true,
            reframe: true,
            question: true,
            encouragement: true,
            icebergLayer: true,
            layerInsight: true,
          },
        },
      },
    });

    return NextResponse.json({
      session: fullSession,
      sessionContext: computeSessionContext(fullSession || { messages: [] }),
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
