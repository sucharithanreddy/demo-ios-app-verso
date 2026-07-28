/**
 * TEST-ONLY CLEANUP SCRIPT - DO NOT IMPORT FROM APP CODE
 *
 * Removes every User row whose email matches the test-user pattern
 * (`testuser+<n>@verso.dev`). Cascade deletes automatically remove
 * their DiagnosticResult, SalesCheckIn, UserStreak, and any other
 * related rows (per prisma/schema.prisma's onDelete: Cascade).
 *
 * Usage (run locally with DATABASE_URL pointing at the Vercel Postgres DB):
 *
 *   export DATABASE_URL="postgresql://..."
 *   bun run scripts/delete-test-team.ts
 *
 * Safety:
 *   - Asks for explicit "yes" confirmation before deleting.
 *   - Only matches emails ending in @verso.dev - real users are untouched.
 *   - The real manager account is never touched (their email doesn't match).
 */

import { PrismaClient } from '@prisma/client';

const TEST_EMAIL_DOMAIN = '@verso.dev';
const TEST_EMAIL_PATTERN = /testuser\+\d+@verso\.dev$/;

async function main() {
  console.log('--- Test team cleanup script ---');
  console.log('');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set. Export it before running:');
    console.error('   export DATABASE_URL="postgresql://..."');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    // 1. Preview what will be deleted.
    console.log(`🔎 Finding users with email matching ${TEST_EMAIL_PATTERN}...`);
    const testUsers = await prisma.user.findMany({
      where: { email: { contains: TEST_EMAIL_DOMAIN } },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            diagnosticResults: true,
            salesCheckIns: true,
          },
        },
      },
      orderBy: { email: 'asc' },
    });

    // Defensive: filter again with the strict regex in case @verso.dev ever
    // gets used for non-test users in the future.
    const toDelete = testUsers.filter((u) => TEST_EMAIL_PATTERN.test(u.email));

    if (toDelete.length === 0) {
      console.log('✅ No test users found. Nothing to delete.');
      return;
    }

    console.log('');
    console.log(`📋 ${toDelete.length} test user(s) will be deleted:`);
    for (const u of toDelete) {
      const diagnosticCount = u._count.diagnosticResults;
      const checkInCount = u._count.salesCheckIns;
      console.log(
        `   • ${u.email} (${u.name ?? 'no name'}) - ${diagnosticCount} diagnostic(s), ${checkInCount} check-in(s)`,
      );
    }
    console.log('');
    console.log('⚠️  Related DiagnosticResult, SalesCheckIn, UserStreak, and other');
    console.log('   rows will be CASCADE-deleted along with each User.');
    console.log('');

    // 2. Ask for confirmation (skip with --yes flag for non-interactive runs).
    const skipConfirm = process.argv.includes('--yes');
    if (!skipConfirm) {
      const answer = await askForConfirmation(
        `Type "yes" to permanently delete ${toDelete.length} test user(s) and all their data: `,
      );
      if (answer !== 'yes') {
        console.log('Aborted. No changes made.');
        return;
      }
    }

    // 3. Delete each user. Prisma cascade handles related rows.
    console.log('');
    console.log('🗑️  Deleting...');
    let deleted = 0;
    for (const u of toDelete) {
      await prisma.user.delete({ where: { id: u.id } });
      deleted++;
      console.log(`   [${deleted}/${toDelete.length}] Deleted ${u.email}`);
    }

    console.log('');
    console.log(`✅ Deleted ${deleted} test user(s) and all related data.`);
    console.log('   Real users and the manager account are untouched.');
  } catch (err) {
    console.error('');
    console.error('❌ Cleanup failed:');
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Minimal readline-based prompt. No external deps.
function askForConfirmation(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.resume();
    process.stdin.on('data', (chunk) => {
      data += chunk;
      if (data.includes('\n')) {
        process.stdin.pause();
        resolve(data.trim());
      }
    });
  });
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
