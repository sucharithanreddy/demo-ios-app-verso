/**
 * TEST-ONLY SEED SCRIPT - DO NOT IMPORT FROM APP CODE
 *
 * Inserts 20 fake sales-person users under one real manager account,
 * each with randomized DiagnosticResult + SalesCheckIn + UserStreak rows
 * so the manager dashboard lights up with realistic-looking data.
 *
 * Usage (run locally with DATABASE_URL pointing at the Vercel Postgres DB):
 *
 *   export DATABASE_URL="postgresql://..."
 *   bun run scripts/seed-test-team.ts
 *
 * Idempotent: if test users already exist (by email pattern), the script
 * skips re-creating them. Safe to re-run.
 *
 * Cleanup: run scripts/delete-test-team.ts to remove everything this
 * script created.
 */

import { PrismaClient, UserType } from '@prisma/client';
import crypto from 'crypto';

// --- Test-only configuration (NOT loaded by app code) -----------------------
//
// The manager is resolved in this order:
//   1. SEED_MANAGER_CLERK_ID env var (if set and non-empty)
//   2. SEED_MANAGER_EMAIL env var   (if set and non-empty)
//   3. Hardcoded defaults below (original Sucharitha account, kept for
//      backward compatibility with existing CI invocations).
//
// This lets the same script seed a team under any manager without code
// edits - the GitHub Actions workflow passes the manager via inputs.

const DEFAULT_MANAGER_CLERK_ID = 'user_3G3WIKMf0gExMInrLjScYxFBold';
const DEFAULT_MANAGER_EMAIL_FALLBACK = 'sucharithareddyn13@gmail.com';

const MANAGER_CLERK_ID = process.env.SEED_MANAGER_CLERK_ID?.trim() || DEFAULT_MANAGER_CLERK_ID;
const MANAGER_EMAIL_FALLBACK = process.env.SEED_MANAGER_EMAIL?.trim() || DEFAULT_MANAGER_EMAIL_FALLBACK;

const TOTAL_TEST_USERS = 20;
const TEST_EMAIL_DOMAIN = '@verso.dev';

// Manager-specific email tag (6-char sha1 of clerkId) so each manager gets
// their own 20 test users with globally-unique emails. Without this, two
// managers would collide on `testuser+1@verso.dev` and the second seed
// would fail on the email unique constraint.
//
// Example: clerkId "user_3G56QZINrK1vO2yGyWpY0f0PEV2" -> tag "a3f2c1"
//          -> emails testuser+a3f2c1-1@verso.dev .. testuser+a3f2c1-20@verso.dev
const MANAGER_TAG = crypto
  .createHash('sha1')
  .update(MANAGER_CLERK_ID)
  .digest('hex')
  .slice(0, 6);

const TEST_EMAIL_PATTERN = new RegExp(`^testuser\\+${MANAGER_TAG}-\\d+@verso\\.dev$`);

function testEmailFor(n: number): string {
  return `testuser+${MANAGER_TAG}-${n}${TEST_EMAIL_DOMAIN}`;
}

// --- Random data pools ------------------------------------------------------

const FIRST_NAMES = [
  'Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Kavya', 'Arjun', 'Diya',
  'Sai', 'Meera', 'Karthik', 'Sneha', 'Aditya', 'Pooja', 'Rahul', 'Riya',
  'Nikhil', 'Anika', 'Varun', 'Ishita', 'Akash', 'Tanvi', 'Siddharth', 'Nisha',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Menon', 'Gupta', 'Rao',
  'Kapoor', 'Malhotra', 'Banerjee', 'Chatterjee', 'Singh', 'Kaur', 'Joshi',
  'Desai', 'Bhat', 'Pillai', 'Verma', 'Agarwal',
];

const INDUSTRIES = [
  'SaaS', 'FinTech', 'Healthcare', 'Manufacturing', 'Retail', 'Real Estate',
];

const DESIGNATIONS = [
  'Account Executive', 'Sales Development Rep', 'Account Manager',
  'Business Development Rep', 'Senior Account Executive', 'Sales Engineer',
];

const ARCHETYPES = ['Driver', 'Strategist', 'Connector', 'Reactor'] as const;
type Archetype = (typeof ARCHETYPES)[number];

const ARCHETYPE_STRENGTHS: Record<Archetype, string[]> = {
  Driver: [
    'Strong drive to move things forward',
    'Ability to create momentum quickly',
    'Resilience in fast-paced or high-demand situations',
    'Willingness to take ownership and responsibility',
  ],
  Strategist: [
    'Thoughtful and considered decision-making',
    'Strong planning and problem-solving capability',
    'Ability to identify patterns and make sense of complexity',
    'Maintaining perspective in uncertain situations',
  ],
  Connector: [
    'Strong emotional intelligence and empathy',
    'Ability to build trust and maintain relationships',
    'Collaborative approach to challenges',
    'Positive influence on team morale and cohesion',
  ],
  Reactor: [
    'Strong sense of accountability and ownership',
    'High levels of engagement and care for outcomes',
    'Responsiveness and awareness of changing situations',
    'Energy and passion in performance-driven environments',
  ],
};

const ARCHETYPE_RISKS: Record<Archetype, string[]> = {
  Driver: [
    'Difficulty switching off or recovering outside of work',
    'Sustained mental and physical fatigue over time',
    'Impatience when progress is slower than expected',
    'Tendency to prioritise output over personal wellbeing',
  ],
  Strategist: [
    'Overthinking or difficulty switching off mentally',
    'Reduced confidence when clarity is lacking',
    'Hesitation when quick decisions are required',
    'Mental fatigue from sustained cognitive load',
  ],
  Connector: [
    'Absorbing emotional stress from others',
    'Difficulty maintaining boundaries between work and personal life',
    'Avoidance of difficult or uncomfortable conversations',
    'Emotional fatigue from sustained interpersonal demands',
  ],
  Reactor: [
    'Fluctuations in confidence, focus and motivation',
    'Difficulty maintaining perspective during setbacks',
    'Emotional exhaustion over prolonged periods',
    'Reactive patterns that affect consistency',
  ],
};

const IMPACT_TAGS = [
  'missed_target', 'tough_client', 'win', 'rejection',
  'good_call', 'long_meeting', 'pipeline_build', 'customer_success',
];

// --- Helpers ----------------------------------------------------------------

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function daysAgo(n: number): Date {
  // Normalize to UTC midnight so two calls with the same n return the same
  // timestamp - important for SalesCheckIn's @@unique([userId, date]).
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function randomDateInLast(days: number): Date {
  return daysAgo(randInt(0, days));
}

// Fisher-Yates shuffle (in-place). Used to pick N distinct day offsets
// from [0..29] without collisions - required because SalesCheckIn has
// a @@unique([userId, date]) constraint.
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate sub-scores for an archetype so the primary archetype actually wins.
function generateScoresForArchetype(archetype: Archetype): {
  driverScore: number;
  strategistScore: number;
  connectorScore: number;
  reactorScore: number;
} {
  // Primary archetype gets a high base; others get lower random scores.
  // This matches what the real /diagnostic/page.tsx produces.
  const base: Record<Archetype, number> = {
    Driver: 0,
    Strategist: 0,
    Connector: 0,
    Reactor: 0,
  };
  base[archetype] = randInt(60, 90); // 60-90 for primary
  const others = ARCHETYPES.filter((a) => a !== archetype);
  for (const a of others) {
    base[a] = randInt(10, 55); // 10-55 for non-primary
  }
  return {
    driverScore: base.Driver,
    strategistScore: base.Strategist,
    connectorScore: base.Connector,
    reactorScore: base.Reactor,
  };
}

// Decide the secondary archetype (highest non-primary score).
function pickSecondary(archetype: Archetype, scores: {
  driverScore: number;
  strategistScore: number;
  connectorScore: number;
  reactorScore: number;
}): string | null {
  const map: Record<Archetype, number> = {
    Driver: scores.driverScore,
    Strategist: scores.strategistScore,
    Connector: scores.connectorScore,
    Reactor: scores.reactorScore,
  };
  const others = ARCHETYPES.filter((a) => a !== archetype);
  others.sort((a, b) => map[b] - map[a]);
  return others[0] ?? null;
}

// Generate fake answers JSON (16 questions worth, scale 1-5).
function generateAnswers(): { questionId: string; score: number }[] {
  const answers: { questionId: string; score: number }[] = [];
  for (let i = 1; i <= 16; i++) {
    answers.push({
      questionId: `q${i}`,
      score: randInt(1, 5),
    });
  }
  return answers;
}

// Profile buckets used to drive SalesCheckIn patterns.
// Each user gets assigned one bucket, which determines their mood/energy/confidence range.
type ProfileBucket = 'thriving' | 'stable' | 'needsSupport' | 'noData';

const PROFILE_DISTRIBUTION: ProfileBucket[] = [
  // 12 thriving, 6 stable, 2 needsSupport → 60/30/10 split across 20 users
  'thriving', 'thriving', 'thriving', 'thriving', 'thriving', 'thriving',
  'thriving', 'thriving', 'thriving', 'thriving', 'thriving', 'thriving',
  'stable', 'stable', 'stable', 'stable', 'stable', 'stable',
  'needsSupport', 'needsSupport',
];

function scoreRangeFor(bucket: ProfileBucket): { min: number; max: number } {
  switch (bucket) {
    case 'thriving':
      return { min: 3.5, max: 5 };
    case 'stable':
      return { min: 2.5, max: 3.5 };
    case 'needsSupport':
      return { min: 1, max: 2.5 };
    case 'noData':
      return { min: 0, max: 0 };
  }
}

// Generate SalesCheckIns for a user based on their bucket.
function generateCheckIns(userId: string, bucket: ProfileBucket): Array<{
  userId: string;
  date: Date;
  mood: number;
  energy: number;
  confidence: number;
  impactTags: string[];
  notes: string | null;
  patternInsight: string | null;
}> {
  if (bucket === 'noData') return [];

  // Pick `count` distinct day offsets from [0..29]. This avoids collisions
  // on SalesCheckIn's @@unique([userId, date]) constraint.
  const count = randInt(5, 15);
  const allDays = Array.from({ length: 30 }, (_, i) => i);
  shuffle(allDays);
  const dayOffsets = allDays.slice(0, count);

  const range = scoreRangeFor(bucket);
  const checkIns: Array<{
    userId: string;
    date: Date;
    mood: number;
    energy: number;
    confidence: number;
    impactTags: string[];
    notes: string | null;
    patternInsight: string | null;
  }> = [];

  for (const daysBack of dayOffsets) {
    const date = daysAgo(daysBack);
    // Round to integer 1-5 (the schema uses Int for mood/energy/confidence)
    const mood = Math.round(randFloat(range.min, range.max));
    const energy = Math.round(randFloat(range.min, range.max));
    const confidence = Math.round(randFloat(range.min, range.max));
    // Pick 1-3 impact tags
    const tags: string[] = [];
    const tagCount = randInt(1, 3);
    for (let t = 0; t < tagCount; t++) {
      const tag = pick(IMPACT_TAGS);
      if (!tags.includes(tag)) tags.push(tag);
    }
    checkIns.push({
      userId,
      date,
      mood,
      energy,
      confidence,
      impactTags: tags,
      notes: null,
      patternInsight: null,
    });
  }

  // Sort by date descending so the dashboard's "first row = most recent" works
  checkIns.sort((a, b) => b.date.getTime() - a.date.getTime());
  return checkIns;
}

// --- Main -------------------------------------------------------------------

async function main() {
  console.log('--- Test team seed script ---');
  console.log('');
  console.log(`   Target manager clerkId: ${MANAGER_CLERK_ID}`);
  console.log(`   Target manager email:   ${MANAGER_EMAIL_FALLBACK}`);
  console.log(`   (defaults used if env vars not set: ${MANAGER_CLERK_ID === DEFAULT_MANAGER_CLERK_ID ? 'YES' : 'NO'})`);
  console.log(`   Manager tag (email suffix): ${MANAGER_TAG}`);
  console.log(`   Email pattern: testuser+${MANAGER_TAG}-<n>@verso.dev`);
  console.log('');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set. Export it before running:');
    console.error('   export DATABASE_URL="postgresql://..."');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    // 1. Find the manager.
    console.log(`🔎 Looking up manager by clerkId="${MANAGER_CLERK_ID}"...`);
    let manager = await prisma.user.findUnique({
      where: { clerkId: MANAGER_CLERK_ID },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        managerCode: true,
      },
    });

    // Fallback: try by email if clerkId didn't match.
    if (!manager) {
      console.warn(
        `⚠️  No user found with clerkId="${MANAGER_CLERK_ID}". Falling back to email="${MANAGER_EMAIL_FALLBACK}"...`,
      );
      manager = await prisma.user.findUnique({
        where: { email: MANAGER_EMAIL_FALLBACK },
        select: { id: true, email: true, name: true, userType: true, managerCode: true },
      });
    }

    if (!manager) {
      console.error('❌ Manager not found by clerkId or email. Aborting.');
      process.exit(1);
    }

    if (manager.userType !== 'SALES_MANAGER') {
      console.error(
        `❌ Found user ${manager.email} but userType is ${manager.userType}, not SALES_MANAGER. Aborting.`,
      );
      process.exit(1);
    }

    console.log(
      `✅ Manager found: ${manager.name ?? manager.email} (id=${manager.id}, managerCode=${manager.managerCode ?? 'n/a'})`,
    );
    console.log('');

    // 2. Check for existing test users (idempotency).
    // Filter by managerId AND email pattern so that test users seeded under
    // OTHER managers (different MANAGER_TAG) don't cause us to skip this
    // manager's seed. Each manager gets their own 20 users.
    console.log(`🔎 Checking for existing test users under this manager (tag=${MANAGER_TAG})...`);
    const existing = await prisma.user.findMany({
      where: {
        managerId: manager.id,
        email: { contains: TEST_EMAIL_DOMAIN },
      },
      select: { id: true, email: true },
    });
    // Defensive: also apply the regex to filter out any @verso.dev emails
    // that don't actually match this manager's tag pattern.
    const existingEmails = new Set(
      existing.filter((u) => TEST_EMAIL_PATTERN.test(u.email)).map((u) => u.email),
    );
    if (existing.length > 0) {
      console.log(`   Found ${existing.length} existing @verso.dev users under this manager.`);
      console.log(`   Of those, ${existingEmails.size} match this manager's tag pattern (${MANAGER_TAG}).`);
    }

    // 3. Plan the 20 users. Pre-assign each an email + profile bucket so we can
    //    deterministically decide who gets skipped vs. created.
    //    Email pattern is manager-specific (testuser+<tag>-<n>@verso.dev) so
    //    multiple managers can each have their own 20 test users.
    const planned = Array.from({ length: TOTAL_TEST_USERS }, (_, i) => {
      const n = i + 1;
      const email = testEmailFor(n);
      const bucket = PROFILE_DISTRIBUTION[i] ?? 'stable';
      return { n, email, bucket };
    });

    const toCreate = planned.filter((p) => !existingEmails.has(p.email));
    const toSkip = planned.filter((p) => existingEmails.has(p.email));

    if (toSkip.length > 0) {
      console.log(`   Skipping ${toSkip.length} already-existing users: ${toSkip.map((s) => s.email).join(', ')}`);
    }
    if (toCreate.length === 0) {
      console.log('');
      console.log('✅ All 20 test users already exist. Nothing to do.');
      console.log('   Run scripts/delete-test-team.ts to remove them, then re-run this script.');
      return;
    }
    console.log(`   Will create ${toCreate.length} new test users.`);
    console.log('');

    // 4. Create each user + their diagnostic + check-ins + streak.
    let created = 0;
    let skippedNoData = 0; // users with no diagnostic (4 of them, see below)

    for (const plan of toCreate) {
      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const fullName = `${firstName} ${lastName}`;

      // Decide whether this user has done the diagnostic.
      // Target: 4 of 20 have no diagnostic (the "no data yet" empty state).
      // Distribute these as the first 4 of the planned set that we're actually creating.
      const hasDiagnostic = !(plan.n <= 4);

      // Create the User row first.
      const user = await prisma.user.create({
        data: {
          clerkId: `test_${crypto.randomUUID()}`,
          email: plan.email,
          name: fullName,
          userType: UserType.SALES_PERSON,
          managerId: manager.id,
          industry: pick(INDUSTRIES),
          designation: pick(DESIGNATIONS),
          companyName: 'Test Corp',
          createdAt: daysAgo(randInt(1, 60)),
          // Address fields intentionally left null (not needed for dashboard)
        },
      });

      // Diagnostic + check-ins depend on the bucket + hasDiagnostic.
      // Users with no diagnostic (the first 4) also get no check-ins -
      // they are pure empty state.
      const effectiveBucket: ProfileBucket = hasDiagnostic ? plan.bucket : 'noData';

      if (!hasDiagnostic) {
        skippedNoData++;
      }

      // Insert DiagnosticResult if applicable.
      if (hasDiagnostic) {
        const archetype = pick(ARCHETYPES);
        const scores = generateScoresForArchetype(archetype);
        const secondary = pickSecondary(archetype, scores);
        const strengths = ARCHETYPE_STRENGTHS[archetype];
        const risks = ARCHETYPE_RISKS[archetype];

        await prisma.diagnosticResult.create({
          data: {
            userId: user.id,
            primaryProfile: archetype, // MUST be capitalized - API filters on exact strings
            secondaryProfile: secondary,
            driverScore: scores.driverScore,
            strategistScore: scores.strategistScore,
            connectorScore: scores.connectorScore,
            reactorScore: scores.reactorScore,
            answers: generateAnswers(),
            strengths,
            wellbeingRisks: risks,
            isPaid: false,
            createdAt: randomDateInLast(30),
          },
        });
      }

      // Insert SalesCheckIns (0 if noData).
      const checkIns = generateCheckIns(user.id, effectiveBucket);
      if (checkIns.length > 0) {
        await prisma.salesCheckIn.createMany({
          data: checkIns.map((c) => ({
            userId: c.userId,
            date: c.date,
            mood: c.mood,
            energy: c.energy,
            confidence: c.confidence,
            impactTags: c.impactTags,
            notes: c.notes,
            patternInsight: c.patternInsight,
          })),
        });
      }

      // Insert UserStreak (skip for the 4 "no data" users).
      if (hasDiagnostic) {
        await prisma.userStreak.create({
          data: {
            userId: user.id,
            currentStreak: randInt(0, 30),
            longestStreak: randInt(0, 45),
            lastCheckInDate: randomDateInLast(7),
          },
        });
      }

      created++;
      const archetypeLabel = hasDiagnostic
        ? `bucket=${effectiveBucket}, ${checkIns.length} check-ins`
        : 'no diagnostic (empty state)';
      console.log(
        `   [${created}/${toCreate.length}] ${plan.email} - ${fullName} - ${archetypeLabel}`,
      );
    }

    console.log('');
    console.log('--- Seed summary ---');
    console.log(`   Manager:        ${manager.email}`);
    console.log(`   Created:        ${created} users`);
    console.log(`   Skipped:        ${toSkip.length} (already existed)`);
    console.log(`   Empty-state:    ${skippedNoData} users (no diagnostic, no check-ins)`);
    console.log('');
    console.log('✅ Done. Refresh the manager dashboard to see the seeded team.');
    console.log('   To clean up: bun run scripts/delete-test-team.ts');
  } catch (err) {
    console.error('');
    console.error('❌ Seed failed:');
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
