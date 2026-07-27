// src/lib/diagnostic-server-scoring.ts
//
// Server-side source of truth for Full Map scoring.
//
// PROBLEM
//   The original architecture computed all scores in the browser via
//   calculateFullResults() and POSTed them to /api/diagnostic, which
//   trusted them verbatim. For a PAID assessment this is an integrity
//   hole — a user can open DevTools, rewrite the fetch body, and
//   persist any scores they want. Downstream dashboards, the AI
//   Companion, and manager reports would then hydrate from tampered
//   data forever.
//
// SOLUTION
//   This module re-derives the entire FullDiagnosticResult from the
//   raw { questionId, score }[] answers server-side. The API route
//   calls scoreFullMapServerSide() and ignores every computed field
//   the client sent. The client still computes locally for the
//   immediate results-page render, but the persisted DB row is always
//   the server's computation — never the client's.
//
// RELATIONSHIP TO OTHER MODULES
//   - full-diagnostic-questions.ts: exports calculateFullResults, the
//     pure scoring function. Both client and this module call it.
//   - diagnostic-validation.ts: validates INPUT shape (answers array,
//     primary profile string, etc.). Does NOT compute scores.
//   - This module: ties them together — validates, then computes,
//     then returns a DB-ready payload.

import {
  calculateFullResults,
  ASSESSMENT_VERSION,
  type FullDiagnosticResult,
} from './full-diagnostic-questions';
import { normalizeAttemptSource, normalizeClassification } from './diagnostic-validation';

/**
 * Output of server-side scoring — everything the DB row needs,
 * nothing it doesn't. Mirrors the DiagnosticResult Prisma model
 * fields that depend on scoring.
 */
export interface ServerScoredResult {
  // Archetype scores (0-100) — title-cased profiles for DB storage
  driverScore: number;
  strategistScore: number;
  connectorScore: number;
  reactorScore: number;
  primaryProfile: string;        // 'Driver' | 'Strategist' | 'Connector' | 'Reactor'
  secondaryProfile: string;      // same set

  // Full Map structured fields
  dimensionScores: Record<string, number>;
  derivedMeasures: FullDiagnosticResult['derivedMeasures'];
  sustainabilityIndex: number;
  profileClassification: string;  // 'strong_primary' | 'blended' | 'balanced' | 'flexible'
  blendedArchetypes: string | null;  // 'Driver+Strategist' format, or null
  responseQualityFlags: FullDiagnosticResult['responseQuality'];

  // Bookkeeping
  assessmentVersion: string;
  attemptSource: 'snapshot' | 'full_map';

  // Full result (for callers that need everything, e.g. recompute-on-read)
  fullResult: FullDiagnosticResult;
}

/**
 * Score a Full Map submission server-side.
 *
 * @param rawAnswers  Array of { questionId, score } from the client.
 *                    Scores must be 1-5. Out-of-range scores are clamped.
 * @param completionTimeSeconds  From the client timer; used for the
 *                               fast-completion response-quality flag.
 * @param clientAttemptSource  What the client claims this is. We honor
 *                             it if valid, else default to 'full_map'.
 *
 * Throws if answers is missing/empty or if fewer than 64 questions are
 * answered (Full Map requires all 64).
 */
export function scoreFullMapServerSide(
  rawAnswers: unknown,
  completionTimeSeconds: number = 0,
  clientAttemptSource?: unknown,
): ServerScoredResult {
  // ---- 1. Validate answers shape ----
  if (!Array.isArray(rawAnswers) || rawAnswers.length === 0) {
    throw new ScoringError('Answers array is required and must not be empty');
  }

  const sanitized: { questionId: number; score: number }[] = [];
  for (const a of rawAnswers) {
    if (!a || typeof a !== 'object') continue;
    const qid = Number((a as Record<string, unknown>).questionId);
    let score = Number((a as Record<string, unknown>).score);
    if (!Number.isFinite(qid) || qid < 1 || qid > 64) continue;
    if (!Number.isFinite(score)) continue;
    // Clamp to 1-5 — Likert range per spec §4
    score = Math.max(1, Math.min(5, Math.round(score)));
    sanitized.push({ questionId: qid, score });
  }

  if (sanitized.length < 64) {
    throw new ScoringError(
      `Full Map requires all 64 questions answered; received ${sanitized.length}`
    );
  }

  // ---- 2. Compute the full multi-layer result ----
  // calculateFullResults is a pure function — safe to call server-side.
  // Missing answers default to 3 (neutral) inside the scorer, but we've
  // already enforced all 64 above so this path won't trigger here.
  const fullResult = calculateFullResults(sanitized, completionTimeSeconds);

  // ---- 3. Title-case archetype names for DB storage ----
  const titleCase = (a: string) => a.charAt(0).toUpperCase() + a.slice(1);
  const primaryProfile = titleCase(fullResult.primaryArchetype);
  const secondaryProfile = titleCase(fullResult.secondaryArchetype);

  // ---- 4. Build the blended-archetypes string (e.g. "Driver+Strategist") ----
  const blendedArchetypes = fullResult.blendedArchetypes
    ? fullResult.blendedArchetypes.map(titleCase).join('+')
    : null;

  // ---- 5. Resolve attemptSource ----
  const attemptSource = normalizeAttemptSource(clientAttemptSource) ?? 'full_map';

  // ---- 6. Normalize classification (already a valid enum from the scorer,
  //         but normalizeClassification gives us a defensive belt+suspenders) ----
  const classification =
    normalizeClassification(fullResult.profileClassification) ??
    'strong_primary';

  return {
    driverScore: fullResult.archetypeScores.driver,
    strategistScore: fullResult.archetypeScores.strategist,
    connectorScore: fullResult.archetypeScores.connector,
    reactorScore: fullResult.archetypeScores.reactor,
    primaryProfile,
    secondaryProfile,
    dimensionScores: { ...fullResult.dimensionScores },
    derivedMeasures: { ...fullResult.derivedMeasures },
    sustainabilityIndex: fullResult.salesWellbeingSustainabilityIndex,
    profileClassification: classification,
    blendedArchetypes,
    responseQualityFlags: { ...fullResult.responseQuality },
    assessmentVersion: ASSESSMENT_VERSION,
    attemptSource,
    fullResult,
  };
}

/**
 * Score a Snapshot (16-question free) submission server-side.
 *
 * The Snapshot uses the same 64-question bank but only the 16 items
 * flagged isSnapshot: true (the .1 of each dimension). We still call
 * calculateFullResults — unanswered questions default to neutral (3),
 * which gives a defensible (if coarser) result. The persisted row is
 * marked attemptSource: 'snapshot' so dashboards can distinguish.
 */
export function scoreSnapshotServerSide(
  rawAnswers: unknown,
  completionTimeSeconds: number = 0,
): ServerScoredResult {
  if (!Array.isArray(rawAnswers) || rawAnswers.length === 0) {
    throw new ScoringError('Answers array is required and must not be empty');
  }

  const sanitized: { questionId: number; score: number }[] = [];
  for (const a of rawAnswers) {
    if (!a || typeof a !== 'object') continue;
    const qid = Number((a as Record<string, unknown>).questionId);
    let score = Number((a as Record<string, unknown>).score);
    if (!Number.isFinite(qid) || qid < 1 || qid > 64) continue;
    if (!Number.isFinite(score)) continue;
    score = Math.max(1, Math.min(5, Math.round(score)));
    sanitized.push({ questionId: qid, score });
  }

  if (sanitized.length < 1) {
    throw new ScoringError('Snapshot requires at least one answer');
  }

  // calculateFullResults handles missing answers as neutral (3). For
  // the Snapshot, only the 16 isSnapshot items will have user-supplied
  // scores; the other 48 will be neutral. The resulting archetype and
  // dimension scores are correspondingly coarser but still meaningful.
  const fullResult = calculateFullResults(sanitized, completionTimeSeconds);

  const titleCase = (a: string) => a.charAt(0).toUpperCase() + a.slice(1);
  const blendedArchetypes = fullResult.blendedArchetypes
    ? fullResult.blendedArchetypes.map(titleCase).join('+')
    : null;

  const classification =
    normalizeClassification(fullResult.profileClassification) ??
    'strong_primary';

  return {
    driverScore: fullResult.archetypeScores.driver,
    strategistScore: fullResult.archetypeScores.strategist,
    connectorScore: fullResult.archetypeScores.connector,
    reactorScore: fullResult.archetypeScores.reactor,
    primaryProfile: titleCase(fullResult.primaryArchetype),
    secondaryProfile: titleCase(fullResult.secondaryArchetype),
    dimensionScores: { ...fullResult.dimensionScores },
    derivedMeasures: { ...fullResult.derivedMeasures },
    sustainabilityIndex: fullResult.salesWellbeingSustainabilityIndex,
    profileClassification: classification,
    blendedArchetypes,
    responseQualityFlags: { ...fullResult.responseQuality },
    assessmentVersion: ASSESSMENT_VERSION,
    attemptSource: 'snapshot',
    fullResult,
  };
}

/**
 * Recompute a DiagnosticResult row from its stored raw answers.
 *
 * Used on read (GET /api/diagnostic) to defend against tampered rows:
 * if a row's stored scores don't match a fresh computation from its
 * raw answers, the fresh computation wins. This makes any past
 * tampered row self-heal the next time it's read.
 *
 * Returns null if the row's answers are missing or unparseable.
 */
export function recomputeFromStoredAnswers(
  storedAnswers: unknown,
  storedCompletionTimeSeconds: number | null | undefined,
): ServerScoredResult | null {
  if (!Array.isArray(storedAnswers) || storedAnswers.length === 0) {
    return null;
  }
  try {
    return scoreFullMapServerSide(
      storedAnswers,
      storedCompletionTimeSeconds ?? 0,
      'full_map',
    );
  } catch {
    return null;
  }
}

export class ScoringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScoringError';
  }
}
