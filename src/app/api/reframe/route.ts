// src/app/api/reframe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { validateThought } from '@/lib/input-validation';
import { runEngine } from '@/lib/engine/runEngine';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(request: NextRequest) {
  try {
    // ✅ Keep your existing auth + rate-limits for the app endpoint
    const { userId } = await auth();
    const clientId = userId || getClientIdentifier(request);

    const rateLimit = checkRateLimit(clientId, 'reframe');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.', retryAfter: rateLimit.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    // ✅ Keep your existing request contract for the UI
    const body = await request.json();
    const { userMessage, conversationHistory = [], sessionContext } = body as {
      userMessage: string;
      conversationHistory?: ChatMessage[];
      sessionContext?: Record<string, unknown>;
    };

    // ✅ Reuse your existing validation/sanitization
    const validation = validateThought(userMessage);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // ✅ The one brain
    const out = await runEngine({
      userText: validation.sanitized,
      conversationHistory,
      sessionContext: sessionContext as any,
    });

    return NextResponse.json(out, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to process thought' }, { status: 500 });
  }
}
