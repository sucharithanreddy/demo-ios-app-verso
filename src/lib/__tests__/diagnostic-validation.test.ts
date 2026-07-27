// src/lib/__tests__/diagnostic-validation.test.ts
//
// Unit tests for the diagnostic validation helpers.
//
// Run with: bun test
//
// These tests cover the pure validation/sanitization logic that the
// /api/diagnostic POST handler depends on. The route handler itself
// is thin (it just calls validateDiagnosticBody and translates the
// result into HTTP responses), so testing these helpers gives us
// high confidence that bad payloads get rejected and good payloads
// get normalized correctly.

import { expect, test, describe } from 'bun:test';
import {
  clampScore,
  normalizePrimaryProfile,
  normalizeSecondaryProfile,
  normalizeAttemptSource,
  normalizeClassification,
  coerceOptionalInt,
  coerceOptionalJson,
  sanitizeAnswers,
  validateDiagnosticBody,
  projectToUserProfile,
  VALID_PROFILES,
  VALID_ATTEMPT_SOURCES,
  VALID_CLASSIFICATIONS,
} from '../diagnostic-validation';

// ─────────────────────────────────────────────────────────────────
// clampScore
// ─────────────────────────────────────────────────────────────────

describe('clampScore', () => {
  test('passes through in-range numbers', () => {
    expect(clampScore(0)).toBe(0);
    expect(clampScore(50)).toBe(50);
    expect(clampScore(100)).toBe(100);
  });

  test('clamps numbers above 100', () => {
    expect(clampScore(101)).toBe(100);
    expect(clampScore(1000)).toBe(100);
  });

  test('clamps numbers below 0', () => {
    expect(clampScore(-1)).toBe(0);
    expect(clampScore(-100)).toBe(0);
  });

  test('rounds to integer', () => {
    expect(clampScore(42.6)).toBe(43);
    expect(clampScore(42.4)).toBe(42);
  });

  test('parses numeric strings', () => {
    expect(clampScore('42')).toBe(42);
    expect(clampScore('0')).toBe(0);
    expect(clampScore('100')).toBe(100);
  });

  test('handles non-numeric input gracefully (returns 0)', () => {
    expect(clampScore('not a number')).toBe(0);
    expect(clampScore(null)).toBe(0);
    expect(clampScore(undefined)).toBe(0);
    expect(clampScore({})).toBe(0);
    expect(clampScore(NaN)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────
// normalizePrimaryProfile
// ─────────────────────────────────────────────────────────────────

describe('normalizePrimaryProfile', () => {
  test('accepts valid title-cased profiles', () => {
    expect(normalizePrimaryProfile('Driver')).toBe('Driver');
    expect(normalizePrimaryProfile('Strategist')).toBe('Strategist');
    expect(normalizePrimaryProfile('Connector')).toBe('Connector');
    expect(normalizePrimaryProfile('Reactor')).toBe('Reactor');
  });

  test('accepts case-insensitive input (the diagnostic page has been inconsistent)', () => {
    expect(normalizePrimaryProfile('driver')).toBe('Driver');
    expect(normalizePrimaryProfile('DRIVER')).toBe('Driver');
    expect(normalizePrimaryProfile('strategist')).toBe('Strategist');
    expect(normalizePrimaryProfile('REACTOR')).toBe('Reactor');
  });

  test('trims whitespace', () => {
    expect(normalizePrimaryProfile('  Driver  ')).toBe('Driver');
    expect(normalizePrimaryProfile('\tConnector\n')).toBe('Connector');
  });

  test('rejects invalid profile names', () => {
    expect(normalizePrimaryProfile('Manager')).toBeNull();
    expect(normalizePrimaryProfile('Individual')).toBeNull();
    expect(normalizePrimaryProfile('')).toBeNull();
    expect(normalizePrimaryProfile(' ')).toBeNull();
  });

  test('rejects non-string input', () => {
    expect(normalizePrimaryProfile(null)).toBeNull();
    expect(normalizePrimaryProfile(undefined)).toBeNull();
    expect(normalizePrimaryProfile(42)).toBeNull();
    expect(normalizePrimaryProfile({})).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// normalizeSecondaryProfile
// ─────────────────────────────────────────────────────────────────

describe('normalizeSecondaryProfile', () => {
  test('accepts valid profiles (same as primary)', () => {
    expect(normalizeSecondaryProfile('Driver')).toBe('Driver');
    expect(normalizeSecondaryProfile('strategist')).toBe('Strategist');
  });

  test('returns null for null/undefined (secondary is optional)', () => {
    expect(normalizeSecondaryProfile(null)).toBeNull();
    expect(normalizeSecondaryProfile(undefined)).toBeNull();
  });

  test('returns null for invalid strings', () => {
    expect(normalizeSecondaryProfile('Manager')).toBeNull();
    expect(normalizeSecondaryProfile('')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// sanitizeAnswers
// ─────────────────────────────────────────────────────────────────

describe('sanitizeAnswers', () => {
  test('accepts a well-formed answers array', () => {
    const input = [
      { questionId: 1, score: 3 },
      { questionId: 2, score: 4 },
      { questionId: 3, score: 5 },
    ];
    const result = sanitizeAnswers(input);
    expect(result).toEqual(input);
  });

  test('clamps scores to 1-5 range', () => {
    const input = [
      { questionId: 1, score: 0 },   // below min → 1
      { questionId: 2, score: 6 },   // above max → 5
      { questionId: 3, score: 3 },   // in range → 3
      { questionId: 4, score: -2 },  // below min → 1
      { questionId: 5, score: 10 },  // above max → 5
    ];
    const result = sanitizeAnswers(input);
    expect(result).toEqual([
      { questionId: 1, score: 1 },
      { questionId: 2, score: 5 },
      { questionId: 3, score: 3 },
      { questionId: 4, score: 1 },
      { questionId: 5, score: 5 },
    ]);
  });

  test('filters out entries with non-numeric questionId or score', () => {
    const input = [
      { questionId: 1, score: 3 },                    // valid
      { questionId: 'two', score: 3 },                // bad questionId
      { questionId: 3, score: 'three' },              // bad score
      { questionId: null, score: 3 },                 // bad questionId
      { questionId: 4, score: undefined },            // bad score
      { questionId: 5, score: 4 },                    // valid
      'not an object',                                // not an object
      null,                                           // null entry
      undefined,                                      // undefined entry
      { questionId: 6, score: 2 },                    // valid
    ];
    const result = sanitizeAnswers(input);
    expect(result).toEqual([
      { questionId: 1, score: 3 },
      { questionId: 5, score: 4 },
      { questionId: 6, score: 2 },
    ]);
  });

  test('returns null for non-array input', () => {
    expect(sanitizeAnswers(null)).toBeNull();
    expect(sanitizeAnswers(undefined)).toBeNull();
    expect(sanitizeAnswers('not an array')).toBeNull();
    expect(sanitizeAnswers({})).toBeNull();
  });

  test('returns null for empty array', () => {
    expect(sanitizeAnswers([])).toBeNull();
  });

  test('returns null when all entries are filtered out', () => {
    const input = [
      { questionId: 'bad', score: 3 },
      { questionId: 1, score: 'bad' },
      'not an object',
    ];
    expect(sanitizeAnswers(input)).toBeNull();
  });

  test('preserves order of valid entries', () => {
    const input = [
      { questionId: 5, score: 1 },
      { questionId: 1, score: 2 },
      { questionId: 3, score: 3 },
      { questionId: 2, score: 4 },
      { questionId: 4, score: 5 },
    ];
    const result = sanitizeAnswers(input);
    expect(result?.map(a => a.questionId)).toEqual([5, 1, 3, 2, 4]);
  });
});

// ─────────────────────────────────────────────────────────────────
// validateDiagnosticBody (full body validation)
// ─────────────────────────────────────────────────────────────────

describe('validateDiagnosticBody', () => {
  // A minimal valid body that all success-case tests can extend.
  const validBody = {
    driverScore: 75,
    strategistScore: 50,
    connectorScore: 60,
    reactorScore: 40,
    primaryProfile: 'Driver',
    secondaryProfile: 'Strategist',
    answers: [{ questionId: 1, score: 4 }],
  };

  test('accepts a valid body and normalizes all fields', () => {
    const result = validateDiagnosticBody(validBody);
    expect(result.valid).toBe(true);
    expect(result.primaryProfile).toBe('Driver');
    expect(result.secondaryProfile).toBe('Strategist');
    expect(result.driverScore).toBe(75);
    expect(result.strategistScore).toBe(50);
    expect(result.connectorScore).toBe(60);
    expect(result.reactorScore).toBe(40);
    expect(result.answers).toEqual([{ questionId: 1, score: 4 }]);
    expect(result.isPaid).toBe(false); // defaults to false
  });

  test('accepts lowercase primaryProfile and normalizes to title case', () => {
    const result = validateDiagnosticBody({ ...validBody, primaryProfile: 'driver' });
    expect(result.valid).toBe(true);
    expect(result.primaryProfile).toBe('Driver');
  });

  test('accepts missing secondaryProfile (optional)', () => {
    const { secondaryProfile: _, ...bodyWithoutSecondary } = validBody;
    const result = validateDiagnosticBody(bodyWithoutSecondary);
    expect(result.valid).toBe(true);
    expect(result.secondaryProfile).toBeNull();
  });

  test('accepts null secondaryProfile', () => {
    const result = validateDiagnosticBody({ ...validBody, secondaryProfile: null });
    expect(result.valid).toBe(true);
    expect(result.secondaryProfile).toBeNull();
  });

  test('rejects missing primaryProfile', () => {
    const { primaryProfile: _, ...bodyWithoutPrimary } = validBody;
    const result = validateDiagnosticBody(bodyWithoutPrimary);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('primaryProfile must be one of');
  });

  test('rejects invalid primaryProfile', () => {
    const result = validateDiagnosticBody({ ...validBody, primaryProfile: 'Manager' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('primaryProfile must be one of');
    // Error message should list all valid profiles for debugging
    VALID_PROFILES.forEach(p => {
      expect(result.error).toContain(p);
    });
  });

  test('rejects missing answers array', () => {
    const { answers: _, ...bodyWithoutAnswers } = validBody;
    const result = validateDiagnosticBody(bodyWithoutAnswers);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('answers must be a non-empty array');
  });

  test('rejects empty answers array', () => {
    const result = validateDiagnosticBody({ ...validBody, answers: [] });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('answers must be a non-empty array');
  });

  test('rejects answers array with no valid entries', () => {
    const result = validateDiagnosticBody({
      ...validBody,
      answers: [{ questionId: 'bad', score: 'bad' }],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('answers must be a non-empty array');
  });

  test('clamps out-of-range scores to 0-100', () => {
    const result = validateDiagnosticBody({
      ...validBody,
      driverScore: 150,
      strategistScore: -10,
      connectorScore: 50.7,  // rounds to 51
      reactorScore: 'not a number',  // → 0
    });
    expect(result.valid).toBe(true);
    expect(result.driverScore).toBe(100);
    expect(result.strategistScore).toBe(0);
    expect(result.connectorScore).toBe(51);
    expect(result.reactorScore).toBe(0);
  });

  test('passes through optional metadata arrays when present', () => {
    const result = validateDiagnosticBody({
      ...validBody,
      strengths: ['Resilience', 'Focus'],
      wellbeingRisks: ['Burnout'],
      recommendations: ['Take breaks'],
    });
    expect(result.valid).toBe(true);
    expect(result.strengths).toEqual(['Resilience', 'Focus']);
    expect(result.wellbeingRisks).toEqual(['Burnout']);
    expect(result.recommendations).toEqual(['Take breaks']);
  });

  test('sets optional metadata to null when absent', () => {
    const result = validateDiagnosticBody(validBody);
    expect(result.valid).toBe(true);
    expect(result.strengths).toBeNull();
    expect(result.wellbeingRisks).toBeNull();
    expect(result.recommendations).toBeNull();
  });

  test('sets optional metadata to null when not arrays', () => {
    const result = validateDiagnosticBody({
      ...validBody,
      strengths: 'not an array',
      wellbeingRisks: 42,
      recommendations: { foo: 'bar' },
    });
    expect(result.valid).toBe(true);
    expect(result.strengths).toBeNull();
    expect(result.wellbeingRisks).toBeNull();
    expect(result.recommendations).toBeNull();
  });

  test('respects isPaid flag when true', () => {
    const result = validateDiagnosticBody({ ...validBody, isPaid: true });
    expect(result.valid).toBe(true);
    expect(result.isPaid).toBe(true);
  });

  test('defaults isPaid to false when absent', () => {
    const result = validateDiagnosticBody(validBody);
    expect(result.valid).toBe(true);
    expect(result.isPaid).toBe(false);
  });

  test('coerces truthy non-boolean isPaid values to true', () => {
    const result = validateDiagnosticBody({ ...validBody, isPaid: 'yes' });
    expect(result.valid).toBe(true);
    expect(result.isPaid).toBe(true);
  });

  test('handles null body gracefully', () => {
    const result = validateDiagnosticBody(null);
    expect(result.valid).toBe(false);
  });

  test('handles undefined body gracefully', () => {
    const result = validateDiagnosticBody(undefined);
    expect(result.valid).toBe(false);
  });

  // ─── Full Map (64Q) — Verso Sales Wellbeing Map v1.0 fields ──────

  test('accepts attemptSource = "full_map" and normalizes case', () => {
    const result = validateDiagnosticBody({ ...validBody, attemptSource: 'FULL_MAP' });
    expect(result.valid).toBe(true);
    expect(result.attemptSource).toBe('full_map');
  });

  test('accepts attemptSource = "snapshot"', () => {
    const result = validateDiagnosticBody({ ...validBody, attemptSource: 'snapshot' });
    expect(result.valid).toBe(true);
    expect(result.attemptSource).toBe('snapshot');
  });

  test('returns null for invalid attemptSource', () => {
    const result = validateDiagnosticBody({ ...validBody, attemptSource: 'something_else' });
    expect(result.valid).toBe(true);
    expect(result.attemptSource).toBeNull();
  });

  test('accepts assessmentVersion string', () => {
    const result = validateDiagnosticBody({ ...validBody, assessmentVersion: 'verso-swm-v1.0' });
    expect(result.valid).toBe(true);
    expect(result.assessmentVersion).toBe('verso-swm-v1.0');
  });

  test('truncates over-long assessmentVersion to 64 chars', () => {
    const longVersion = 'v'.repeat(100);
    const result = validateDiagnosticBody({ ...validBody, assessmentVersion: longVersion });
    expect(result.valid).toBe(true);
    expect(result.assessmentVersion?.length).toBe(64);
  });

  test('accepts dimensionScores as a JSON object', () => {
    const dims = { D1: 62, D2: 71, R4: 45 };
    const result = validateDiagnosticBody({ ...validBody, dimensionScores: dims });
    expect(result.valid).toBe(true);
    expect(result.dimensionScores).toEqual(dims);
  });

  test('accepts derivedMeasures as a JSON object', () => {
    const dm = { confidenceStability: 50, energySustainability: 60 };
    const result = validateDiagnosticBody({ ...validBody, derivedMeasures: dm });
    expect(result.valid).toBe(true);
    expect(result.derivedMeasures).toEqual(dm);
  });

  test('accepts sustainabilityIndex as a non-negative int', () => {
    const result = validateDiagnosticBody({ ...validBody, sustainabilityIndex: 67 });
    expect(result.valid).toBe(true);
    expect(result.sustainabilityIndex).toBe(67);
  });

  test('rejects negative sustainabilityIndex (returns null)', () => {
    const result = validateDiagnosticBody({ ...validBody, sustainabilityIndex: -5 });
    expect(result.valid).toBe(true);
    expect(result.sustainabilityIndex).toBeNull();
  });

  test('accepts valid profileClassification', () => {
    VALID_CLASSIFICATIONS.forEach(c => {
      const result = validateDiagnosticBody({ ...validBody, profileClassification: c });
      expect(result.valid).toBe(true);
      expect(result.profileClassification).toBe(c);
    });
  });

  test('returns null for invalid profileClassification', () => {
    const result = validateDiagnosticBody({ ...validBody, profileClassification: 'unknown' });
    expect(result.valid).toBe(true);
    expect(result.profileClassification).toBeNull();
  });

  test('accepts blendedArchetypes string', () => {
    const result = validateDiagnosticBody({ ...validBody, blendedArchetypes: 'Driver+Strategist' });
    expect(result.valid).toBe(true);
    expect(result.blendedArchetypes).toBe('Driver+Strategist');
  });

  test('accepts responseQualityFlags as a JSON object', () => {
    const flags = { fastCompletion: false, straightLining: false, excessiveNeutrality: false, hasFlags: false, completionTimeSeconds: 600 };
    const result = validateDiagnosticBody({ ...validBody, responseQualityFlags: flags });
    expect(result.valid).toBe(true);
    expect(result.responseQualityFlags).toEqual(flags);
  });

  test('accepts completionTimeSeconds as a non-negative int', () => {
    const result = validateDiagnosticBody({ ...validBody, completionTimeSeconds: 480 });
    expect(result.valid).toBe(true);
    expect(result.completionTimeSeconds).toBe(480);
  });

  test('defaults all new Full Map fields to null when absent', () => {
    const result = validateDiagnosticBody(validBody);
    expect(result.valid).toBe(true);
    expect(result.attemptSource).toBeNull();
    expect(result.assessmentVersion).toBeNull();
    expect(result.dimensionScores).toBeNull();
    expect(result.derivedMeasures).toBeNull();
    expect(result.sustainabilityIndex).toBeNull();
    expect(result.profileClassification).toBeNull();
    expect(result.blendedArchetypes).toBeNull();
    expect(result.responseQualityFlags).toBeNull();
    expect(result.completionTimeSeconds).toBeNull();
  });

  test('accepts a full Full Map payload with all new fields populated', () => {
    const fullMapBody = {
      ...validBody,
      isPaid: true,
      attemptSource: 'full_map',
      assessmentVersion: 'verso-swm-v1.0',
      dimensionScores: { D1: 62, D2: 71, D3: 80, D4: 45 },
      derivedMeasures: { confidenceStability: 50, energySustainability: 60 },
      sustainabilityIndex: 65,
      profileClassification: 'strong_primary',
      blendedArchetypes: null,
      responseQualityFlags: { fastCompletion: false, straightLining: false, excessiveNeutrality: false, hasFlags: false, completionTimeSeconds: 480 },
      completionTimeSeconds: 480,
    };
    const result = validateDiagnosticBody(fullMapBody);
    expect(result.valid).toBe(true);
    expect(result.isPaid).toBe(true);
    expect(result.attemptSource).toBe('full_map');
    expect(result.assessmentVersion).toBe('verso-swm-v1.0');
    expect(result.sustainabilityIndex).toBe(65);
    expect(result.profileClassification).toBe('strong_primary');
    expect(result.completionTimeSeconds).toBe(480);
  });
});

// ─────────────────────────────────────────────────────────────────
// normalizeAttemptSource
// ─────────────────────────────────────────────────────────────────

describe('normalizeAttemptSource', () => {
  test('accepts valid attempt sources (case-insensitive)', () => {
    expect(normalizeAttemptSource('snapshot')).toBe('snapshot');
    expect(normalizeAttemptSource('SNAPSHOT')).toBe('snapshot');
    expect(normalizeAttemptSource('full_map')).toBe('full_map');
    expect(normalizeAttemptSource('Full_Map')).toBe('full_map');
  });

  test('returns null for invalid input', () => {
    expect(normalizeAttemptSource('invalid')).toBeNull();
    expect(normalizeAttemptSource('')).toBeNull();
    expect(normalizeAttemptSource(null)).toBeNull();
    expect(normalizeAttemptSource(undefined)).toBeNull();
    expect(normalizeAttemptSource(42)).toBeNull();
  });

  test('covers all values in VALID_ATTEMPT_SOURCES', () => {
    VALID_ATTEMPT_SOURCES.forEach(src => {
      expect(normalizeAttemptSource(src)).toBe(src);
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// normalizeClassification
// ─────────────────────────────────────────────────────────────────

describe('normalizeClassification', () => {
  test('accepts valid classifications (case-insensitive)', () => {
    expect(normalizeClassification('strong_primary')).toBe('strong_primary');
    expect(normalizeClassification('BLENDED')).toBe('blended');
    expect(normalizeClassification('Balanced')).toBe('balanced');
    expect(normalizeClassification('flexible')).toBe('flexible');
  });

  test('returns null for invalid input', () => {
    expect(normalizeClassification('unknown')).toBeNull();
    expect(normalizeClassification('')).toBeNull();
    expect(normalizeClassification(null)).toBeNull();
    expect(normalizeClassification(42)).toBeNull();
  });

  test('covers all values in VALID_CLASSIFICATIONS', () => {
    VALID_CLASSIFICATIONS.forEach(c => {
      expect(normalizeClassification(c)).toBe(c);
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// coerceOptionalInt
// ─────────────────────────────────────────────────────────────────

describe('coerceOptionalInt', () => {
  test('returns the integer for valid numbers', () => {
    expect(coerceOptionalInt(0)).toBe(0);
    expect(coerceOptionalInt(42)).toBe(42);
    expect(coerceOptionalInt(67.4)).toBe(67); // rounds
    expect(coerceOptionalInt(67.6)).toBe(68);
  });

  test('parses numeric strings', () => {
    expect(coerceOptionalInt('42')).toBe(42);
    expect(coerceOptionalInt('0')).toBe(0);
  });

  test('returns null for null/undefined', () => {
    expect(coerceOptionalInt(null)).toBeNull();
    expect(coerceOptionalInt(undefined)).toBeNull();
  });

  test('returns null for negative numbers (used for non-negative Int? fields)', () => {
    expect(coerceOptionalInt(-1)).toBeNull();
    expect(coerceOptionalInt(-100)).toBeNull();
  });

  test('returns null for non-numeric input', () => {
    expect(coerceOptionalInt('not a number')).toBeNull();
    expect(coerceOptionalInt(NaN)).toBeNull();
    expect(coerceOptionalInt({})).toBeNull();
    expect(coerceOptionalInt([1, 2])).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// coerceOptionalJson
// ─────────────────────────────────────────────────────────────────

describe('coerceOptionalJson', () => {
  test('returns the object for valid plain objects', () => {
    expect(coerceOptionalJson({ a: 1 })).toEqual({ a: 1 });
    expect(coerceOptionalJson({})).toEqual({});
  });

  test('parses JSON strings', () => {
    expect(coerceOptionalJson('{"a":1}')).toEqual({ a: 1 });
    expect(coerceOptionalJson('{}')).toEqual({});
  });

  test('returns null for null/undefined', () => {
    expect(coerceOptionalJson(null)).toBeNull();
    expect(coerceOptionalJson(undefined)).toBeNull();
  });

  test('returns null for arrays (we want plain objects, not arrays)', () => {
    expect(coerceOptionalJson([1, 2, 3])).toBeNull();
  });

  test('returns null for invalid JSON strings', () => {
    expect(coerceOptionalJson('not json')).toBeNull();
    expect(coerceOptionalJson('{invalid')).toBeNull();
  });

  test('returns null for primitives', () => {
    expect(coerceOptionalJson(42)).toBeNull();
    expect(coerceOptionalJson('hello')).toBeNull();
    expect(coerceOptionalJson(true)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// projectToUserProfile
// ─────────────────────────────────────────────────────────────────

describe('projectToUserProfile', () => {
  const validRow = {
    primaryProfile: 'Driver',
    secondaryProfile: 'Strategist',
    driverScore: 75,
    strategistScore: 50,
    connectorScore: 60,
    reactorScore: 40,
    isPaid: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
  };

  test('projects a valid DiagnosticResult row into UserProfile shape', () => {
    const result = projectToUserProfile(validRow);
    expect(result).toBeDefined();
    expect(result!.primaryProfile).toBe('Driver');
    expect(result!.secondaryProfile).toBe('Strategist');
    expect(result!.driverScore).toBe(75);
    expect(result!.strategistScore).toBe(50);
    expect(result!.connectorScore).toBe(60);
    expect(result!.reactorScore).toBe(40);
    expect(result!.isPaid).toBe(false);
    expect(result!.completedAt).toBe('2024-01-15T10:00:00.000Z');
  });

  test('returns undefined for null row', () => {
    expect(projectToUserProfile(null)).toBeUndefined();
  });

  test('returns undefined for row with empty primaryProfile', () => {
    expect(projectToUserProfile({ ...validRow, primaryProfile: '' })).toBeUndefined();
  });

  test('handles null secondaryProfile', () => {
    const result = projectToUserProfile({ ...validRow, secondaryProfile: null });
    expect(result).toBeDefined();
    expect(result!.secondaryProfile).toBeUndefined();
  });

  test('handles string createdAt (already ISO)', () => {
    const result = projectToUserProfile({
      ...validRow,
      createdAt: '2024-01-15T10:00:00.000Z',
    });
    expect(result).toBeDefined();
    expect(result!.completedAt).toBe('2024-01-15T10:00:00.000Z');
  });

  test('handles missing isPaid', () => {
    const { isPaid: _, ...rowWithoutIsPaid } = validRow;
    const result = projectToUserProfile(rowWithoutIsPaid);
    expect(result).toBeDefined();
    expect(result!.isPaid).toBeUndefined();
  });
});
