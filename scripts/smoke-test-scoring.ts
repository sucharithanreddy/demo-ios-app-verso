// scripts/smoke-test-scoring.ts
//
// Quick sanity check for the new calculateFullResults scoring logic.
// Builds a synthetic answer set, runs the scorer, and prints the result
// so we can eyeball whether the formulas produce sensible numbers.
//
// Run with: npx bun run scripts/smoke-test-scoring.ts
// (or: npx tsx scripts/smoke-test-scoring.ts)

import {
  fullDiagnosticQuestions,
  calculateFullResults,
  shuffleQuestions,
  DIMENSION_META,
} from '../src/lib/full-diagnostic-questions';

function main() {
  console.log('=== Verso Sales Wellbeing Map — Scoring Smoke Test ===\n');

  // 1. Verify the question bank structure
  console.log(`Total questions: ${fullDiagnosticQuestions.length}`);
  const reverseCount = fullDiagnosticQuestions.filter(q => q.isReverseScored).length;
  console.log(`Reverse-scored items: ${reverseCount} (expected 13)`);
  const snapshotCount = fullDiagnosticQuestions.filter(q => q.isSnapshot).length;
  console.log(`Snapshot items: ${snapshotCount} (expected 16)`);

  // 2. Verify shuffle constraints
  const shuffled = shuffleQuestions(42);
  console.log(`\nShuffled order (seed=42), first 10 codes:`);
  console.log(shuffled.slice(0, 10).map(q => q.code).join(', '));

  // Check: max 2 same-archetype consecutive
  let maxConsec = 1, cur = 1;
  for (let i = 1; i < shuffled.length; i++) {
    if (shuffled[i].archetype === shuffled[i-1].archetype) { cur++; maxConsec = Math.max(maxConsec, cur); }
    else cur = 1;
  }
  console.log(`Max same-archetype consecutive: ${maxConsec} (must be ≤ 2)`);

  // 3. Synthetic "all neutral" answers — every dimension should land at 50%
  const neutralAnswers = fullDiagnosticQuestions.map(q => ({ questionId: q.id, score: 3 }));
  const neutralResult = calculateFullResults(neutralAnswers, 600);
  console.log('\n=== All-neutral responses (every answer = 3) ===');
  console.log(`Archetype scores:`, neutralResult.archetypeScores);
  console.log(`All dimensions should be 50 (neutral midpoint)`);
  console.log(`Sample dim D1: ${neutralResult.dimensionScores.D1}, R3: ${neutralResult.dimensionScores.R3}`);
  console.log(`Sustainability Index: ${neutralResult.salesWellbeingSustainabilityIndex}`);
  console.log(`Pressure Indicator: ${neutralResult.wellbeingPressureIndicator}`);
  console.log(`Classification: ${neutralResult.profileClassification}`);

  // 4. Synthetic "all strongly agree" answers — reverse-scored items become 1, others become 5
  //    For each dimension: raw = 3*5 + 1*1 = 16 (3 standard at 5, 1 reverse at 1)
  //    Dimension % = ((16-4)/16)*100 = 75
  const agreeAnswers = fullDiagnosticQuestions.map(q => ({ questionId: q.id, score: 5 }));
  const agreeResult = calculateFullResults(agreeAnswers, 600);
  console.log('\n=== All "Strongly agree" responses ===');
  console.log(`Archetype scores:`, agreeResult.archetypeScores);
  console.log(`Expected: every dimension = 75 (raw 16, ((16-4)/16)*100 = 75)`);
  console.log(`Sample dim D1: ${agreeResult.dimensionScores.D1}, D4 (has reverse): ${agreeResult.dimensionScores.D4}`);
  console.log(`Sustainability Index: ${agreeResult.salesWellbeingSustainabilityIndex}`);
  console.log(`Classification: ${agreeResult.profileClassification}`);
  console.log(`Derived: confidenceStability=${agreeResult.derivedMeasures.confidenceStability} (100 - R1=75 = 25)`);
  console.log(`Derived: energySustainability=${agreeResult.derivedMeasures.energySustainability} (100 - mean(D3=75, D4=75, R3=75) = 25)`);

  // 5. Synthetic "all strongly disagree" — reverse-scored become 5, standard become 1
  //    For each dimension: raw = 3*1 + 1*5 = 8, % = ((8-4)/16)*100 = 25
  const disagreeAnswers = fullDiagnosticQuestions.map(q => ({ questionId: q.id, score: 1 }));
  const disagreeResult = calculateFullResults(disagreeAnswers, 600);
  console.log('\n=== All "Strongly disagree" responses ===');
  console.log(`Expected: every dimension = 25 (raw 8, ((8-4)/16)*100 = 25)`);
  console.log(`Sample dim D1: ${disagreeResult.dimensionScores.D1}, D4: ${disagreeResult.dimensionScores.D4}`);
  console.log(`Sustainability Index: ${disagreeResult.salesWellbeingSustainabilityIndex}`);

  // 6. Response quality flags — fast completion
  const fastResult = calculateFullResults(neutralAnswers, 180); // 3 minutes
  console.log('\n=== Response quality (3-minute completion) ===');
  console.log(`fastCompletion flag: ${fastResult.responseQuality.fastCompletion} (expected true)`);
  console.log(`hasFlags: ${fastResult.responseQuality.hasFlags}`);

  // 7. Response quality — straight-lining (all 3s = 100% same option)
  console.log(`\nStraight-lining check (all neutral): straightLining=${neutralResult.responseQuality.straightLining} (expected true, 100% > 85%)`);
  console.log(`Excessive neutrality (all 3s): excessiveNeutrality=${neutralResult.responseQuality.excessiveNeutrality} (expected true, 100% > 60%)`);

  // 8. Print a full sample result for visual inspection
  console.log('\n=== Sample result (neutral answers, 10-minute completion) ===');
  console.log(JSON.stringify({
    archetypeScores: neutralResult.archetypeScores,
    primaryArchetype: neutralResult.primaryArchetype,
    secondaryArchetype: neutralResult.secondaryArchetype,
    profileClassification: neutralResult.profileClassification,
    profileSummaryText: neutralResult.profileSummaryText,
    salesWellbeingSustainabilityIndex: neutralResult.salesWellbeingSustainabilityIndex,
    sustainabilityBand: neutralResult.sustainabilityBand,
    wellbeingPressureIndicator: neutralResult.wellbeingPressureIndicator,
    dimensionScores: neutralResult.dimensionScores,
    derivedMeasures: neutralResult.derivedMeasures,
    responseQuality: neutralResult.responseQuality,
    assessmentVersion: neutralResult.assessmentVersion,
  }, null, 2));

  console.log('\n=== All smoke checks completed ===');
}

main();
