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

  console.log('[PROFILE] User not found by clerkId, checking email...');
  
  // Get user info from Clerk
  const clerkUserInfo = await getClerkUserInfo(userId);
  
  if (!clerkUserInfo || !clerkUserInfo.email) {
    console.error('[PROFILE] Failed to get user info from Clerk');
    return null;
  }

  const { email, name, avatarUrl } = clerkUserInfo;

  // Check if user exists with this email (might have different/null clerkId)
  user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    // User exists with this email - update the clerkId
    console.log('[PROFILE] Found user by email, updating clerkId...');
    user = await prisma.user.update({
      where: { id: user.id },
      data: { clerkId: userId },
    });
    return user;
  }

  // User doesn't exist at all - create new user
  console.log('[PROFILE] Creating new user...');
  
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

    console.log('[PROFILE] Created new user:', user.id);
    return user;
  } catch (createError: any) {
    // Handle race condition - another request might have created the user
    if (createError.code === 'P2002') {
      console.log('[PROFILE] Race condition detected, retrying lookup...');
      
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
    
    console.error('[PROFILE] Error creating user:', createError);
    return null;
  }
}

// GET - Get current user profile
export async function GET(request: NextRequest) {
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

    // Get full profile with relations
    const fullProfile = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        avatarUrl: true,
        phone: true,
        userType: true,
        industry: true,
        designation: true,
        companyName: true,
        department: true,
        bio: true,
        timezone: true,
        streetAddress: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        managerCode: true,
        managerId: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
          },
        },
      },
    });

    return NextResponse.json({ user: fullProfile });

  } catch (error) {
    console.error('[GET PROFILE] Error:', error);
    return serverErrorResponse(error, 'Get profile');
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    console.log('[UPDATE PROFILE] Request body:', body);

    const {
      name,
      phone,
      industry,
      designation,
      companyName,
      department,
      bio,
      timezone,
      streetAddress,
      city,
      state,
      country,
      zipCode,
      avatarUrl,
    } = body;

    // Build update data object with only provided fields
    const updateData: Record<string, any> = {};
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (industry !== undefined) updateData.industry = industry;
    if (designation !== undefined) updateData.designation = designation;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (department !== undefined) updateData.department = department;
    if (bio !== undefined) updateData.bio = bio;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (streetAddress !== undefined) updateData.streetAddress = streetAddress;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    console.log('[UPDATE PROFILE] Update data:', updateData);

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: updateData,
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        avatarUrl: true,
        phone: true,
        userType: true,
        industry: true,
        designation: true,
        companyName: true,
        department: true,
        bio: true,
        timezone: true,
        streetAddress: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        managerCode: true,
        managerId: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
          },
        },
      },
    });

    console.log('[UPDATE PROFILE] Updated user:', { id: updatedUser.id, name: updatedUser.name });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });

  } catch (error) {
    console.error('[UPDATE PROFILE] Error:', error);
    
    // Check if it's a Prisma error about missing column
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('column') || errorMessage.includes('does not exist')) {
      return NextResponse.json({ 
        error: 'Database schema needs to be updated. Please run: npx prisma db push',
        details: errorMessage
      }, { status: 500 });
    }
    
    return serverErrorResponse(error, 'Update profile');
  }
}
