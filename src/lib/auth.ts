/**
 * Safe authentication utilities
 *
 * This module provides safe wrappers that handle both:
 * 1. Build time (when Clerk env vars aren't available)
 * 2. Runtime (when Clerk may or may not be configured)
 */

import { NextRequest, NextResponse } from 'next/server'

// Check if Clerk is configured at runtime
export function isClerkConfigured(): boolean {
  if (typeof process === 'undefined') return false
  
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const sk = process.env.CLERK_SECRET_KEY

  return !!(
    pk &&
    sk &&
    pk.length > 10 &&
    sk.length > 10 &&
    !pk.includes('placeholder') &&
    !sk.includes('placeholder')
  )
}

// Safe auth that dynamically imports Clerk only when needed
export async function getAuth() {
  if (!isClerkConfigured()) {
    return { userId: null }
  }

  try {
    // Dynamic import to avoid build-time initialization
    const clerk = await import('@clerk/nextjs/server')
    const authResult = await clerk.auth()
    return authResult
  } catch (error) {
    console.error('Clerk auth error:', error)
    return { userId: null }
  }
}

// Get current user from Clerk
export async function getCurrentUser() {
  if (!isClerkConfigured()) {
    return null
  }

  try {
    const clerk = await import('@clerk/nextjs/server')
    return await clerk.currentUser()
  } catch (error) {
    console.error('Clerk currentUser error:', error)
    return null
  }
}

// Helper for API routes - returns userId or null
export async function requireAuth(request?: NextRequest): Promise<string | null> {
  const { userId } = await getAuth()
  
  if (!userId) {
    // Check for guest session in headers/cookies if needed
    if (request) {
      const guestId = request.headers.get('x-guest-id')
      if (guestId) return `guest_${guestId}`
    }
    return null
  }
  
  return userId
}

// Helper for protected API routes
export async function withAuth<T>(
  handler: (userId: string) => Promise<T>,
  unauthorizedResponse?: () => Promise<NextResponse>
): Promise<T | NextResponse> {
  const { userId } = await getAuth()

  if (!userId) {
    if (unauthorizedResponse) {
      return unauthorizedResponse()
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return handler(userId)
}
