import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// Helper to get user info from Clerk API
async function getClerkUserInfo(userId: string) {
  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });
    
    if (!response.ok) {
      console.error('[CLERK API] Failed to fetch user:', response.status, response.statusText);
      return null;
    }
    
    const clerkUser = await response.json();
    console.log('[CLERK API] User data fetched:', clerkUser.id);
    
    return {
      email: clerkUser.email_addresses?.[0]?.email_address || '',
      name: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || clerkUser.email_addresses?.[0]?.email_address || 'User',
      avatarUrl: clerkUser.image_url || null,
    };
  } catch (error) {
    console.error('[CLERK API] Error fetching user:', error);
    return null;
  }
}

// Helper to get or create user
async function getOrCreateUser(userId: string) {
  // First, try to find user by clerkId
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (user) {
    return user;
  }

  console.log('[GENERATE CODE] User not found by clerkId, checking email...');
  
  // Get user info from Clerk
  const clerkUserInfo = await getClerkUserInfo(userId);
  
  if (!clerkUserInfo || !clerkUserInfo.email) {
    console.error('[GENERATE CODE] Failed to get user info from Clerk');
    return null;
  }

  const { email, name, avatarUrl } = clerkUserInfo;

  // Check if user exists with this email (might have different/null clerkId)
  user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    // User exists with this email - update the clerkId
    console.log('[GENERATE CODE] Found user by email, updating clerkId...');
    user = await prisma.user.update({
      where: { id: user.id },
      data: { clerkId: userId },
    });
    return user;
  }

  // User doesn't exist at all - create new user
  console.log('[GENERATE CODE] Creating new user...');
  
  try {
    user = await prisma.user.create({
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

    // Create user streak
    await prisma.userStreak.create({
      data: { userId: user.id },
    });

    console.log('[GENERATE CODE] Created new user:', user.id);
    return user;
  } catch (createError: any) {
    // Handle race condition - another request might have created the user
    if (createError.code === 'P2002') {
      console.log('[GENERATE CODE] Race condition detected, retrying lookup...');
      
      // Try to find by clerkId again
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });
      
      if (user) return user;
      
      // Try to find by email
      user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (user) {
        // Update clerkId
        user = await prisma.user.update({
          where: { id: user.id },
          data: { clerkId: userId },
        });
        return user;
      }
    }
    
    console.error('[GENERATE CODE] Error creating user:', createError);
    return null;
  }
}

// POST - Generate manager code for existing managers who don't have one
export async function POST(request: NextRequest) {
  try {
    const db = await checkDatabaseConnection();
    if (!db.connected) {
      return databaseErrorResponse();
    }

    const { userId } = await auth();
    if (!userId) {
      return unauthorizedResponse();
    }

    // Get or create user
    const user = await getOrCreateUser(userId);

    if (!user) {
      return NextResponse.json({ 
        error: 'Failed to retrieve account',
        message: 'Unable to retrieve your account information. Please try again later.'
      }, { status: 500 });
    }

    // Verify user is a manager
    if (user.userType !== 'SALES_MANAGER') {
      return NextResponse.json({ 
        error: 'Only managers can have a manager code. Please update your account type first.',
        userType: user.userType 
      }, { status: 403 });
    }

    // If already has a code, return it
    if (user.managerCode) {
      return NextResponse.json({
        success: true,
        managerCode: user.managerCode,
        message: 'Manager code already exists',
      });
    }

    // Generate new code with random suffix for uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const managerCode = `MGR-${randomSuffix}`;

    console.log('[GENERATE MANAGER CODE] Generating code for user:', userId, 'Code:', managerCode);

    // Update user with new code
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: { managerCode },
    });

    console.log('[GENERATE MANAGER CODE] Successfully updated user:', updatedUser.id);

    return NextResponse.json({
      success: true,
      managerCode: updatedUser.managerCode,
      message: 'Manager code generated successfully',
    });

  } catch (error) {
    console.error('[GENERATE MANAGER CODE] Error:', error);
    
    // Check for specific Prisma errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('column') || errorMessage.includes('does not exist')) {
      return NextResponse.json({ 
        error: 'Database schema needs to be updated. The deployment may still be in progress.',
        details: errorMessage
      }, { status: 500 });
    }
    
    if (errorMessage.includes('Unique constraint')) {
      return NextResponse.json({ 
        error: 'Code collision occurred. Please try again.',
        details: errorMessage
      }, { status: 500 });
    }
    
    return NextResponse.json({
      error: 'Failed to generate manager code',
      details: errorMessage
    }, { status: 500 });
  }
}
