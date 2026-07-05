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
  sessionContext?: Record<string, unknown>;
}

export async function sendCoachMessage(
  req: CoachRequest
): Promise<EngineResponse> {
  return apiFetch<EngineResponse>('/api/reframe', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// ---------------------------------------------------------------------------
// Sessions (conversation persistence)
// ---------------------------------------------------------------------------

export async function fetchSessions(): Promise<
  Array<{ id: string; title: string | null; createdAt: string }>
> {
  const data = await apiFetch<{
    sessions: Array<{ id: string; title: string | null; createdAt: string }>;
  }>('/api/sessions');
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
