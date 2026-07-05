// Quick smoke test for full-diagnostic-questions.ts scoring
// Run with: node --experimental-strip-types /home/z/my-project/scripts/test-scoring.ts

import {
  fullDiagnosticQuestions,
  snapshotQuestions,
  calculateFullResults,
} from '../../my-project/demo-ios-app-verso/src/lib/full-diagnostic-questions.ts';

console.log(`Total questions: ${fullDiagnosticQuestions.length}`);
console.log(`Snapshot questions: ${snapshotQuestions.length}`);

// Count per archetype
const perArchetype = fullDiagnosticQuestions.reduce((acc, q) => {
  acc[q.archetype] = (acc[q.archetype] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.log('Per archetype:', perArchetype);

// Sub-dimension distribution
const perSubDim = fullDiagnosticQuestions.reduce((acc, q) => {
  acc[q.subDimension] = (acc[q.subDimension] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.log('Per sub-dimension:', perSubDim);

// Simulate a "strong Driver" answer set: 5 for all Driver questions, 2 for others
const driverAnswers = fullDiagnosticQuestions.map(q => ({
  questionId: q.id,
  score: q.archetype === 'driver' ? 5 : 2,
}));
const driverResult = calculateFullResults(driverAnswers);
console.log('\n--- Simulated strong Driver ---');
console.log('Archetype scores:', driverResult.archetypeScores);
console.log('Primary:', driverResult.primaryArchetype, '(confidence:', driverResult.confidence + ')');
console.log('Secondary:', driverResult.secondaryArchetype);
console.log('Wellbeing indicators:', driverResult.wellbeingIndicators);

// Simulate all-neutral answers
const neutralAnswers = fullDiagnosticQuestions.map(q => ({ questionId: q.id, score: 3 }));
const neutralResult = calculateFullResults(neutralAnswers);
console.log('\n--- Simulated all-neutral ---');
console.log('Archetype scores:', neutralResult.archetypeScores);
console.log('Confidence:', neutralResult.confidence);
console.log('Wellbeing indicators:', neutralResult.wellbeingIndicators);

// Snapshot-only answers (16 questions)
const snapshotAnswers = snapshotQuestions.map(q => ({ questionId: q.id, score: 5 }));
const snapshotResult = calculateFullResults(snapshotAnswers);
console.log('\n--- Snapshot only (all Strongly Agree) ---');
console.log('Archetype scores:', snapshotResult.archetypeScores);
console.log('Sub-dimensions covered:', Object.keys(snapshotResult.subDimensionScores));
