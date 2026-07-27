// src/lib/full-diagnostic-questions.ts
//
// Verso Sales Wellbeing Map — 64-question assessment bank.
//
// Source: "Verso Sales Wellbeing Map — Product, Assessment and
// Interactive Dashboard Development Brief" (uploaded product spec).
//
// Architecture (per the brief):
//   - 4 archetypes × 4 dimensions × 4 questions = 64 items total
//   - Driver (D1–D4), Strategist (S1–S4),
//     Connector (C1–C4), Reactor (R1–R4)
//   - 5-point Likert scale: Strongly disagree (1) → Strongly agree (5)
//   - 13 reverse-scored items: D4.4, S1.4, S2.4, S3.4, S4.4,
//     C1.4, C2.4, C3.4, C4.4, R1.4, R2.4, R3.4, R4.4
//   - Dimension % = ((raw - 4) / 16) × 100  (raw range 4–20)
//   - Archetype % = ((raw - 16) / 64) × 100 (raw range 16–80)
//   - Mixed presentation order with controlled constraints
//     (no archetype clustering, reverse items distributed)
//
// Stable numeric IDs (1..64) preserve compatibility with the existing
// /api/diagnostic endpoint, which stores answers as
// { questionId: number, score: number }[].

export type Archetype = 'driver' | 'strategist' | 'connector' | 'reactor';

// 16 dimensions — D1..D4, S1..S4, C1..C4, R1..R4
export type DimensionCode =
  | 'D1' | 'D2' | 'D3' | 'D4'
  | 'S1' | 'S2' | 'S3' | 'S4'
  | 'C1' | 'C2' | 'C3' | 'C4'
  | 'R1' | 'R2' | 'R3' | 'R4';

export interface FullDiagnosticQuestion {
  id: number;            // 1..64, stable across all sessions
  code: string;          // 'D1.1', 'D1.2', ..., 'R4.4' — human-readable PDF id
  archetype: Archetype;
  dimension: DimensionCode;
  dimensionLabel: string; // e.g. 'Action and urgency'
  text: string;
  isReverseScored: boolean;
  isSnapshot?: boolean;   // True for the 16 items shared with the free Snapshot
}

// ---------------------------------------------------------------------------
// Human-readable dimension metadata (used by the results page)
// ---------------------------------------------------------------------------
export const DIMENSION_META: Record<DimensionCode, { archetype: Archetype; label: string; description: string }> = {
  D1: { archetype: 'driver',     label: 'Action and urgency',          description: 'How strongly uncertainty triggers immediate action over reflection.' },
  D2: { archetype: 'driver',     label: 'Momentum and achievement',    description: 'How tightly wellbeing is tied to visible progress.' },
  D3: { archetype: 'driver',     label: 'Intensification under pressure', description: 'Tendency to respond to pressure with more pace, hours and effort.' },
  D4: { archetype: 'driver',     label: 'Boundaries and recovery',     description: 'Whether momentum makes it hard to pause, delegate or switch off.' },
  S1: { archetype: 'strategist', label: 'Need for clarity',            description: 'How much confidence and action depend on full understanding.' },
  S2: { archetype: 'strategist', label: 'Analysis and mental processing', description: 'Tendency to examine events and possibilities in depth.' },
  S3: { archetype: 'strategist', label: 'Planning and control',        description: 'How much preparation and structure create confidence.' },
  S4: { archetype: 'strategist', label: 'Standards, risk and completion', description: 'Preference for thoroughness and difficulty releasing incomplete work.' },
  C1: { archetype: 'connector',  label: 'External processing and support-seeking', description: 'How much conversation and collaboration support thinking and regulation.' },
  C2: { archetype: 'connector',  label: 'Relationship priority',       description: 'How strongly trust and connection influence decisions and motivation.' },
  C3: { archetype: 'connector',  label: 'Emotional attunement and labour', description: 'Sensitivity to others\' emotions and the cost of managing dynamics.' },
  C4: { archetype: 'connector',  label: 'Harmony and personal boundaries', description: 'Whether preserving harmony comes at the expense of boundaries.' },
  R1: { archetype: 'reactor',    label: 'Confidence volatility',       description: 'How strongly confidence is influenced by current performance.' },
  R2: { archetype: 'reactor',    label: 'Emotional sensitivity to outcomes', description: 'Emotional intensity associated with wins, losses and setbacks.' },
  R3: { archetype: 'reactor',    label: 'Recovery and rumination',     description: 'Time and mental effort required to recover from difficult outcomes.' },
  R4: { archetype: 'reactor',    label: 'Behavioural reactivity',      description: 'Whether emotional strain changes communication, judgement or behaviour.' },
};

// ---------------------------------------------------------------------------
// The 64-question bank — PDF spec §5.
//
// ID assignment is stable and deterministic:
//   D1.1=1, D1.2=2, D1.3=3, D1.4=4
//   D2.1=5 ... D4.4=16
//   S1.1=17 ... S4.4=32
//   C1.1=33 ... C4.4=48
//   R1.1=49 ... R4.4=64
//
// The 13 reverse-scored items are exactly the ".4" of each dimension.
// The 16 Snapshot items are the ".1" of each dimension (one per dimension).
// ---------------------------------------------------------------------------
export const fullDiagnosticQuestions: FullDiagnosticQuestion[] = [
  // ─── DRIVER ──────────────────────────────────────────────────────────────
  // D1: Action and urgency
  { id: 1,  code: 'D1.1', archetype: 'driver', dimension: 'D1', dimensionLabel: 'Action and urgency', isReverseScored: false, isSnapshot: true,  text: 'When things feel uncertain, I would rather act quickly than spend time trying to understand the situation fully.' },
  { id: 2,  code: 'D1.2', archetype: 'driver', dimension: 'D1', dimensionLabel: 'Action and urgency', isReverseScored: false, text: 'I find it very difficult to wait when I believe something could be moved forward immediately.' },
  { id: 3,  code: 'D1.3', archetype: 'driver', dimension: 'D1', dimensionLabel: 'Action and urgency', isReverseScored: false, text: 'Under pressure, my instinct is to make something happen, even if the approach still needs refining.' },
  { id: 4,  code: 'D1.4', archetype: 'driver', dimension: 'D1', dimensionLabel: 'Action and urgency', isReverseScored: false, text: 'I would usually rather correct course later than lose momentum by waiting for complete certainty.' },

  // D2: Momentum and achievement
  { id: 5,  code: 'D2.1', archetype: 'driver', dimension: 'D2', dimensionLabel: 'Momentum and achievement', isReverseScored: false, isSnapshot: true,  text: 'I feel restless or uneasy if I am not actively doing something to move work forward.' },
  { id: 6,  code: 'D2.2', archetype: 'driver', dimension: 'D2', dimensionLabel: 'Momentum and achievement', isReverseScored: false, text: 'A day without visible progress can feel unproductive to me, even if important thinking or relationship-building has taken place.' },
  { id: 7,  code: 'D2.3', archetype: 'driver', dimension: 'D2', dimensionLabel: 'Momentum and achievement', isReverseScored: false, text: 'Achieving a difficult result gives me a noticeable lift in energy and motivation.' },
  { id: 8,  code: 'D2.4', archetype: 'driver', dimension: 'D2', dimensionLabel: 'Momentum and achievement', isReverseScored: false, text: 'I quickly move on to the next goal rather than spending much time acknowledging what I have already achieved.' },

  // D3: Intensification under pressure
  { id: 9,  code: 'D3.1', archetype: 'driver', dimension: 'D3', dimensionLabel: 'Intensification under pressure', isReverseScored: false, isSnapshot: true,  text: 'When I feel pressure building, my instinct is to push harder, even if I have not had time to step back and think.' },
  { id: 10, code: 'D3.2', archetype: 'driver', dimension: 'D3', dimensionLabel: 'Intensification under pressure', isReverseScored: false, text: 'When results are not where I want them to be, I tend to increase my workload rather than reduce or reassess it.' },
  { id: 11, code: 'D3.3', archetype: 'driver', dimension: 'D3', dimensionLabel: 'Intensification under pressure', isReverseScored: false, text: 'I am likely to work longer hours when I feel that progress or performance is slipping.' },
  { id: 12, code: 'D3.4', archetype: 'driver', dimension: 'D3', dimensionLabel: 'Intensification under pressure', isReverseScored: false, text: 'I can find myself taking on more responsibility because I trust myself to get things moving.' },

  // D4: Boundaries and recovery
  { id: 13, code: 'D4.1', archetype: 'driver', dimension: 'D4', dimensionLabel: 'Boundaries and recovery', isReverseScored: false, isSnapshot: true,  text: 'I find it very difficult to switch off fully from work, even when I know I should.' },
  { id: 14, code: 'D4.2', archetype: 'driver', dimension: 'D4', dimensionLabel: 'Boundaries and recovery', isReverseScored: false, text: 'Slowing down can make me feel uncomfortable, even when rest would probably help me perform better.' },
  { id: 15, code: 'D4.3', archetype: 'driver', dimension: 'D4', dimensionLabel: 'Boundaries and recovery', isReverseScored: false, text: 'I can become impatient with people whose pace feels slower than mine.' },
  { id: 16, code: 'D4.4', archetype: 'driver', dimension: 'D4', dimensionLabel: 'Boundaries and recovery', isReverseScored: true,  text: 'I am comfortable leaving a task unfinished until the next working day when continuing would come at the expense of rest or recovery.' },

  // ─── STRATEGIST ───────────────────────────────────────────────────────────
  // S1: Need for clarity
  { id: 17, code: 'S1.1', archetype: 'strategist', dimension: 'S1', dimensionLabel: 'Need for clarity', isReverseScored: false, isSnapshot: true,  text: 'When things feel unclear, I would rather delay action than move forward without a clear understanding.' },
  { id: 18, code: 'S1.2', archetype: 'strategist', dimension: 'S1', dimensionLabel: 'Need for clarity', isReverseScored: false, text: 'I find it difficult to commit to a course of action when important information is still missing.' },
  { id: 19, code: 'S1.3', archetype: 'strategist', dimension: 'S1', dimensionLabel: 'Need for clarity', isReverseScored: false, text: 'Unclear expectations can occupy a significant amount of my attention until they are resolved.' },
  { id: 20, code: 'S1.4', archetype: 'strategist', dimension: 'S1', dimensionLabel: 'Need for clarity', isReverseScored: true,  text: 'I am generally comfortable moving forward while the direction, expectations or likely outcome remain unclear.' },

  // S2: Analysis and mental processing
  { id: 21, code: 'S2.1', archetype: 'strategist', dimension: 'S2', dimensionLabel: 'Analysis and mental processing', isReverseScored: false, isSnapshot: true,  text: 'I often find myself trying to work out why something happened, even after it has been resolved.' },
  { id: 22, code: 'S2.2', archetype: 'strategist', dimension: 'S2', dimensionLabel: 'Analysis and mental processing', isReverseScored: false, text: 'I can spend a long time considering different explanations before deciding what I think.' },
  { id: 23, code: 'S2.3', archetype: 'strategist', dimension: 'S2', dimensionLabel: 'Analysis and mental processing', isReverseScored: false, text: 'I frequently revisit decisions to check whether I may have missed something important.' },
  { id: 24, code: 'S2.4', archetype: 'strategist', dimension: 'S2', dimensionLabel: 'Analysis and mental processing', isReverseScored: true,  text: 'Once a decision has been made, I rarely feel the need to examine it again.' },

  // S3: Planning and control
  { id: 25, code: 'S3.1', archetype: 'strategist', dimension: 'S3', dimensionLabel: 'Planning and control', isReverseScored: false, isSnapshot: true,  text: 'I feel noticeably less in control when I do not have a clear plan or approach.' },
  { id: 26, code: 'S3.2', archetype: 'strategist', dimension: 'S3', dimensionLabel: 'Planning and control', isReverseScored: false, text: 'Before taking action, I naturally think through several possible outcomes and how I would respond to each.' },
  { id: 27, code: 'S3.3', archetype: 'strategist', dimension: 'S3', dimensionLabel: 'Planning and control', isReverseScored: false, text: 'Sudden changes are harder for me to manage when I have not had time to reorganise my thinking.' },
  { id: 28, code: 'S3.4', archetype: 'strategist', dimension: 'S3', dimensionLabel: 'Planning and control', isReverseScored: true,  text: 'Detailed plans can feel restrictive to me; I prefer to work things out as I go.' },

  // S4: Standards, risk and completion
  { id: 29, code: 'S4.1', archetype: 'strategist', dimension: 'S4', dimensionLabel: 'Standards, risk and completion', isReverseScored: false, isSnapshot: true,  text: 'It is difficult for me to switch off if I feel something has not been fully thought through.' },
  { id: 30, code: 'S4.2', archetype: 'strategist', dimension: 'S4', dimensionLabel: 'Standards, risk and completion', isReverseScored: false, text: 'I would rather take longer and feel confident in the quality of a decision than act quickly and risk overlooking something.' },
  { id: 31, code: 'S4.3', archetype: 'strategist', dimension: 'S4', dimensionLabel: 'Standards, risk and completion', isReverseScored: false, text: 'I often notice gaps, risks or inconsistencies that other people appear comfortable moving past.' },
  { id: 32, code: 'S4.4', archetype: 'strategist', dimension: 'S4', dimensionLabel: 'Standards, risk and completion', isReverseScored: true,  text: 'I am comfortable sharing work that is still rough if doing so helps maintain pace.' },

  // ─── CONNECTOR ────────────────────────────────────────────────────────────
  // C1: External processing and support-seeking
  { id: 33, code: 'C1.1', archetype: 'connector', dimension: 'C1', dimensionLabel: 'External processing and support-seeking', isReverseScored: false, isSnapshot: true,  text: 'When work feels challenging, I instinctively turn to others rather than working through it alone.' },
  { id: 34, code: 'C1.2', archetype: 'connector', dimension: 'C1', dimensionLabel: 'External processing and support-seeking', isReverseScored: false, text: 'I find it difficult to move forward with something important if I have not had the chance to talk it through with someone.' },
  { id: 35, code: 'C1.3', archetype: 'connector', dimension: 'C1', dimensionLabel: 'External processing and support-seeking', isReverseScored: false, text: 'Speaking to somebody I trust often changes how manageable a work problem feels.' },
  { id: 36, code: 'C1.4', archetype: 'connector', dimension: 'C1', dimensionLabel: 'External processing and support-seeking', isReverseScored: true,  text: 'I usually process difficult work situations best by keeping them to myself.' },

  // C2: Relationship priority
  { id: 37, code: 'C2.1', archetype: 'connector', dimension: 'C2', dimensionLabel: 'Relationship priority', isReverseScored: false, isSnapshot: true,  text: 'Maintaining trust and connection with others can feel as important to me as achieving the outcome.' },
  { id: 38, code: 'C2.2', archetype: 'connector', dimension: 'C2', dimensionLabel: 'Relationship priority', isReverseScored: false, text: 'I can find it difficult to take a commercially necessary action if I believe it may damage an important relationship.' },
  { id: 39, code: 'C2.3', archetype: 'connector', dimension: 'C2', dimensionLabel: 'Relationship priority', isReverseScored: false, text: 'My motivation is noticeably affected when I feel disconnected from my colleagues, clients or manager.' },
  { id: 40, code: 'C2.4', archetype: 'connector', dimension: 'C2', dimensionLabel: 'Relationship priority', isReverseScored: true,  text: 'I can comfortably prioritise the commercial outcome even when it creates tension in an important relationship.' },

  // C3: Emotional attunement and labour
  { id: 41, code: 'C3.1', archetype: 'connector', dimension: 'C3', dimensionLabel: 'Emotional attunement and labour', isReverseScored: false, isSnapshot: true,  text: 'I can feel emotionally drained after interactions with others at work, even when things appear positive on the surface.' },
  { id: 42, code: 'C3.2', archetype: 'connector', dimension: 'C3', dimensionLabel: 'Emotional attunement and labour', isReverseScored: false, text: 'I quickly notice changes in another person\'s mood, tone or level of engagement.' },
  { id: 43, code: 'C3.3', archetype: 'connector', dimension: 'C3', dimensionLabel: 'Emotional attunement and labour', isReverseScored: false, text: 'I often carry the emotional tone of a difficult conversation with me after it has ended.' },
  { id: 44, code: 'C3.4', archetype: 'connector', dimension: 'C3', dimensionLabel: 'Emotional attunement and labour', isReverseScored: true,  text: 'Other people\'s emotions rarely affect my own energy or focus.' },

  // C4: Harmony and personal boundaries
  { id: 45, code: 'C4.1', archetype: 'connector', dimension: 'C4', dimensionLabel: 'Harmony and personal boundaries', isReverseScored: false, isSnapshot: true,  text: 'I sometimes avoid raising an issue because I do not want to create discomfort or tension.' },
  { id: 46, code: 'C4.2', archetype: 'connector', dimension: 'C4', dimensionLabel: 'Harmony and personal boundaries', isReverseScored: false, text: 'I can take on more than is sustainable because I do not want to let other people down.' },
  { id: 47, code: 'C4.3', archetype: 'connector', dimension: 'C4', dimensionLabel: 'Harmony and personal boundaries', isReverseScored: false, text: 'I find it difficult to say no when someone asks for my help, even when my own workload is already high.' },
  { id: 48, code: 'C4.4', archetype: 'connector', dimension: 'C4', dimensionLabel: 'Harmony and personal boundaries', isReverseScored: true,  text: 'I can set a firm boundary without feeling responsible for the other person\'s reaction.' },

  // ─── REACTOR ─────────────────────────────────────────────────────────────
  // R1: Confidence volatility
  { id: 49, code: 'R1.1', archetype: 'reactor', dimension: 'R1', dimensionLabel: 'Confidence volatility', isReverseScored: false, isSnapshot: true,  text: 'My confidence is strongly influenced by how things are going at work.' },
  { id: 50, code: 'R1.2', archetype: 'reactor', dimension: 'R1', dimensionLabel: 'Confidence volatility', isReverseScored: false, text: 'A difficult result can make me question abilities that I felt confident about only recently.' },
  { id: 51, code: 'R1.3', archetype: 'reactor', dimension: 'R1', dimensionLabel: 'Confidence volatility', isReverseScored: false, text: 'Positive outcomes can create a significant lift in my self-belief.' },
  { id: 52, code: 'R1.4', archetype: 'reactor', dimension: 'R1', dimensionLabel: 'Confidence volatility', isReverseScored: true,  text: 'My view of my own ability remains broadly stable, even during a poor run of results.' },

  // R2: Emotional sensitivity to outcomes
  { id: 53, code: 'R2.1', archetype: 'reactor', dimension: 'R2', dimensionLabel: 'Emotional sensitivity to outcomes', isReverseScored: false, isSnapshot: true,  text: 'The outcomes I experience at work, both wins and setbacks, can have a noticeable impact on my mood.' },
  { id: 54, code: 'R2.2', archetype: 'reactor', dimension: 'R2', dimensionLabel: 'Emotional sensitivity to outcomes', isReverseScored: false, text: 'I experience the highs and lows of sales more intensely than I usually show to other people.' },
  { id: 55, code: 'R2.3', archetype: 'reactor', dimension: 'R2', dimensionLabel: 'Emotional sensitivity to outcomes', isReverseScored: false, text: 'When something important goes wrong, the emotional impact can feel out of proportion to the event itself.' },
  { id: 56, code: 'R2.4', archetype: 'reactor', dimension: 'R2', dimensionLabel: 'Emotional sensitivity to outcomes', isReverseScored: true,  text: 'I can usually treat a disappointing outcome as simply part of the job without it affecting me emotionally.' },

  // R3: Recovery and rumination
  { id: 57, code: 'R3.1', archetype: 'reactor', dimension: 'R3', dimensionLabel: 'Recovery and rumination', isReverseScored: false, isSnapshot: true,  text: 'When things do not go well, they can affect my energy or focus more than I would like.' },
  { id: 58, code: 'R3.2', archetype: 'reactor', dimension: 'R3', dimensionLabel: 'Recovery and rumination', isReverseScored: false, text: 'I often replay difficult conversations, decisions or outcomes after the working day has ended.' },
  { id: 59, code: 'R3.3', archetype: 'reactor', dimension: 'R3', dimensionLabel: 'Recovery and rumination', isReverseScored: false, text: 'It can take me a while to feel like myself again after a significant setback.' },
  { id: 60, code: 'R3.4', archetype: 'reactor', dimension: 'R3', dimensionLabel: 'Recovery and rumination', isReverseScored: true,  text: 'Once a difficult situation has ended, I am generally able to leave it behind quickly.' },

  // R4: Behavioural reactivity
  { id: 61, code: 'R4.1', archetype: 'reactor', dimension: 'R4', dimensionLabel: 'Behavioural reactivity', isReverseScored: false, isSnapshot: true,  text: 'When things are not going well, I can react in ways I later wish I had handled differently.' },
  { id: 62, code: 'R4.2', archetype: 'reactor', dimension: 'R4', dimensionLabel: 'Behavioural reactivity', isReverseScored: false, text: 'During a difficult period, I can become more withdrawn, impatient or defensive than usual.' },
  { id: 63, code: 'R4.3', archetype: 'reactor', dimension: 'R4', dimensionLabel: 'Behavioural reactivity', isReverseScored: false, text: 'My decision-making can become less consistent when I am emotionally invested in the outcome.' },
  { id: 64, code: 'R4.4', archetype: 'reactor', dimension: 'R4', dimensionLabel: 'Behavioural reactivity', isReverseScored: true,  text: 'Even when I feel disappointed or under pressure, my behaviour remains broadly consistent.' },
];

// ---------------------------------------------------------------------------
// Response scale (PDF spec §4)
// ---------------------------------------------------------------------------
export const RESPONSE_SCALE = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither agree nor disagree' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
] as const;

// Reverse-score map: raw → scored (1↔5, 2↔4, 3↔3, 4↔2, 5↔1)
export function reverseScore(raw: number): number {
  return 6 - raw;
}

// ---------------------------------------------------------------------------
// Subset for the free Snapshot (16 questions — the .1 of each dimension).
// ---------------------------------------------------------------------------
export const snapshotQuestions = fullDiagnosticQuestions.filter(q => q.isSnapshot);

// ---------------------------------------------------------------------------
// Constrained shuffle (PDF spec §6).
//
// Constraints:
//   1. Max 2 questions from the same archetype consecutively.
//   2. Don't place a standard and reverse-worded version of the same concept
//      next to one another (we interpret "same concept" as "same dimension").
//   3. Don't display all reverse-scored questions together (no more than 2
//      reverse items in a row).
//
// Implementation: greedy randomised construction with restart-on-stuck.
// Deterministic given the same seed; client uses Date.now() as seed.
// ---------------------------------------------------------------------------
export function shuffleQuestions(seed: number = Date.now()): FullDiagnosticQuestion[] {
  const rng = mulberry32(seed);
  // Try up to 20 attempts; if all fail (extremely unlikely with 64 items),
  // fall back to the last partial attempt.
  for (let attempt = 0; attempt < 20; attempt++) {
    const pool = [...fullDiagnosticQuestions];
    const result: FullDiagnosticQuestion[] = [];
    let stuck = false;
    while (pool.length > 0) {
      // Find candidates that satisfy the constraints given the current tail.
      const valid = pool.filter(q => isValidNext(q, result));
      if (valid.length === 0) { stuck = true; break; }
      // Pick a random valid candidate (slight preference for items that
      // haven't been delayed, but valid[] is already filtered to those that
      // satisfy constraints, so this is just uniform random among them).
      const pick = valid[Math.floor(rng() * valid.length)];
      result.push(pick);
      pool.splice(pool.indexOf(pick), 1);
    }
    if (!stuck && result.length === fullDiagnosticQuestions.length) {
      return result;
    }
  }
  // Fallback: deterministic PDF order (no shuffle). Should never hit this
  // with 64 items and 4 archetypes, but we want a guaranteed return.
  return [...fullDiagnosticQuestions];
}

// Check whether `next` can follow `tail` without violating constraints.
function isValidNext(next: FullDiagnosticQuestion, tail: FullDiagnosticQuestion[]): boolean {
  const n = tail.length;
  // Constraint 1: max 2 same-archetype consecutive.
  if (n >= 2) {
    const last1 = tail[n - 1];
    const last2 = tail[n - 2];
    if (last1.archetype === next.archetype && last2.archetype === next.archetype) {
      return false;
    }
  }
  // Constraint 2: don't place a standard and reverse item of the same
  // dimension back-to-back (and vice versa).
  if (n >= 1) {
    const last = tail[n - 1];
    if (last.dimension === next.dimension && last.isReverseScored !== next.isReverseScored) {
      return false;
    }
  }
  // Constraint 3: max 2 reverse-scored in a row.
  if (n >= 2 && next.isReverseScored) {
    const last1 = tail[n - 1];
    const last2 = tail[n - 2];
    if (last1.isReverseScored && last2.isReverseScored) {
      return false;
    }
  }
  return true;
}

// Small deterministic PRNG (Mulberry32) so the shuffle is reproducible
// given a seed. We expose this rather than Math.random() so unit tests
// can pin the order.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Band classifications (PDF spec §8 + §9.3 + §10)
// ---------------------------------------------------------------------------
export type DimensionBand = 'low' | 'mild' | 'moderate' | 'strong' | 'very_strong';
export type SustainabilityBand = 'strongly_sustainable' | 'generally_sustainable' | 'mixed' | 'several_pressure_points' | 'significant_pressure';
export type ConfidenceStabilityBand = 'generally_stable' | 'mostly_stable' | 'can_fluctuate' | 'outcome_sensitive' | 'highly_outcome_sensitive';
export type WellbeingPressureLevel = 'low' | 'emerging' | 'moderate' | 'elevated';
export type ProfileClassification = 'strong_primary' | 'blended' | 'balanced' | 'flexible';

export function dimensionBand(pct: number): DimensionBand {
  if (pct >= 75) return 'very_strong';
  if (pct >= 60) return 'strong';
  if (pct >= 45) return 'moderate';
  if (pct >= 25) return 'mild';
  return 'low';
}

export function sustainabilityBand(score: number): SustainabilityBand {
  if (score >= 80) return 'strongly_sustainable';
  if (score >= 65) return 'generally_sustainable';
  if (score >= 50) return 'mixed';
  if (score >= 35) return 'several_pressure_points';
  return 'significant_pressure';
}

export function confidenceStabilityBand(score: number): ConfidenceStabilityBand {
  if (score >= 75) return 'generally_stable';
  if (score >= 60) return 'mostly_stable';
  if (score >= 45) return 'can_fluctuate';
  if (score >= 25) return 'outcome_sensitive';
  return 'highly_outcome_sensitive';
}

export const BAND_LABELS: Record<DimensionBand, string> = {
  low: 'Low expression',
  mild: 'Mild expression',
  moderate: 'Moderate expression',
  strong: 'Strong expression',
  very_strong: 'Very strong expression',
};

export const SUSTAINABILITY_LABELS: Record<SustainabilityBand, string> = {
  strongly_sustainable: 'Strongly sustainable pattern',
  generally_sustainable: 'Generally sustainable',
  mixed: 'Mixed sustainability',
  several_pressure_points: 'Several pressure points',
  significant_pressure: 'Significant pressure pattern',
};

export const PRESSURE_LABELS: Record<WellbeingPressureLevel, string> = {
  low: 'Low',
  emerging: 'Emerging',
  moderate: 'Moderate',
  elevated: 'Elevated',
};

// ---------------------------------------------------------------------------
// Full result shape — mirrors what gets stored in DiagnosticResult.derivedMeasures
// and localStorage('fullDiagnosticResults').
// ---------------------------------------------------------------------------
export interface DerivedMeasures {
  // Primary wellbeing measures (each 0-100)
  confidenceStability: number;         // 100 - R1%
  energySustainability: number;        // 100 - mean(D3, D4, R3)
  recoveryCapacity: number;            // 100 - (0.6*R3 + 0.2*D4 + 0.1*R1.2 + 0.1*R4.2)
  boundarySustainability: number;      // 100 - mean(D4, C4)
  toleranceOfUncertainty: number;      // 100 - mean(S1, S3)
  behaviouralStability: number;        // 100 - mean(R4, max(D3, S2, C4))
  setbackRecovery: number;             // 100 - mean(R1, R2, R3)
  relationshipOrientation: number;     // mean(C1, C2, C3, C4)
  emotionalLabourLoad: number;         // mean(C3, C4.2, C4.3, R3.2)
  abilityToSwitchOff: number;          // 100 - mean(D4.1, D4.2, S4.1, C3.3, R3.2, R3.3, R3.4)
  needForCertainty: number;            // mean(S1, S3)

  // Multi-component profiles
  responseToPressure: {
    action: number;      // mean(D1, D3)
    analysis: number;    // mean(S1, S2)
    connection: number;  // mean(C1, C3)
    emotional: number;   // mean(R2, R4)
  };
  decisionStyle: {
    fast: number;                  // D1
    analytical: number;            // mean(S1, S2, S4)
    collaborative: number;         // mean(C1, C2)
    emotionallyInfluenced: number; // mean(R2, R4)
  };
}

export interface ResponseQualityFlags {
  fastCompletion: boolean;       // < 4 minutes (240 seconds)
  straightLining: boolean;       // > 85% same option
  excessiveNeutrality: boolean;  // > 60% neutral (value 3)
  hasFlags: boolean;
  completionTimeSeconds: number;
}

export interface FullDiagnosticResult {
  // Layer 1: Archetype scores
  archetypeScores: Record<Archetype, number>;        // 0-100
  archetypeRawScores: Record<Archetype, number>;     // 16-80
  primaryArchetype: Archetype;
  secondaryArchetype: Archetype;
  profileClassification: ProfileClassification;
  blendedArchetypes?: [Archetype, Archetype];
  profileSummaryText: string;

  // Layer 2: Dimension scores (16 dimensions, 0-100 each)
  dimensionScores: Record<DimensionCode, number>;
  dimensionBands: Record<DimensionCode, DimensionBand>;

  // Layer 3: Derived dashboard measures (all 0-100)
  derivedMeasures: DerivedMeasures;

  // Composite index (0-100)
  salesWellbeingSustainabilityIndex: number;
  sustainabilityBand: SustainabilityBand;

  // Pressure indicator
  wellbeingPressureIndicator: WellbeingPressureLevel;

  // Response quality
  responseQuality: ResponseQualityFlags;

  // Raw inputs preserved (PDF spec §21)
  answers: {
    questionId: number;
    code: string;
    archetype: Archetype;
    dimension: DimensionCode;
    isReverseScored: boolean;
    rawResponse: number;   // 1-5 user's actual selection
    scoredValue: number;   // 1-5 after reverse-scoring if applicable
  }[];

  assessmentVersion: string;
  completedAt: string;
}

export const ASSESSMENT_VERSION = 'verso-swm-v1.0';

// ---------------------------------------------------------------------------
// Calculate the full multi-layer result from a set of answers.
//
// @param answers Array of { questionId, score (1-5) } — must cover all 64
//                questions for a complete result. Missing answers are
//                treated as neutral (3) — matches the existing snapshot
//                page behaviour and the spec's "unanswered = neutral" rule.
// @param completionTimeSeconds Optional — used for the fast-completion flag.
// ---------------------------------------------------------------------------
export function calculateFullResults(
  answers: { questionId: number; score: number }[],
  completionTimeSeconds: number = 0,
): FullDiagnosticResult {
  // Index answers by questionId for O(1) lookup. Missing answers default
  // to 3 (neutral), which matches the existing snapshot page's behaviour
  // and prevents partial results from crashing the scorer.
  const answerMap = new Map<number, number>();
  answers.forEach(a => {
    if (a.score >= 1 && a.score <= 5) {
      answerMap.set(a.questionId, a.score);
    }
  });

  // ---- Helper: scored value for a question (after reverse-scoring) ----
  const scoredValue = (q: FullDiagnosticQuestion): number => {
    const raw = answerMap.get(q.id) ?? 3;
    return q.isReverseScored ? reverseScore(raw) : raw;
  };
  const rawValue = (q: FullDiagnosticQuestion): number => answerMap.get(q.id) ?? 3;

  // ---- Compute dimension raw scores + percentages ----
  // Each dimension has 4 questions; raw range 4-20; percentage = ((raw-4)/16)*100.
  const dimensionRaw: Record<DimensionCode, number> = {} as Record<DimensionCode, number>;
  const dimensionScores: Record<DimensionCode, number> = {} as Record<DimensionCode, number>;
  const dimensionBands: Record<DimensionCode, DimensionBand> = {} as Record<DimensionCode, DimensionBand>;

  const allDimensions: DimensionCode[] = ['D1','D2','D3','D4','S1','S2','S3','S4','C1','C2','C3','C4','R1','R2','R3','R4'];
  for (const dim of allDimensions) {
    const dimQuestions = fullDiagnosticQuestions.filter(q => q.dimension === dim);
    const raw = dimQuestions.reduce((sum, q) => sum + scoredValue(q), 0);
    const pct = clampPct(((raw - 4) / 16) * 100);
    dimensionRaw[dim] = raw;
    dimensionScores[dim] = pct;
    dimensionBands[dim] = dimensionBand(pct);
  }

  // ---- Compute archetype raw scores + percentages ----
  // Each archetype has 16 questions; raw range 16-80; percentage = ((raw-16)/64)*100.
  const archetypeRaw: Record<Archetype, number> = { driver: 0, strategist: 0, connector: 0, reactor: 0 };
  for (const q of fullDiagnosticQuestions) {
    archetypeRaw[q.archetype] += scoredValue(q);
  }
  const archetypeScores: Record<Archetype, number> = {
    driver:     clampPct(((archetypeRaw.driver     - 16) / 64) * 100),
    strategist: clampPct(((archetypeRaw.strategist - 16) / 64) * 100),
    connector:  clampPct(((archetypeRaw.connector  - 16) / 64) * 100),
    reactor:    clampPct(((archetypeRaw.reactor    - 16) / 64) * 100),
  };

  // Sort archetypes by score (desc) for primary/secondary
  const sorted = (Object.entries(archetypeScores) as [Archetype, number][])
    .sort((a, b) => b[1] - a[1]);
  const primaryArchetype = sorted[0][0];
  const secondaryArchetype = sorted[1][0];
  const topScore = sorted[0][1];
  const secondScore = sorted[1][1];
  const minScore = sorted[3][1];

  // ---- Profile classification (PDF spec §8) ----
  let profileClassification: ProfileClassification;
  let blendedArchetypes: [Archetype, Archetype] | undefined;
  if (topScore - secondScore <= 5 || (topScore > 75 && secondScore > 75)) {
    profileClassification = 'blended';
    blendedArchetypes = [primaryArchetype, secondaryArchetype];
  } else if (topScore - minScore < 15 && topScore <= 70) {
    profileClassification = 'balanced';
  } else if (topScore <= 55) {
    profileClassification = 'flexible';
  } else {
    profileClassification = 'strong_primary';
  }

  const profileSummaryText = buildProfileSummary(
    profileClassification, primaryArchetype, secondaryArchetype, topScore, secondScore, blendedArchetypes
  );

  // ---- Derived measures (PDF spec §10) ----
  const dim = (code: DimensionCode) => dimensionScores[code];
  const qScoredPct = (code: string) => {
    // Single-question scored value → 0-100
    const q = fullDiagnosticQuestions.find(q => q.code === code);
    if (!q) return 50;
    return clampPct(((scoredValue(q) - 1) / 4) * 100);
  };

  const confidenceStability = clampPct(100 - dim('R1'));
  const energySustainability = clampPct(100 - mean(dim('D3'), dim('D4'), dim('R3')));
  const needForCertainty = clampPct(mean(dim('S1'), dim('S3')));
  const toleranceOfUncertainty = clampPct(100 - needForCertainty);
  const setbackRecovery = clampPct(100 - mean(dim('R1'), dim('R2'), dim('R3')));
  const relationshipOrientation = clampPct(mean(dim('C1'), dim('C2'), dim('C3'), dim('C4')));
  const boundarySustainability = clampPct(100 - mean(dim('D4'), dim('C4')));

  // Recovery Capacity: 0.6*R3 + 0.2*D4 + 0.1*R1.2 + 0.1*R4.2
  const recoveryCapacity = clampPct(
    100 - (0.6 * dim('R3') + 0.2 * dim('D4') + 0.1 * qScoredPct('R1.2') + 0.1 * qScoredPct('R4.2'))
  );

  // Emotional Labour Load: mean(C3, C4.2, C4.3, R3.2)
  const emotionalLabourLoad = clampPct(
    mean(dim('C3'), qScoredPct('C4.2'), qScoredPct('C4.3'), qScoredPct('R3.2'))
  );

  // Work Spillover: mean(D4.1, D4.2, S4.1, C3.3, R3.2, R3.3, R3.4)
  // Ability to Switch Off = 100 - Work Spillover
  const workSpillover = clampPct(
    mean(
      qScoredPct('D4.1'), qScoredPct('D4.2'), qScoredPct('S4.1'),
      qScoredPct('C3.3'), qScoredPct('R3.2'), qScoredPct('R3.3'), qScoredPct('R3.4'),
    )
  );
  const abilityToSwitchOff = clampPct(100 - workSpillover);

  // Behavioural Stability: 100 - mean(R4, max(D3, S2, C4))
  const behaviouralStability = clampPct(
    100 - mean(dim('R4'), Math.max(dim('D3'), dim('S2'), dim('C4')))
  );

  // Multi-component profiles
  const responseToPressure = {
    action:     clampPct(mean(dim('D1'), dim('D3'))),
    analysis:   clampPct(mean(dim('S1'), dim('S2'))),
    connection: clampPct(mean(dim('C1'), dim('C3'))),
    emotional:  clampPct(mean(dim('R2'), dim('R4'))),
  };
  const decisionStyle = {
    fast:                  clampPct(dim('D1')),
    analytical:            clampPct(mean(dim('S1'), dim('S2'), dim('S4'))),
    collaborative:         clampPct(mean(dim('C1'), dim('C2'))),
    emotionallyInfluenced: clampPct(mean(dim('R2'), dim('R4'))),
  };

  const derivedMeasures: DerivedMeasures = {
    confidenceStability,
    energySustainability,
    recoveryCapacity,
    boundarySustainability,
    toleranceOfUncertainty,
    behaviouralStability,
    setbackRecovery,
    relationshipOrientation,
    emotionalLabourLoad,
    abilityToSwitchOff,
    needForCertainty,
    responseToPressure,
    decisionStyle,
  };

  // ---- Sales Wellbeing Sustainability Index (PDF spec §9.3) ----
  const salesWellbeingSustainabilityIndex = clampPct(Math.round(
    0.20 * confidenceStability +
    0.20 * energySustainability +
    0.20 * recoveryCapacity +
    0.15 * boundarySustainability +
    0.10 * toleranceOfUncertainty +
    0.15 * behaviouralStability
  ));

  // ---- Wellbeing Pressure Indicator (PDF spec §11) ----
  // Count how many contributing indicators are in the "concerning" range.
  const concerningCount = [
    confidenceStability < 50,
    energySustainability < 50,
    recoveryCapacity < 50,
    boundarySustainability < 50,
    emotionalLabourLoad > 60,
    behaviouralStability < 50,
  ].filter(Boolean).length;

  const wellbeingPressureIndicator: WellbeingPressureLevel =
    concerningCount === 0 ? 'low'
    : concerningCount === 1 ? 'emerging'
    : concerningCount <= 3 ? 'moderate'
    : 'elevated';

  // ---- Response quality flags (PDF spec §20) ----
  const totalAnswered = answers.length;
  const valueCounts: Record<number, number> = {};
  for (const a of answers) {
    if (a.score >= 1 && a.score <= 5) {
      valueCounts[a.score] = (valueCounts[a.score] || 0) + 1;
    }
  }
  const maxSameValue = Math.max(0, ...Object.values(valueCounts));
  const neutralCount = valueCounts[3] || 0;
  const straightLining = totalAnswered > 0 && (maxSameValue / totalAnswered) > 0.85;
  const excessiveNeutrality = totalAnswered > 0 && (neutralCount / totalAnswered) > 0.60;
  const fastCompletion = completionTimeSeconds > 0 && completionTimeSeconds < 240; // < 4 minutes

  const responseQuality: ResponseQualityFlags = {
    fastCompletion,
    straightLining,
    excessiveNeutrality,
    hasFlags: fastCompletion || straightLining || excessiveNeutrality,
    completionTimeSeconds,
  };

  // ---- Enriched answers (PDF spec §21) ----
  const enrichedAnswers: FullDiagnosticResult['answers'] = fullDiagnosticQuestions.map(q => ({
    questionId: q.id,
    code: q.code,
    archetype: q.archetype,
    dimension: q.dimension,
    isReverseScored: q.isReverseScored,
    rawResponse: rawValue(q),
    scoredValue: scoredValue(q),
  }));

  return {
    archetypeScores,
    archetypeRawScores: archetypeRaw,
    primaryArchetype,
    secondaryArchetype,
    profileClassification,
    blendedArchetypes,
    profileSummaryText,
    dimensionScores,
    dimensionBands,
    derivedMeasures,
    salesWellbeingSustainabilityIndex,
    sustainabilityBand: sustainabilityBand(salesWellbeingSustainabilityIndex),
    wellbeingPressureIndicator,
    responseQuality,
    answers: enrichedAnswers,
    assessmentVersion: ASSESSMENT_VERSION,
    completedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Build the personalised profile summary text (PDF spec §8 + §9.2)
// ---------------------------------------------------------------------------
function buildProfileSummary(
  classification: ProfileClassification,
  primary: Archetype,
  secondary: Archetype,
  primaryPct: number,
  secondaryPct: number,
  blended?: [Archetype, Archetype],
): string {
  const cap = (a: Archetype) => a.charAt(0).toUpperCase() + a.slice(1);
  if (classification === 'blended' && blended) {
    return `Your profile combines strong ${cap(blended[0])} and ${cap(blended[1])} patterns.`;
  }
  if (classification === 'balanced') {
    return 'You draw on several different response patterns depending on the situation.';
  }
  if (classification === 'flexible') {
    return 'Your responses suggest a flexible profile without one strongly dominant pattern.';
  }
  // strong_primary
  return `Your dominant pattern is ${cap(primary)} (${Math.round(primaryPct)}%), with ${cap(secondary)} (${Math.round(secondaryPct)}%) as your secondary pattern.`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function mean(...nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
