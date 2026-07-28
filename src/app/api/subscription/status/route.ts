// src/app/api/subscription/status/route.ts
//
// GET /api/subscription/status
//
// Returns the current user's subscription state. Used by the
// useSubscription() hook to gate paid-tier features like the
// 64-question Full Map (/diagnostic/full).
//
// Source of truth for "is this user paid?":
//   1. User.subscriptionPlan === 'PRO' or 'ENTERPRISE' AND
//      User.subscriptionStatus === 'ACTIVE' AND
//      (subscriptionCurrentPeriodEnd is null OR in the future)
//   2. OR the user has at least one UnlockCodeUsage row pointing
//      to an active, non-expired UnlockCode. This is the path
//      managers use to grant free Pro access to their team -
//      they generate a code in /admin/codes, share it, the team
//      member redeems it at /profile, and the redemption row
//      grants Pro access until the code expires.
//
// Response shape (matches the SubscriptionData interface in
// src/hooks/use-subscription.ts):
//
//   {
//     subscription: {
//       status: 'FREE' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED',
//       plan: 'FREE' | 'PRO' | 'ENTERPRISE',
//       currentPeriodEnd: string | null,
//       isActive: boolean,
//       isPro: boolean,
//       isEnterprise: boolean
//     }
//   }

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  checkDatabaseConnection,
  databaseErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const db = await checkDatabaseConnection();
    if (!db.connected) {
      return databaseErrorResponse();
    }

    // Load the user row + any active unlock-code usages in parallel
    const [user, unlockUsages] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkId: userId },
        select: {
          subscriptionStatus: true,
          subscriptionPlan: true,
          subscriptionCurrentPeriodEnd: true,
        },
      }),
      prisma.unlockCodeUsage.findMany({
        where: {
          user: { clerkId: userId },
          unlockCode: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        },
        include: {
          unlockCode: {
            select: {
              code: true,
              planType: true,
              companyName: true,
              expiresAt: true,
            },
          },
        },
        orderBy: { usedAt: 'desc' },
        take: 5,
      }),
    ]);

    // No user row yet → free tier. This happens for new Clerk signups
    // before /api/auth/complete-profile runs. We return FREE rather
    // than 404 so the hook can settle cleanly.
    if (!user) {
      return NextResponse.json({
        subscription: {
          status: 'FREE' as const,
          plan: 'FREE' as const,
          currentPeriodEnd: null,
          isActive: false,
          isPro: false,
          isEnterprise: false,
        },
      });
    }

    // ---- Resolve subscription state from User row ----
    const now = new Date();
    const periodEnd = user.subscriptionCurrentPeriodEnd;
    const periodStillValid =
      !periodEnd || new Date(periodEnd) > now;

    const stripeActive =
      user.subscriptionStatus === 'ACTIVE' && periodStillValid;

    // ---- Resolve unlock-code state ----
    // Any active (non-expired) unlock code with planType PRO or ENTERPRISE
    // grants the corresponding tier. Manager-issued codes are the primary
    // way team members get free Pro access without going through Stripe.
    const hasProCode = unlockUsages.some(
      u => u.unlockCode.planType === 'PRO',
    );
    const hasEnterpriseCode = unlockUsages.some(
      u => u.unlockCode.planType === 'ENTERPRISE',
    );

    // ---- Compute final plan ----
    // Enterprise beats Pro beats Free. Stripe beats unlock-code only
    // when both exist (so a user who buys Enterprise via Stripe but
    // also has a Pro unlock code keeps Enterprise).
    let plan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE';
    let status: 'FREE' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' = 'FREE';

    if (user.subscriptionPlan === 'ENTERPRISE' && stripeActive) {
      plan = 'ENTERPRISE';
      status = 'ACTIVE';
    } else if (user.subscriptionPlan === 'PRO' && stripeActive) {
      plan = 'PRO';
      status = 'ACTIVE';
    } else if (hasEnterpriseCode) {
      plan = 'ENTERPRISE';
      status = 'ACTIVE';
    } else if (hasProCode) {
      plan = 'PRO';
      status = 'ACTIVE';
    } else if (user.subscriptionStatus === 'CANCELLED') {
      // Stripe cancelled - keep the plan label for UX but mark as cancelled
      // so the UI can show "your subscription ends on X" rather than
      // immediately downgrading.
      plan = user.subscriptionPlan === 'ENTERPRISE' ? 'ENTERPRISE'
        : user.subscriptionPlan === 'PRO' ? 'PRO' : 'FREE';
      status = 'CANCELLED';
    } else if (user.subscriptionStatus === 'EXPIRED') {
      plan = 'FREE';
      status = 'EXPIRED';
    }

    const isActive = status === 'ACTIVE';
    const isPro = isActive && (plan === 'PRO' || plan === 'ENTERPRISE');
    const isEnterprise = isActive && plan === 'ENTERPRISE';

    return NextResponse.json({
      subscription: {
        status,
        plan,
        currentPeriodEnd: periodEnd ? periodEnd.toISOString() : null,
        isActive,
        isPro,
        isEnterprise,
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Subscription status');
  }
}
