// ============================================================================
// API client — talks to the Next.js backend
// ============================================================================

import { getToken } from './auth-token';
import type {
  UserProfile,
  DiagnosticResult,
  SalesCheckIn,
  CheckInInput,
  EngineResponse,
  ChatMessage,
  CoachingTip,
  UserStreak,
} from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Authenticated fetch wrapper
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// Backend user shape (from /api/user/profile) — mapped to our UserProfile
// ---------------------------------------------------------------------------

interface BackendUserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  userType: 'INDIVIDUAL' | 'SALES_PERSON' | 'SALES_MANAGER';
  industry: string | null;
  companyName: string | null;
  subscriptionPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus: 'FREE' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
}

function mapBackendUser(u: BackendUserProfile): UserProfile {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    userType: u.userType,
    industry: u.industry,
    companyName: u.companyName,
    subscriptionStatus: u.subscriptionStatus,
    subscriptionPlan: u.subscriptionPlan,
  };
}

async function authHeaders(): Promise<HeadersInit> {
  try {
    const token = await getToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => null);
    }
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as Record<string, unknown>).error)
        : `API error: ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// User & Profile
// ---------------------------------------------------------------------------

export async function fetchProfile(): Promise<UserProfile> {
  // Backend returns { user: {...} }
  const data = await apiFetch<{ user: BackendUserProfile }>('/api/user/profile');
  return mapBackendUser(data.user);
}

// ---------------------------------------------------------------------------
// Diagnostic
// ---------------------------------------------------------------------------

export async function fetchLatestDiagnostic(): Promise<DiagnosticResult | null> {
  // Backend returns { results: [...] } (most recent first). We take the first.
  const data = await apiFetch<{ results: DiagnosticResult[]; dbUnavailable?: boolean }>(
    '/api/diagnostic'
  );
  return data.results?.[0] ?? null;
}

// ---------------------------------------------------------------------------
// Check-ins
// ---------------------------------------------------------------------------

export async function fetchCheckIns(limit = 30): Promise<SalesCheckIn[]> {
  const data = await apiFetch<{ checkIns: SalesCheckIn[] }>(
    `/api/checkin?limit=${limit}`
  );
  return data.checkIns;
}

export async function createCheckIn(
  input: CheckInInput
): Promise<{ checkIn: SalesCheckIn; patternInsight: string }> {
  return apiFetch<{ checkIn: SalesCheckIn; patternInsight: string; success: boolean }>(
    '/api/checkin',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

export async function fetchStreak(): Promise<UserStreak | null> {
  try {
    // Backend returns { streak: {...}, hasStreak: boolean }
    const data = await apiFetch<{ streak: UserStreak; hasStreak: boolean }>('/api/streak');
    return data.streak;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Coaching tips
// ---------------------------------------------------------------------------

export async function fetchCoachingTips(
  situation = 'morning'
): Promise<{ tips: CoachingTip[]; archetype: string }> {
  return apiFetch<{ tips: CoachingTip[]; archetype: string }>(
    `/api/coaching?situation=${situation}`
  );
}

// ---------------------------------------------------------------------------
// AI Coach — /api/reframe (the engine)
// ---------------------------------------------------------------------------

export interface CoachRequest {
  userMessage: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  /**
   * Engine memory + state. The backend's `runEngine` reconstructs most of this
   * from conversationHistory, but grounding/intent state must be passed in to
   * preserve across turns.
   */
  sessionContext?: {
    previousQuestions?: string[];
    previousReframes?: string[];
    previousAcknowledgments?: string[];
    previousEncouragements?: string[];
    previousDistortions?: string[];
    originalTrigger?: string;
    groundingMode?: boolean;
    groundingTurns?: number;
    coreBeliefAlreadyDetected?: boolean;
    lastQuestionType?: 'choice' | 'open' | '';
    userIntent?: 'AUTO' | 'CALM' | 'CLARITY' | 'NEXT_STEP' | 'MEANING' | 'LISTEN';
  };
}

/**
 * The backend engine returns `_meta` and `_isCrisisResponse` (underscore-prefixed).
 * Normalize to clean field names for the mobile app.
 */
function normalizeEngineResponse(raw: any): EngineResponse {
  return {
    acknowledgment: String(raw?.acknowledgment ?? raw?.content ?? ''),
    thoughtPattern: raw?.thoughtPattern ?? raw?.distortionType ?? undefined,
    patternNote: raw?.patternNote ?? raw?.distortionExplanation ?? undefined,
    reframe: raw?.reframe ?? undefined,
    question: raw?.question ?? raw?.probingQuestion ?? undefined,
    encouragement: raw?.encouragement ?? undefined,
    icebergLayer: raw?.icebergLayer ?? undefined,
    layerInsight: raw?.layerInsight ?? undefined,
    progressScore: typeof raw?.progressScore === 'number' ? raw.progressScore : undefined,
    layerProgress:
      raw?.layerProgress && typeof raw.layerProgress === 'object'
        ? {
            surface: Number(raw.layerProgress.surface ?? 0),
            trigger: Number(raw.layerProgress.trigger ?? 0),
            emotion: Number(raw.layerProgress.emotion ?? 0),
            coreBelief: Number(raw.layerProgress.coreBelief ?? 0),
          }
        : undefined,
    groundingMode: typeof raw?.groundingMode === 'boolean' ? raw.groundingMode : undefined,
    groundingTurns: typeof raw?.groundingTurns === 'number' ? raw.groundingTurns : undefined,
    isCrisisResponse: Boolean(raw?._isCrisisResponse ?? raw?.isCrisisResponse),
    meta: (raw?._meta ?? raw?.meta) as EngineResponse['meta'],
  };
}

export async function sendCoachMessage(
  req: CoachRequest
): Promise<EngineResponse> {
  const raw = await apiFetch<any>('/api/reframe', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return normalizeEngineResponse(raw);
}

// ---------------------------------------------------------------------------
// Sessions (conversation persistence) — best-effort, non-blocking
// ---------------------------------------------------------------------------

export interface SessionSummary {
  id: string;
  title: string | null;
  createdAt: string;
}

export async function fetchSessions(): Promise<SessionSummary[]> {
  const data = await apiFetch<{ sessions: SessionSummary[] }>('/api/sessions');
  return data.sessions;
}

export async function fetchSessionMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  const data = await apiFetch<{ messages: ChatMessage[] }>(
    `/api/sessions/${sessionId}`
  );
  return data.messages;
}

/**
 * Create a new session. Returns the sessionId + the initial sessionContext
 * (computed by the backend from prior sessions).
 *
 * Best-effort: returns null on any error so callers can fall back to
 * stateless /api/reframe calls.
 */
export async function createSession(
  firstThought?: string,
  title?: string
): Promise<{ sessionId: string } | null> {
  try {
    const data = await apiFetch<{ session: { id: string } }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ firstThought, title }),
    });
    return { sessionId: data.session.id };
  } catch {
    return null;
  }
}

/**
 * Append a message (user or assistant) to a backend session.
 * Best-effort: failures are silently swallowed — local SQLite is the
 * source of truth for the chat UI, backend sessions are for cross-device
 * continuity + insights.
 */
export async function appendSessionMessage(
  sessionId: string,
  message: {
    role: 'user' | 'assistant';
    content: string;
    acknowledgment?: string;
    thoughtPattern?: string;
    patternNote?: string;
    reframe?: string;
    question?: string;
    encouragement?: string;
    icebergLayer?: string;
    layerInsight?: string;
    progressScore?: number;
    layerProgress?: Record<string, number>;
    groundingMode?: boolean;
    groundingTurns?: number;
    isCrisisResponse?: boolean;
    meta?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await apiFetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ sessionId, ...message }),
    });
  } catch {
    // Best-effort — don't break the chat UX on backend persistence failure.
  }
}

/**
 * Update session state (grounding, intent, layer, etc.) so the backend
 * has the latest engine state for the next time the user opens this session.
 */
export async function updateSessionState(
  sessionId: string,
  patch: {
    groundingMode?: boolean;
    groundingTurns?: number;
    coreBeliefAlreadyDetected?: boolean;
    lastQuestionType?: 'choice' | 'open' | '';
    lastIntentUsed?: 'AUTO' | 'CALM' | 'CLARITY' | 'NEXT_STEP' | 'MEANING' | 'LISTEN';
    currentLayer?: string;
  }
): Promise<void> {
  try {
    await apiFetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
  } catch {
    // Best-effort.
  }
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

export async function checkApiHealth(): Promise<boolean> {
  try {
    await fetch(`${API_URL}/api/route`, { method: 'GET' });
    return true;
  } catch {
    return false;
  }
}
