/**
 * Safe Clerk imports for server-side code
 *
 * This module provides safe wrappers around Clerk functions
 * that handle the case where Clerk is not configured.
 */

import { NextResponse } from 'next/server'

// Check if Clerk is configured
export function isClerkConfigured(): boolean {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const sk = process.env.CLERK_SECRET_KEY

  // Check if both keys exist and are not placeholder values
  return !!(
    pk &&
    sk &&
    pk.length > 10 &&
    sk.length > 10 &&
    !pk.includes('placeholder') &&
    !sk.includes('placeholder')
  )
}

// Safe auth wrapper
export async function safeAuth() {
  if (!isClerkConfigured()) {
    return { userId: null, user: null }
  }

  try {
    const { auth } = await import('@clerk/nextjs/server')
    const { userId } = await auth()
    return { userId, user: null }
  } catch (error) {
    console.error('Clerk auth error:', error)
    return { userId: null, user: null }
  }
}

// Safe currentUser wrapper
export async function safeCurrentUser() {
  if (!isClerkConfigured()) {
    return null
  }

  try {
    const { currentUser } = await import('@clerk/nextjs/server')
    return await currentUser()
  } catch (error) {
    console.error('Clerk currentUser error:', error)
    return null
  }
}

// Helper for API routes to check auth
export async function withAuth<T>(
  handler: (userId: string) => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T | NextResponse> {
  const { userId } = await safeAuth()

  if (!userId) {
    if (fallback) {
      return fallback()
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return handler(userId)
}
