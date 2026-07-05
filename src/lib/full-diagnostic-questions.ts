// src/lib/full-diagnostic-questions.ts
//
// Full Sales Wellbeing Map — 64-question assessment bank.
//
// Source: Appendix A of the "Verso Sales Wellbeing Map - App - Briefing notes"
// document. The briefing explicitly states this is "a sample set of questions
// pulled together very quickly" — they should be reviewed by a psychometric
// specialist before launch.
//
// Architecture:
//   - 16 questions per archetype (Driver / Strategist / Connector / Reactor)
//   - Each question is tagged with a `subDimension` so we can compute Layer 2
//     scores (drill-down within an archetype), not just a single headline
//     score per pattern.
//   - The first 4 questions of each archetype are the existing Snapshot
//     items (kept verbatim from src/app/diagnostic/page.tsx QUESTIONS array)
//     so the free Snapshot can be served from the same question bank by
//     slicing `questions.filter(q => q.isSnapshot)`.
//
// Sub-dimension taxonomy (deliberately shared across archetypes so the
// Phase 3 cross-archetype wellbeing indicators can be derived):
//
//   achievement        — how strongly outcomes drive self-worth
//   pace               — preferred speed of action vs reflection
//   pressure_response  — what happens when the heat is turned up
//   recovery           — ability to switch off / reset after difficult periods
//   motivation         — what fuels the engine (internal vs external)
//   decision_making    — how choices get made under uncertainty
//   confidence         — stability of self-belief
//   relationships      — orientation toward people
//
// Not every sub-dimension applies to every archetype — Driver has no
// `relationships` items, Connector has no `pace` items, etc. That's
// intentional and reflects the framework's design.

export type Archetype = 'driver' | 'strategist' | 'connector' | 'reactor';

export type SubDimension =
  | 'achievement'
  | 'pace'
  | 'pressure_response'
  | 'recovery'
  | 'motivation'
  | 'decision_making'
  | 'confidence'
  | 'relationships';

export interface FullDiagnosticQuestion {
  id: number;            // 1..64, stable
  archetype: Archetype;
  subDimension: SubDimension;
  text: string;
  isSnapshot: boolean;   // true for the 16 questions that also appear in the free Snapshot
}

export const fullDiagnosticQuestions: FullDiagnosticQuestion[] = [
  // ==========================================================================
  // DRIVER (Q1–Q16) — Core Signal: Progress, action, achievement become
  // central to identity and wellbeing.
  // ==========================================================================

  // — Snapshot questions (4) — same wording as src/app/diagnostic/page.tsx
  { id: 1,  archetype: 'driver', subDimension: 'pace',              text: "When things feel uncertain, I would rather act quickly than spend time trying to fully understand the situation.", isSnapshot: true },
  { id: 2,  archetype: 'driver', subDimension: 'pressure_response', text: "When I feel pressure building, my instinct is to push harder, even if I haven't had time to step back and think.", isSnapshot: true },
  { id: 3,  archetype: 'driver', subDimension: 'motivation',        text: "I feel restless or uneasy if I'm not actively doing something to move things forward.", isSnapshot: true },
  { id: 4,  archetype: 'driver', subDimension: 'recovery',          text: "I find it very difficult to fully switch off from work, even when I know I should.", isSnapshot: true },

  // — Depth questions (12) — sourced from Appendix A
  { id: 5,  archetype: 'driver', subDimension: 'motivation',        text: "I become restless when I feel I'm not making visible progress.", isSnapshot: false },
  { id: 6,  archetype: 'driver', subDimension: 'achievement',       text: "I naturally judge my week by what I've achieved.", isSnapshot: false },
  { id: 7,  archetype: 'driver', subDimension: 'motivation',        text: "I feel most energised when I'm working towards ambitious goals.", isSnapshot: false },
  { id: 8,  archetype: 'driver', subDimension: 'achievement',       text: "Success gives me a significant boost in motivation.", isSnapshot: false },
  { id: 9,  archetype: 'driver', subDimension: 'pace',              text: "I become frustrated when decisions take too long.", isSnapshot: false },
  { id: 10, archetype: 'driver', subDimension: 'decision_making',   text: "I would rather move quickly than wait for perfect information.", isSnapshot: false },
  { id: 11, archetype: 'driver', subDimension: 'motivation',        text: "Slow progress affects my motivation.", isSnapshot: false },
  { id: 12, archetype: 'driver', subDimension: 'pressure_response', text: "I naturally push projects forward.", isSnapshot: false },
  { id: 13, archetype: 'driver', subDimension: 'motivation',        text: "Winning motivates me more than recognition.", isSnapshot: false },
  { id: 14, archetype: 'driver', subDimension: 'pressure_response', text: "I naturally take responsibility when things aren't moving.", isSnapshot: false },
  { id: 15, archetype: 'driver', subDimension: 'achievement',       text: "I enjoy situations where success depends on my own effort.", isSnapshot: false },
  { id: 16, archetype: 'driver', subDimension: 'pressure_response', text: "I find it difficult watching others lower their standards.", isSnapshot: false },

  // ==========================================================================
  // STRATEGIST (Q17–Q32) — Core Signal: Clarity, structure and mental
  // processing become central to managing pressure.
  // ==========================================================================

  // — Snapshot questions (4)
  { id: 17, archetype: 'strategist', subDimension: 'decision_making', text: "When things feel unclear, I would rather delay action than move forward without a clear understanding.", isSnapshot: true },
  { id: 18, archetype: 'strategist', subDimension: 'recovery',        text: "I often find myself trying to work out why something happened, even after it's been resolved.", isSnapshot: true },
  { id: 19, archetype: 'strategist', subDimension: 'decision_making', text: "I prefer to have a clear plan before taking action.", isSnapshot: true },
  { id: 20, archetype: 'strategist', subDimension: 'recovery',        text: "It is difficult for me to switch off if I feel something hasn't been fully thought through.", isSnapshot: true },

  // — Depth questions (12)
  { id: 21, archetype: 'strategist', subDimension: 'achievement',     text: "Missing targets affects how I feel about myself.", isSnapshot: false },
  { id: 22, archetype: 'strategist', subDimension: 'pressure_response', text: "I put significant pressure on myself to succeed.", isSnapshot: false },
  { id: 23, archetype: 'strategist', subDimension: 'recovery',        text: "I find it difficult to celebrate achievements before moving on.", isSnapshot: false },
  { id: 24, archetype: 'strategist', subDimension: 'motivation',      text: "I often feel I should be doing more.", isSnapshot: false },
  { id: 25, archetype: 'strategist', subDimension: 'decision_making', text: "I feel calmer when I have a clear plan.", isSnapshot: false },
  { id: 26, archetype: 'strategist', subDimension: 'decision_making', text: "I naturally think several steps ahead.", isSnapshot: false },
  { id: 27, archetype: 'strategist', subDimension: 'pace',            text: "I dislike rushing into decisions.", isSnapshot: false },
  { id: 28, archetype: 'strategist', subDimension: 'pressure_response', text: "Preparation helps me perform at my best.", isSnapshot: false },
  { id: 29, archetype: 'strategist', subDimension: 'decision_making', text: "I naturally question assumptions.", isSnapshot: false },
  { id: 30, archetype: 'strategist', subDimension: 'motivation',      text: "I enjoy solving complex problems.", isSnapshot: false },
  { id: 31, archetype: 'strategist', subDimension: 'decision_making', text: "I like understanding how things work.", isSnapshot: false },
  { id: 32, archetype: 'strategist', subDimension: 'pressure_response', text: "I often spot risks others miss.", isSnapshot: false },

  // ==========================================================================
  // CONNECTOR (Q33–Q48) — Core Signal: Relationships and external
  // processing become central to how pressure is experienced.
  // ==========================================================================

  // — Snapshot questions (4)
  { id: 33, archetype: 'connector', subDimension: 'relationships',   text: "When work feels challenging, I instinctively turn to others rather than working through it alone.", isSnapshot: true },
  { id: 34, archetype: 'connector', subDimension: 'decision_making', text: "I find it difficult to move forward with something if I haven't talked it through with someone.", isSnapshot: true },
  { id: 35, archetype: 'connector', subDimension: 'relationships',   text: "Maintaining trust and connection with others feels as important as achieving the outcome.", isSnapshot: true },
  { id: 36, archetype: 'connector', subDimension: 'recovery',        text: "I can feel emotionally drained after interactions with others at work, even when things seem positive on the surface.", isSnapshot: true },

  // — Depth questions (12)
  { id: 37, archetype: 'connector', subDimension: 'pressure_response', text: "I become uncomfortable when expectations aren't clear.", isSnapshot: false },
  { id: 38, archetype: 'connector', subDimension: 'decision_making', text: "I like understanding the reasoning behind decisions.", isSnapshot: false },
  { id: 39, archetype: 'connector', subDimension: 'confidence',      text: "Uncertainty can make me hesitant.", isSnapshot: false },
  { id: 40, archetype: 'connector', subDimension: 'decision_making', text: "I prefer clarity before committing.", isSnapshot: false },
  { id: 41, archetype: 'connector', subDimension: 'pace',            text: "I'd rather do something properly than quickly.", isSnapshot: false },
  { id: 42, archetype: 'connector', subDimension: 'pressure_response', text: "I notice details that others overlook.", isSnapshot: false },
  { id: 43, archetype: 'connector', subDimension: 'recovery',        text: "I often refine work before sharing it.", isSnapshot: false },
  { id: 44, archetype: 'connector', subDimension: 'achievement',     text: "I value accuracy over speed.", isSnapshot: false },
  { id: 45, archetype: 'connector', subDimension: 'relationships',   text: "Positive relationships are essential for me to do my best work.", isSnapshot: false },
  { id: 46, archetype: 'connector', subDimension: 'relationships',   text: "Conflict affects me more than most people realise.", isSnapshot: false },
  { id: 47, archetype: 'connector', subDimension: 'relationships',   text: "I naturally build rapport quickly.", isSnapshot: false },
  { id: 48, archetype: 'connector', subDimension: 'motivation',      text: "I enjoy helping others succeed.", isSnapshot: false },

  // ==========================================================================
  // REACTOR (Q49–Q64) — Core Signal: Emotional sensitivity to outcomes;
  // confidence and energy fluctuate with results.
  // ==========================================================================

  // — Snapshot questions (4)
  { id: 49, archetype: 'reactor', subDimension: 'confidence',        text: "My confidence is strongly influenced by how things are going at work.", isSnapshot: true },
  { id: 50, archetype: 'reactor', subDimension: 'pressure_response', text: "The outcomes (both the wins and the setbacks) I experience at work can have a noticeable impact on my mood.", isSnapshot: true },
  { id: 51, archetype: 'reactor', subDimension: 'recovery',          text: "When things don't go well, it can affect my energy or focus more than I would like.", isSnapshot: true },
  { id: 52, archetype: 'reactor', subDimension: 'pressure_response', text: "When things are not going well, I can react in ways I later wish I had handled differently.", isSnapshot: true },

  // — Depth questions (12)
  { id: 53, archetype: 'reactor', subDimension: 'recovery',          text: "I prefer solving problems together.", isSnapshot: false },
  { id: 54, archetype: 'reactor', subDimension: 'relationships',     text: "I enjoy bringing people together.", isSnapshot: false },
  { id: 55, archetype: 'reactor', subDimension: 'relationships',     text: "Team morale matters to me.", isSnapshot: false },
  { id: 56, archetype: 'reactor', subDimension: 'motivation',        text: "I often encourage others.", isSnapshot: false },
  { id: 57, archetype: 'reactor', subDimension: 'motivation',        text: "Feeling appreciated influences my motivation.", isSnapshot: false },
  { id: 58, archetype: 'reactor', subDimension: 'relationships',     text: "I notice when others feel excluded.", isSnapshot: false },
  { id: 59, archetype: 'reactor', subDimension: 'relationships',     text: "I often check in with colleagues.", isSnapshot: false },
  { id: 60, archetype: 'reactor', subDimension: 'relationships',     text: "I value feeling connected.", isSnapshot: false },
  { id: 61, archetype: 'reactor', subDimension: 'confidence',        text: "I sometimes avoid difficult conversations.", isSnapshot: false },
  { id: 62, archetype: 'reactor', subDimension: 'relationships',     text: "I dislike tension within teams.", isSnapshot: false },
  { id: 63, archetype: 'reactor', subDimension: 'relationships',     text: "I often compromise to maintain relationships.", isSnapshot: false },
  { id: 64, archetype: 'reactor', subDimension: 'recovery',          text: "I find it difficult when trust breaks down.", isSnapshot: false },
];

// ---------------------------------------------------------------------------
// Response scale — same as the Snapshot (1 = Strongly Disagree → 5 = Strongly Agree)
// ---------------------------------------------------------------------------
export const fullResponseLabels = [
  { value: 5, label: 'Strongly Agree' },
  { value: 4, label: 'Agree' },
  { value: 3, label: 'Neutral' },
  { value: 2, label: 'Disagree' },
  { value: 1, label: 'Strongly Disagree' },
];

// ---------------------------------------------------------------------------
// Scoring — produces 3 layers of insight per the briefing's Appendix B:
//   Layer 1: primary + secondary archetype (overall strength)
//   Layer 2: sub-dimension scores within each archetype
//   Layer 3: cross-archetype wellbeing indicators (stubs for now — needs
//            psychometric sign-off on the cross-loading weights)
// ---------------------------------------------------------------------------

export type ArchetypeScores = Record<Archetype, number>;
export type SubDimensionScores = Record<SubDimension, number>;

export interface FullDiagnosticResult {
  // Layer 1
  archetypeScores: ArchetypeScores;          // 0-100 per archetype
  primaryArchetype: Archetype;
  secondaryArchetype: Archetype;
  confidence: 'strong' | 'moderate' | 'blended';

  // Layer 2
  subDimensionScores: Partial<Record<SubDimension, number>>;  // 0-100 per sub-dimension, aggregated across archetypes

  // Layer 3 — cross-archetype wellbeing indicators (stubs)
  wellbeingIndicators: {
    confidenceStability: number;       // 0-100 (lower = more reactive)
    energySustainability: number;      // 0-100 (lower = more depleted)
    responseToRejection: number;       // 0-100 (lower = more affected)
    toleranceOfUncertainty: number;    // 0-100 (lower = less tolerant)
    overallSalesWellbeingIndex: number; // 0-100 composite
  };

  // Raw inputs preserved for retake comparison
  answers: { questionId: number; score: number; archetype: Archetype; subDimension: SubDimension }[];
  completedAt: string;
}

/**
 * Calculate the full 3-layer result from a set of answers.
 *
 * @param answers Array of { questionId, score (1-5) } — must cover all 64 questions
 *                for a complete result. Partial results are allowed (e.g. snapshot-only)
 *                but Layer 2/3 indicators will be less precise.
 */
export function calculateFullResults(
  answers: { questionId: number; score: number }[]
): FullDiagnosticResult {
  // Index answers by questionId for O(1) lookup
  const answerMap = new Map<number, number>();
  answers.forEach(a => {
    if (a.score >= 1 && a.score <= 5) {
      answerMap.set(a.questionId, a.score);
    }
  });

  // ---- Layer 1: archetype scores (0-100) ----
  // Per-archetype raw = sum of raw answer values across its 16 questions.
  // Higher score = stronger pattern (consistent with the live page.tsx
  // convention, where "Strongly Agree" = 5 = strong pattern).
  // Normalised to 0-100 against the theoretical max (16 × 5 = 80, min = 16 × 1 = 16).
  const archetypeRaw: Record<Archetype, number> = { driver: 0, strategist: 0, connector: 0, reactor: 0 };
  const archetypeCount: Record<Archetype, number> = { driver: 0, strategist: 0, connector: 0, reactor: 0 };

  // ---- Layer 2: sub-dimension raw scores ----
  // Aggregated ACROSS archetypes — each sub-dimension may draw from multiple archetypes.
  const subDimRaw: Record<string, number> = {};
  const subDimCount: Record<string, number> = {};

  const enrichedAnswers: FullDiagnosticResult['answers'] = [];

  for (const q of fullDiagnosticQuestions) {
    const score = answerMap.get(q.id);
    if (score === undefined) continue;

    archetypeRaw[q.archetype] += score;
    archetypeCount[q.archetype] += 1;

    subDimRaw[q.subDimension] = (subDimRaw[q.subDimension] || 0) + score;
    subDimCount[q.subDimension] = (subDimCount[q.subDimension] || 0) + 1;

    enrichedAnswers.push({
      questionId: q.id,
      score,
      archetype: q.archetype,
      subDimension: q.subDimension,
    });
  }

  // Normalise archetype scores to 0-100
  const archetypeScores: ArchetypeScores = {
    driver: normalise(archetypeRaw.driver, archetypeCount.driver),
    strategist: normalise(archetypeRaw.strategist, archetypeCount.strategist),
    connector: normalise(archetypeRaw.connector, archetypeCount.connector),
    reactor: normalise(archetypeRaw.reactor, archetypeCount.reactor),
  };

  // Sort archetypes by score for primary/secondary
  const sorted = (Object.entries(archetypeScores) as [Archetype, number][])
    .sort((a, b) => b[1] - a[1]);
  const primaryArchetype = sorted[0][0];
  const secondaryArchetype = sorted[1][0];
  const gap = sorted[0][1] - sorted[1][1];
  const confidence: FullDiagnosticResult['confidence'] =
    gap >= 15 ? 'strong' : gap >= 7 ? 'moderate' : 'blended';

  // Normalise sub-dimension scores to 0-100
  const subDimensionScores: Partial<Record<SubDimension, number>> = {};
  (Object.keys(subDimRaw) as SubDimension[]).forEach(sd => {
    subDimensionScores[sd] = normalise(subDimRaw[sd], subDimCount[sd]);
  });

  // ---- Layer 3: cross-archetype wellbeing indicators (stubs) ----
  // These are initial heuristics pending psychometric sign-off.
  // Each indicator pulls from a small set of relevant sub-dimensions.
  const confidenceStability = avg(
    100 - (subDimensionScores.confidence ?? 50),
    100 - (archetypeScores.reactor ?? 50),
  );
  const energySustainability = avg(
    100 - (subDimensionScores.recovery ?? 50),
    100 - (subDimensionScores.pressure_response ?? 50) * 0.5,
  );
  const responseToRejection = avg(
    100 - (subDimensionScores.relationships ?? 50),
    100 - (archetypeScores.connector ?? 50) * 0.5,
  );
  const toleranceOfUncertainty = avg(
    100 - (subDimensionScores.decision_making ?? 50) * 0.5,
    100 - (archetypeScores.strategist ?? 50) * 0.5,
  );
  const overallSalesWellbeingIndex = Math.round(
    avg(confidenceStability, energySustainability, responseToRejection, toleranceOfUncertainty)
  );

  return {
    archetypeScores,
    primaryArchetype,
    secondaryArchetype,
    confidence,
    subDimensionScores,
    wellbeingIndicators: {
      confidenceStability: Math.round(confidenceStability),
      energySustainability: Math.round(energySustainability),
      responseToRejection: Math.round(responseToRejection),
      toleranceOfUncertainty: Math.round(toleranceOfUncertainty),
      overallSalesWellbeingIndex,
    },
    answers: enrichedAnswers,
    completedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalise(rawSum: number, count: number): number {
  if (count === 0) return 0;
  // raw per question ranges 1..5 (after inversion), so rawSum/count ∈ [1, 5].
  // Map [1, 5] → [0, 100].
  return Math.round(((rawSum / count) - 1) / 4 * 100);
}

function avg(...nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// ---------------------------------------------------------------------------
// Convenience: get just the Snapshot subset (for the free tier)
// ---------------------------------------------------------------------------
export const snapshotQuestions = fullDiagnosticQuestions.filter(q => q.isSnapshot);
