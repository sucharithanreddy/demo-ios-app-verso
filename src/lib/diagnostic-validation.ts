// src/lib/diagnostic-validation.ts
//
// Pure validation + sanitization helpers for the diagnostic flow.
//
// Extracted from /api/diagnostic/route.ts so they can be unit-tested
// without having to mock Next.js request/response objects. The route
// handler stays thin: it calls these helpers and translates the result
// into HTTP responses.
//
// All functions here are pure (no I/O, no side effects) and safe to
// import from either server or test code.

/**
 * The four valid Sales Wellbeing Map archetypes.
 * Title-cased because that's how they're stored in the DiagnosticResult
 * table (and how the diagnostic page sends them).
 */
export const VALID_PROFILES = ['Driver', 'Strategist', 'Connector', 'Reactor'] as const;
export type ValidProfile = (typeof VALID_PROFILES)[number];

/**
 * Valid attempt sources - distinguishes the free 16-question Snapshot
 * from the paid 64-question Full Map.
 */
export const VALID_ATTEMPT_SOURCES = ['snapshot', 'full_map'] as const;
export type ValidAttemptSource = (typeof VALID_ATTEMPT_SOURCES)[number];

/**
 * Valid profile classifications (PDF spec §8) - only set on Full Map
 * attempts.
 */
export const VALID_CLASSIFICATIONS = ['strong_primary', 'blended', 'balanced', 'flexible'] as const;

/**
 * Clamp a score to the 0-100 range. Handles:
 *  - numbers already in range (passthrough)
 *  - numbers out of range (clamp)
 *  - numeric strings ("42" → 42)
 *  - non-numeric values (NaN → 0)
 *  - null/undefined (→ 0)
 *
 * Always returns an integer.
 */
export function clampScore(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v) || 0;
  // Guard against NaN - typeof NaN === 'number', so the check above
  // lets it through, but Math.round(NaN) === NaN and that propagates
  // through Math.min/max. Coerce to 0 so bad input can never produce
  // a NaN score that would later break DB insertion or rendering.
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Validate and normalize a primaryProfile string.
 * Returns the title-cased profile name if valid, null otherwise.
 *
 * Accepts case-insensitive input ("driver", "DRIVER", "Driver") and
 * trims whitespace, because the diagnostic page has historically been
 * inconsistent about casing.
 */
export function normalizePrimaryProfile(input: unknown): ValidProfile | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Case-insensitive match against the valid set
  const match = VALID_PROFILES.find(
    p => p.toLowerCase() === trimmed.toLowerCase()
  );
  return match ?? null;
}

/**
 * Validate and normalize a secondaryProfile string.
 * Same rules as normalizePrimaryProfile, but also accepts null/empty
 * (secondary is optional).
 */
export function normalizeSecondaryProfile(input: unknown): ValidProfile | null {
  if (input == null) return null;
  return normalizePrimaryProfile(input);
}

/**
 * Normalize an attemptSource string. Returns null for invalid/missing
 * input - the caller treats null as "use the default" (snapshot).
 */
export function normalizeAttemptSource(input: unknown): ValidAttemptSource | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().toLowerCase();
  return (VALID_ATTEMPT_SOURCES as readonly string[]).includes(trimmed)
    ? (trimmed as ValidAttemptSource)
    : null;
}

/**
 * Normalize a profileClassification string. Returns null for invalid
 * input - the caller treats null as "not set" (only used by Full Map).
 */
export function normalizeClassification(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().toLowerCase();
  return (VALID_CLASSIFICATIONS as readonly string[]).includes(trimmed)
    ? trimmed
    : null;
}

/**
 * A single answer in the diagnostic payload.
 * questionId is 1-indexed per the question bank.
 * score is 1-5 (Likert scale).
 */
export interface SanitizedAnswer {
  questionId: number;
  score: number;
}

/**
 * Sanitize the answers array from the client.
 *
 * Rules:
 *  - Filter out entries that aren't objects with numeric questionId + score.
 *  - Clamp each score to 1-5 (the valid Likert range).
 *  - Preserve order.
 *
 * Returns null if the input isn't an array or if no entries survive
 * filtering - the caller should treat null as "invalid payload" and
 * return a 400.
 */
export function sanitizeAnswers(input: unknown): SanitizedAnswer[] | null {
  if (!Array.isArray(input)) return null;

  const sanitized: SanitizedAnswer[] = input
    .filter(
      (a: any) =>
        a && typeof a.questionId === 'number' && typeof a.score === 'number'
    )
    .map((a: any) => ({
      questionId: a.questionId,
      score: Math.max(1, Math.min(5, a.score)),
    }));

  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Coerce a value to a non-negative integer. Used for optional Int?
 * fields like completionTimeSeconds and sustainabilityIndex. Returns
 * null for missing/invalid input.
 */
export function coerceOptionalInt(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

/**
 * Coerce a value to a JSON-serialisable object. Used for optional Json?
 * fields like dimensionScores, derivedMeasures, responseQualityFlags.
 * Returns null for missing/non-object input. Strings are parsed if
 * they look like JSON.
 */
export function coerceOptionalJson(v: unknown): Record<string, unknown> | null {
  if (v == null) return null;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return null; }
  }
  if (typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

/**
 * Result of validating the full diagnostic POST body.
 * On success, `valid` is true and the fields are populated.
 * On failure, `valid` is false and `error` is a user-facing message.
 */
export interface DiagnosticValidationResult {
  valid: boolean;
  error?: string;
  primaryProfile?: ValidProfile;
  secondaryProfile?: ValidProfile | null;
  driverScore?: number;
  strategistScore?: number;
  connectorScore?: number;
  reactorScore?: number;
  answers?: SanitizedAnswer[];
  strengths?: string[] | null;
  wellbeingRisks?: string[] | null;
  recommendations?: string[] | null;
  isPaid?: boolean;
  attemptSource?: ValidAttemptSource | null;
  assessmentVersion?: string | null;

  // Full Map (64Q) - Verso Sales Wellbeing Map v1.0 fields
  dimensionScores?: Record<string, unknown> | null;
  derivedMeasures?: Record<string, unknown> | null;
  sustainabilityIndex?: number | null;
  profileClassification?: string | null;
  blendedArchetypes?: string | null;
  responseQualityFlags?: Record<string, unknown> | null;
  completionTimeSeconds?: number | null;
}

/**
 * Validate the full POST body for /api/diagnostic.
 *
 * This is the single source of truth for what the API accepts. The
 * route handler calls this, then either writes to the DB (on success)
 * or returns a 400 with the error message (on failure).
 */
export function validateDiagnosticBody(body: any): DiagnosticValidationResult {
  // primaryProfile - required, must be a valid archetype
  const primaryProfile = normalizePrimaryProfile(body?.primaryProfile);
  if (!primaryProfile) {
    return {
      valid: false,
      error: `primaryProfile must be one of: ${VALID_PROFILES.join(', ')}`,
    };
  }

  // scores - required, clamped to 0-100
  const driverScore = clampScore(body?.driverScore);
  const strategistScore = clampScore(body?.strategistScore);
  const connectorScore = clampScore(body?.connectorScore);
  const reactorScore = clampScore(body?.reactorScore);

  // secondaryProfile - optional
  const secondaryProfile = normalizeSecondaryProfile(body?.secondaryProfile);

  // answers - required, non-empty after sanitization
  const answers = sanitizeAnswers(body?.answers);
  if (!answers) {
    return {
      valid: false,
      error: 'answers must be a non-empty array of { questionId, score }',
    };
  }

  // Optional metadata arrays - pass through if arrays, else null
  const strengths = Array.isArray(body?.strengths) ? body.strengths : null;
  const wellbeingRisks = Array.isArray(body?.wellbeingRisks)
    ? body.wellbeingRisks
    : null;
  const recommendations = Array.isArray(body?.recommendations)
    ? body.recommendations
    : null;

  // isPaid - defaults to false
  const isPaid = Boolean(body?.isPaid);

  // attemptSource - optional, defaults to null (DB column is nullable)
  const attemptSource = normalizeAttemptSource(body?.attemptSource);

  // assessmentVersion - optional string
  const assessmentVersion =
    typeof body?.assessmentVersion === 'string' && body.assessmentVersion.trim()
      ? body.assessmentVersion.trim().slice(0, 64) // cap length for DB safety
      : null;

  // Full Map fields - all optional, only set when attemptSource === 'full_map'
  const dimensionScores = coerceOptionalJson(body?.dimensionScores);
  const derivedMeasures = coerceOptionalJson(body?.derivedMeasures);
  const sustainabilityIndex = coerceOptionalInt(body?.sustainabilityIndex);
  const profileClassification = normalizeClassification(body?.profileClassification);
  const blendedArchetypes =
    typeof body?.blendedArchetypes === 'string' && body.blendedArchetypes.trim()
      ? body.blendedArchetypes.trim().slice(0, 64)
      : null;
  const responseQualityFlags = coerceOptionalJson(body?.responseQualityFlags);
  const completionTimeSeconds = coerceOptionalInt(body?.completionTimeSeconds);

  return {
    valid: true,
    primaryProfile,
    secondaryProfile,
    driverScore,
    strategistScore,
    connectorScore,
    reactorScore,
    answers,
    strengths,
    wellbeingRisks,
    recommendations,
    isPaid,
    attemptSource,
    assessmentVersion,
    dimensionScores,
    derivedMeasures,
    sustainabilityIndex,
    profileClassification,
    blendedArchetypes,
    responseQualityFlags,
    completionTimeSeconds,
  };
}

/**
 * Project a DiagnosticResult row (from Prisma) into the UserProfile
 * shape the Optimism Engine expects.
 *
 * Returns undefined if the row is missing required fields (defensive -
 * shouldn't happen with a well-formed DB row, but the engine should
 * never crash because of a bad row).
 *
 * This is the same projection that /api/reframe/route.ts does inline;
 * extracting it here so we can test it and reuse it from other callers
 * (e.g. /api/engine if we want to personalize that path too).
 */
export function projectToUserProfile(row: {
  primaryProfile: string;
  secondaryProfile?: string | null;
  driverScore: number;
  strategistScore: number;
  connectorScore: number;
  reactorScore: number;
  isPaid?: boolean;
  createdAt?: Date | string;
} | null): import('./engine/runEngine').UserProfile | undefined {
  if (!row) return undefined;
  if (!row.primaryProfile) return undefined;

  return {
    primaryProfile: row.primaryProfile,
    secondaryProfile: row.secondaryProfile ?? undefined,
    driverScore: row.driverScore,
    strategistScore: row.strategistScore,
    connectorScore: row.connectorScore,
    reactorScore: row.reactorScore,
    isPaid: row.isPaid,
    completedAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : row.createdAt,
  };
}
