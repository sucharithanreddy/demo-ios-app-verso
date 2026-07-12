// ============================================================================
// Type definitions — mirror the backend Prisma models + API contracts
// ============================================================================

export type Archetype = 'Driver' | 'Strategist' | 'Connector' | 'Reactor';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  userType: 'INDIVIDUAL' | 'SALES_PERSON' | 'SALES_MANAGER';
  industry: string | null;
  companyName: string | null;
  subscriptionStatus: 'FREE' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  subscriptionPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export interface DiagnosticResult {
  id: string;
  primaryProfile: Archetype;
  secondaryProfile: Archetype | null;
  driverScore: number;
  strategistScore: number;
  connectorScore: number;
  reactorScore: number;
  strengths: string[] | null;
  wellbeingRisks: string[] | null;
  recommendations: string[] | null;
  isPaid: boolean;
  createdAt: string;
}

export interface SalesCheckIn {
  id: string;
  date: string;
  mood: number;       // 1-5
  energy: number;     // 1-5
  confidence: number; // 1-5
  impactTags: string[];
  notes: string | null;
  patternInsight: string | null;
}

export interface CheckInInput {
  mood: number;
  energy: number;
  confidence: number;
  impactTags?: string[];
  notes?: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
}

// ============================================================================
// AI Engine response — matches /api/reframe output EXACTLY
// ============================================================================

export type IcebergLayer =
  | 'surface'
  | 'transition'
  | 'emotion'
  | 'core_wound'
  | 'SURFACE'
  | 'TRANSITION'
  | 'EMOTION'
  | 'CORE_WOUND';

export interface LayerProgress {
  surface: number;    // 0-100
  trigger: number;    // 0-100
  emotion: number;    // 0-100
  coreBelief: number; // 0-100
}

export interface EngineMeta {
  provider?: string;
  model?: string;
  turn?: number;
  effectiveLayer?: string;
  coreBeliefDetected?: boolean;
  intent?: 'AUTO' | 'CALM' | 'CLARITY' | 'NEXT_STEP' | 'MEANING' | 'LISTEN';
  state?: string;
  intervention?: string;
  confidence?: number;
  reasons?: string[];
  crisis?: boolean;
}

export interface EngineResponse {
  // Core structured response — what the user sees
  acknowledgment: string;
  thoughtPattern?: string;
  patternNote?: string;
  reframe?: string;
  question?: string;
  encouragement?: string;

  // Iceberg layer context
  icebergLayer?: string;
  layerInsight?: string;

  // Progress + state — drives the depth visualization
  progressScore?: number;            // 0-100 overall conversation progress
  layerProgress?: LayerProgress;     // per-layer depth
  groundingMode?: boolean;
  groundingTurns?: number;

  // Crisis flag — engine detected acute safety concern
  isCrisisResponse?: boolean;

  // Engine meta — provider, turn count, layer, intent, decision
  meta?: EngineMeta;
}

// ============================================================================
// Chat message model
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  // Structured fields from the engine (assistant messages only)
  acknowledgment?: string;
  thoughtPattern?: string;
  patternNote?: string;
  reframe?: string;
  question?: string;
  encouragement?: string;
  icebergLayer?: string;
  layerInsight?: string;
  progressScore?: number;
  layerProgress?: LayerProgress;
  groundingMode?: boolean;
  groundingTurns?: number;
  isCrisisResponse?: boolean;
  meta?: EngineMeta;
  createdAt: number;
  // Sync state for offline support
  synced: boolean;
}

export interface CoachingTip {
  id: string;
  archetype: string;
  situation: string;
  tip: string;
  actionTitle: string | null;
}

// Impact tags for check-ins
export const IMPACT_TAGS = [
  { id: 'win', label: 'Win', icon: 'trophy', color: '#22C55E' },
  { id: 'good_call', label: 'Good call', icon: 'call', color: '#3B82F6' },
  { id: 'tough_client', label: 'Tough client', icon: 'person', color: '#F59E0B' },
  { id: 'missed_target', label: 'Missed target', icon: 'close-circle', color: '#EF4444' },
  { id: 'rejection', label: 'Rejection', icon: 'heart-dislike', color: '#EF4444' },
  { id: 'pipeline', label: 'Pipeline work', icon: 'document', color: '#8B5CF6' },
  { id: 'meeting', label: 'Big meeting', icon: 'people', color: '#06B6D4' },
  { id: 'personal', label: 'Personal stuff', icon: 'home', color: '#EC4899' },
] as const;

// Quick prompts for the coach chat
export const QUICK_PROMPTS = [
  { id: 'pre_call', label: 'Before a call', prompt: "I've got a big call coming up in 30 minutes and I'm feeling nervous. Help me get in the right headspace." },
  { id: 'post_rejection', label: 'After a rejection', prompt: "I just got rejected on a deal I'd been working on for weeks. I'm feeling deflated." },
  { id: 'bad_day', label: 'Having a bad day', prompt: "Today has been rough. Nothing went right and I'm questioning whether I'm cut out for this." },
  { id: 'good_win', label: 'After a win', prompt: "I just closed a big deal! I want to make sure I capture what went right so I can repeat it." },
  { id: 'stuck', label: 'Feeling stuck', prompt: "I've been in a slump for a couple weeks. My pipeline is dry and I can't seem to get momentum." },
  { id: 'burnout', label: 'Feeling burned out', prompt: "I'm exhausted. I've been pushing hard for months and I think I'm burning out." },
] as const;
