import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/redirect
 * Returns the appropriate redirect URL based on user type
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        redirectUrl: '/sign-in',
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        userType: true,
        name: true,
      }
    });

    if (!user) {
      // User not found - redirect to complete-profile as fallback
      return NextResponse.json({ 
        redirectUrl: '/complete-profile',
        userType: null 
      });
    }

    // Determine redirect URL based on user type
    let redirectUrl: string;
    
    switch (user.userType) {
      case 'SALES_MANAGER':
        redirectUrl = '/manager-dashboard';
        break;
      case 'SALES_PERSON':
      case 'INDIVIDUAL':
      default:
        redirectUrl = '/sales-dashboard';
        break;
    }

    return NextResponse.json({ 
      redirectUrl,
      userType: user.userType,
      userName: user.name
    });

  } catch (error) {
    console.error('[REDIRECT API GET] Error:', error);
    return NextResponse.json({ 
      redirectUrl: '/sales-dashboard',
      error: 'Error determining user type'
    });
  }
}

/**
 * POST /api/auth/redirect
 * Creates/updates user with selected type and returns redirect URL
 * This is the main entry point after Clerk authentication
 * 
 * IMPORTANT: If a selectedUserType is provided, it ALWAYS takes precedence
 * and the redirect URL is based on that, NOT the database value
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log('[REDIRECT API POST] ========================================');
    console.log('[REDIRECT API POST] Clerk userId:', userId);
    
    if (!userId) {
      console.log('[REDIRECT API POST] ERROR: No userId - not authenticated');
      return NextResponse.json({ 
        redirectUrl: '/sign-in',
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Get the selected user type from request body
    const body = await request.json();
    const selectedUserType = body.selectedUserType as 'INDIVIDUAL' | 'SALES_PERSON' | 'SALES_MANAGER' | null | undefined;
    
    console.log('[REDIRECT API POST] Raw body:', JSON.stringify(body));
    console.log('[REDIRECT API POST] Selected user type:', selectedUserType);

    // Validate the selected type
    const validTypes = ['INDIVIDUAL', 'SALES_PERSON', 'SALES_MANAGER'];
    const isValidType = selectedUserType && validTypes.includes(selectedUserType);

    console.log('[REDIRECT API POST] Is valid type:', isValidType);

    // ─────────────────────────────────────────────────────────────────
    // REDIRECT-URL DETERMINATION (read this before touching the logic)
    //
    // For EXISTING users, the redirect MUST be based on their persisted
    // userType in the DB — NOT on `selectedUserType` from the request.
    // The landing page defaults selectedUserType to 'INDIVIDUAL', so if
    // we used it for existing users we'd silently demote managers to
    // individual on every sign-in after the first. That was the bug:
    // "manager login works the first time, second login bounces to
    // /sales-dashboard."
    //
    // For NEW users, we honor selectedUserType (or default to INDIVIDUAL).
    // Role switching for existing users is handled explicitly via
    // /complete-profile, NOT via this redirect flow.
    // ─────────────────────────────────────────────────────────────────
    let redirectUrl: string;
    let effectiveUserType: 'INDIVIDUAL' | 'SALES_PERSON' | 'SALES_MANAGER';

    try {
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      console.log('[REDIRECT API POST] Existing user found:', existingUser ? 'Yes' : 'No');
      if (existingUser) {
        console.log('[REDIRECT API POST] Existing user type:', existingUser.userType);
      }

      if (existingUser) {
        // ── EXISTING USER ──
        // Do NOT overwrite userType. Use the DB type for the redirect.
        effectiveUserType = existingUser.userType;
        console.log('[REDIRECT API POST] Using existing DB type:', effectiveUserType, '(selectedType ignored)');
      } else if (isValidType) {
        // ── NEW USER with explicit type selection ──
        effectiveUserType = selectedUserType as typeof effectiveUserType;
        console.log('[REDIRECT API POST] Creating new user with selected type:', effectiveUserType);

        // Get user info from Clerk
        const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        }).then(res => res.json());

        // Fallback email if Clerk API failed or returned no address.
        // Without this, prisma.user.create throws on the email @unique
        // constraint (empty string collides with any other empty-string
        // row, and is also just bad data). Same pattern used in
        // /api/diagnostic and /api/sessions.
        const email = clerkUser.email_addresses?.[0]?.email_address
          || `pending+${userId.slice(-8)}@clerk.local`;
        const name = `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim()
          || email;
        const avatarUrl = clerkUser.image_url || null;

        // Generate a manager code upfront for SALES_MANAGER users so the
        // dashboard doesn't sit on "Loading..." forever waiting for
        // /complete-profile to backfill it.
        const managerCode = effectiveUserType === 'SALES_MANAGER'
          ? `MGR-${Date.now().toString(36).toUpperCase()}`
          : undefined;

        // Check if user exists with this email (different Clerk account,
        // same email)
        const userByEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (userByEmail) {
          console.log('[REDIRECT API POST] Found user by email, linking clerkId...');
          await prisma.user.update({
            where: { id: userByEmail.id },
            data: {
              clerkId: userId,
              userType: effectiveUserType,
              ...(managerCode && !userByEmail.managerCode ? { managerCode } : {}),
            },
          });
        } else {
          await prisma.user.create({
            data: {
              clerkId: userId,
              email,
              name,
              avatarUrl,
              userType: effectiveUserType,
              subscriptionStatus: 'FREE',
              subscriptionPlan: 'FREE',
              ...(managerCode ? { managerCode } : {}),
            },
          });

          // Create user streak record
          const newUser = await prisma.user.findUnique({
            where: { clerkId: userId },
          });
          if (newUser) {
            await prisma.userStreak.create({
              data: { userId: newUser.id },
            });
          }
        }
        console.log('[REDIRECT API POST] User created/updated successfully');
      } else {
        // ── NEW USER, no type selected — default to INDIVIDUAL ──
        effectiveUserType = 'INDIVIDUAL';
        console.log('[REDIRECT API POST] No type selected, creating INDIVIDUAL');

        const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        }).then(res => res.json());

        const email = clerkUser.email_addresses?.[0]?.email_address
          || `pending+${userId.slice(-8)}@clerk.local`;
        const name = `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim()
          || email;
        const avatarUrl = clerkUser.image_url || null;

        const userByEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (userByEmail) {
          await prisma.user.update({
            where: { id: userByEmail.id },
            data: { clerkId: userId },
          });
        } else {
          await prisma.user.create({
            data: {
              clerkId: userId,
              email,
              name,
              avatarUrl,
              userType: 'INDIVIDUAL',
              subscriptionStatus: 'FREE',
              subscriptionPlan: 'FREE',
            },
          });

          const newUser = await prisma.user.findUnique({
            where: { clerkId: userId },
          });
          if (newUser) {
            await prisma.userStreak.create({
              data: { userId: newUser.id },
            });
          }
        }
      }
    } catch (dbError) {
      // DB failed — fall back to selectedType (or INDIVIDUAL) so the
      // user still gets redirected somewhere useful.
      console.error('[REDIRECT API POST] Database error (non-fatal):', dbError);
      effectiveUserType = isValidType
        ? (selectedUserType as typeof effectiveUserType)
        : 'INDIVIDUAL';
    }

    // Determine redirect URL from the effective type (DB type for existing
    // users, selected type for new users).
    redirectUrl = effectiveUserType === 'SALES_MANAGER'
      ? '/manager-dashboard'
      : '/sales-dashboard';

    console.log('[REDIRECT API POST] Final effectiveType:', effectiveUserType);
    console.log('[REDIRECT API POST] Final redirect URL:', redirectUrl);
    console.log('[REDIRECT API POST] ========================================');

    return NextResponse.json({
      redirectUrl,
      userType: effectiveUserType,
      selectedUserType: selectedUserType || null,
      debug: {
        hadSelectedType: isValidType,
        effectiveType: effectiveUserType,
        determinedRedirect: redirectUrl,
      }
    });

  } catch (error) {
    console.error('[REDIRECT API POST] Error:', error);
    // Default to sales-dashboard on error
    return NextResponse.json({ 
      redirectUrl: '/sales-dashboard',
      error: 'Error processing request'
    });
  }
}
