// src/app/api/subscription/upgrade/route.ts
//
// POST /api/subscription/upgrade
//
// TEMPORARY TEST-GRANT ENDPOINT
//
// The pricing page (/pricing) has "Pay with Card" and "Pay with PayPal"
// buttons that need to grant the user Pro/Enterprise access. Until real
// Stripe + PayPal integrations are built, this endpoint serves as the
// shortcut: it flips the User row's subscriptionPlan + subscriptionStatus
// to the requested tier so the user can immediately access paid features
// (most importantly the /diagnostic/full Paid Test) for testing.
//
// WHEN STRIPE IS BUILT, this endpoint should be REPLACED by:
//   POST /api/subscription/create-checkout-session  → returns Stripe URL
//   POST /api/stripe/webhook                       → receives checkout.session.completed
//                                                    and updates the User row
//
// For now, anyone signed in can call this — which is fine for a
// pre-launch test environment, but MUST be locked down before launch.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  checkDatabaseConnection,
  databaseErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

const VALID_PLANS = ['PRO', 'ENTERPRISE'] as const;
type Plan = (typeof VALID_PLANS)[number];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const db = await checkDatabaseConnection();
    if (!db.connected) {
      return databaseErrorResponse();
    }

    const body = await request.json().catch(() => ({}));
    const requestedPlan = String(body?.plan ?? '').toUpperCase() as Plan;

    if (!VALID_PLANS.includes(requestedPlan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${VALID_PLANS.join(', ')}` },
        { status: 400 },
      );
    }

    // Find the user row linked to this Clerk user. Auto-create if missing
    // (matches the pattern in /api/diagnostic POST).
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: `pending+${userId.slice(-8)}@clerk.local`,
            userType: 'INDIVIDUAL',
          },
          select: { id: true },
        });
      } catch {
        user = await prisma.user.findUnique({
          where: { clerkId: userId },
          select: { id: true },
        });
        if (!user) throw new Error('Could not resolve user after race');
      }
    }

    // Grant the subscription. We set a 1-year currentPeriodEnd so the
    // status endpoint's `periodStillValid` check passes. When real
    // Stripe is built, this will be replaced by webhook-driven updates
    // with the actual billing period from Stripe.
    const periodEnd = new Date();
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: requestedPlan,
        subscriptionCurrentPeriodEnd: periodEnd,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        status: 'ACTIVE',
        plan: requestedPlan,
        currentPeriodEnd: periodEnd.toISOString(),
        isActive: true,
        isPro: requestedPlan === 'PRO' || requestedPlan === 'ENTERPRISE',
        isEnterprise: requestedPlan === 'ENTERPRISE',
      },
      // Flag this as test-granted so the UI can show a banner if needed.
      // Real Stripe checkouts will not set this flag.
      testGranted: true,
      message: `Subscription upgraded to ${requestedPlan} (test mode)`,
    });
  } catch (error) {
    return serverErrorResponse(error, 'Subscription upgrade');
  }
}
