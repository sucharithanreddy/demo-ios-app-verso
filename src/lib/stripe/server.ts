// ============================================================================
// Stripe server client — singleton
// ============================================================================

import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe routes will fail.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
  appInfo: {
    name: 'Verso',
    version: '1.0.0',
  },
});

// ---------------------------------------------------------------------------
// Price IDs — set these in your .env after creating products in Stripe
// ---------------------------------------------------------------------------

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? '',  // price_xxx
  yearly: process.env.STRIPE_PRICE_YEARLY ?? '',    // price_xxx
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get or create a Stripe Customer for a Verso user.
 * Stores the customer ID on the User record for future use.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  // 1. Check if we already have a customer ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    // Verify the customer still exists in Stripe
    try {
      await stripe.customers.retrieve(user.stripeCustomerId);
      return user.stripeCustomerId;
    } catch {
      // Customer was deleted in Stripe — fall through to create a new one
    }
  }

  // 2. Create a new customer
  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: {
      versoUserId: userId,
    },
  });

  // 3. Save the customer ID
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Map a Stripe Price ID to a Verso plan name.
 */
export function priceIdToPlan(priceId: string): 'PRO' | 'ENTERPRISE' | 'FREE' {
  if (priceId === STRIPE_PRICES.monthly || priceId === STRIPE_PRICES.yearly) {
    return 'PRO';
  }
  return 'FREE';
}

/**
 * Map a Stripe subscription status to a Verso subscription status.
 */
export function mapStripeStatus(
  status: Stripe.Subscription.Status
): 'FREE' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'ACTIVE';
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
      return 'EXPIRED';
    case 'canceled':
      return 'CANCELLED';
    case 'ended':
      return 'EXPIRED';
    default:
      return 'FREE';
  }
}
