-- Verso Sales Wellbeing Map v1.0 — Full diagnostic structured fields
--
-- Extends DiagnosticResult to store the full 64-question assessment
-- payload so the dashboard, AI engine, and manager views can hydrate
-- without re-running the scorer. Populated only when
-- attempt_source = 'full_map'; nullable for legacy Snapshot rows.
--
-- Mirrors FullDiagnosticResult in src/lib/full-diagnostic-questions.ts.

-- Distinguishes the free 16-question Snapshot from the paid 64-question Full Map.
ALTER TABLE "DiagnosticResult" ADD COLUMN "attemptSource" TEXT;

-- Pins the question bank version (e.g. "verso-swm-v1.0").
ALTER TABLE "DiagnosticResult" ADD COLUMN "assessmentVersion" TEXT;

-- 16 dimension scores { D1: 62, D2: 71, ..., R4: 45 } — 0-100 each.
ALTER TABLE "DiagnosticResult" ADD COLUMN "dimensionScores" JSONB;

-- Full DerivedMeasures object — confidence/energy/recovery/boundary/etc.
ALTER TABLE "DiagnosticResult" ADD COLUMN "derivedMeasures" JSONB;

-- 0-100 Sales Wellbeing Sustainability Index.
ALTER TABLE "DiagnosticResult" ADD COLUMN "sustainabilityIndex" INTEGER;

-- "strong_primary" | "blended" | "balanced" | "flexible"
ALTER TABLE "DiagnosticResult" ADD COLUMN "profileClassification" TEXT;

-- "Driver+Strategist" etc. — only set when classification = "blended".
ALTER TABLE "DiagnosticResult" ADD COLUMN "blendedArchetypes" TEXT;

-- { fastCompletion, straightLining, excessiveNeutrality, hasFlags, completionTimeSeconds }
ALTER TABLE "DiagnosticResult" ADD COLUMN "responseQualityFlags" JSONB;

-- Total time spent on the assessment (seconds).
ALTER TABLE "DiagnosticResult" ADD COLUMN "completionTimeSeconds" INTEGER;

-- Index for filtering Full Map attempts specifically.
CREATE INDEX "DiagnosticResult_attemptSource_idx" ON "DiagnosticResult"("attemptSource");
