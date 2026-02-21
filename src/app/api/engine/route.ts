// src/app/api/engine/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateThought } from '@/lib/input-validation';

// ✅ You will create this file next (it contains the extracted logic from /api/reframe)
import { runReframe } from '@/lib/engine/runReframe';

type UserIntent = 'AUTO' | 'CALM' | 'CLARITY' | 'NEXT_STEP' | 'MEANING' | 'LISTEN';

interface EngineRequestBody {
  text: string;
  session_context?: {
    // optional: let buyers pass whatever they have
    sessionId?: string;
    turn?: number;

    previousTopics?: string[];
    previousDistortions?: string[];
    previousQuestions?: string[];
    previousReframes?: string[];
    previousAcknowledgments?: string[];
    previousEncouragements?: string[];

    originalTrigger?: string;

    groundingMode?: boolean;
    groundingTurns?: number;
    lastQuestionType?: 'choice' | 'open' | '';
    userIntent?: UserIntent;

    // room for vendor-specific metadata
    meta?: Record<string, unknown>;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EngineRequestBody;

    // Basic input checks
    if (!body?.text || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'Missing "text" string.' }, { status: 400 });
    }

    // Reuse your existing sanitation/validation rules
    const validation = validateThought(body.text);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Call the “sellable engine” core (no auth, no rate-limit, no UI assumptions)
    const out = await runReframe({
      userText: validation.sanitized,
      sessionContext: body.session_context ?? {},
    });

    return NextResponse.json(out, { status: 200 });
  } catch (error) {
    console.error('Engine API error:', error);
    return NextResponse.json({ error: 'Failed to run engine.' }, { status: 500 });
  }
}
