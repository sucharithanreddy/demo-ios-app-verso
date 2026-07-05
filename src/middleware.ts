import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Check if Clerk is configured
const isClerkConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
}

// Public routes that don't require authentication
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/api/webhooks',
  '/api/reframe',
  '/widget',
  '/demo',
]

const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route => pathname.startsWith(route))
}

// Dashboard uses its own auth (password-based)
const isDashboardRoute = (pathname: string) => {
  return pathname.startsWith('/dashboard')
}

// Create a route matcher for public routes
const isPublic = createRouteMatcher(publicRoutes)

// Clerk middleware wrapper
export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl

  // Allow public routes without auth
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Dashboard has its own authentication
  if (isDashboardRoute(pathname)) {
    return NextResponse.next()
  }

  // For all other routes, Clerk will handle auth
  // The auth() function in API routes will work now
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
