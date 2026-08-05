/**
 * Quick DB check - verify the new manager (Enrico Montagnino) exists in the
 * live Neon DB with userType=SALES_MANAGER, and report any existing test
 * users already attached to them (so we don't double-seed).
 *
 * Usage:
 *   npx tsx scripts/check-manager.ts
 */
import { PrismaClient } from '@prisma/client';

const MANAGER_CLERK_ID = 'user_3G56QZINrK1vO2yGyWpY0f0PEV2';
const MANAGER_EMAIL = 'montagninoenrico@gmail.com';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    console.log('--- Manager lookup ---');
    console.log(`clerkId: ${MANAGER_CLERK_ID}`);
    console.log(`email:   ${MANAGER_EMAIL}`);
    console.log('');

    // Try clerkId first
    let manager = await prisma.user.findUnique({
      where: { clerkId: MANAGER_CLERK_ID },
      select: { id: true, email: true, name: true, userType: true, managerCode: true },
    });

    if (!manager) {
      console.warn('No user found by clerkId. Trying by email...');
      manager = await prisma.user.findUnique({
        where: { email: MANAGER_EMAIL },
        select: { id: true, email: true, name: true, userType: true, managerCode: true },
      });
    }

    if (!manager) {
      console.error('MANAGER NOT FOUND in DB.');
      console.error('The user must sign in to the app at least once so a User row is created.');
      process.exit(1);
    }

    console.log('Manager found:');
    console.log(`  id:          ${manager.id}`);
    console.log(`  email:       ${manager.email}`);
    console.log(`  name:        ${manager.name ?? '(null)'}`);
    console.log(`  userType:    ${manager.userType}`);
    console.log(`  managerCode: ${manager.managerCode ?? '(null)'}`);
    console.log('');

    if (manager.userType !== 'SALES_MANAGER') {
      console.error(`userType is ${manager.userType}, NOT SALES_MANAGER.`);
      console.error('The seed script will refuse to run for a non-manager account.');
      console.error('Fix: sign in as this user, complete profile and select Manager role, then re-run.');
      process.exit(1);
    }

    console.log('--- Existing team ---');
    const team = await prisma.user.findMany({
      where: { managerId: manager.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    console.log(`Existing sales people under this manager: ${team.length}`);
    if (team.length > 0) {
      for (const t of team.slice(0, 30)) {
        console.log(`  - ${t.email}  (${t.name ?? 'no name'})  created ${t.createdAt.toISOString().slice(0, 10)}`);
      }
      if (team.length > 30) console.log(`  ... and ${team.length - 30} more`);
    }

    const existingTestUsers = team.filter((t) => /testuser\+\d+@verso\.dev$/.test(t.email));
    console.log(``);
    console.log(`Existing testuser+*@verso.dev accounts: ${existingTestUsers.length}`);
    if (existingTestUsers.length > 0) {
      console.log('These will be skipped by the seed script (it is idempotent).');
    }
    console.log('');
    console.log('Manager is ready. Safe to run seed-test-team.ts.');
  } catch (err) {
    console.error('Lookup failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
