import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const completeProfileSchema = z.object({
  userType: z.enum(['INDIVIDUAL', 'SALES_PERSON', 'SALES_MANAGER']),
  phone: z.string().optional(),
  industry: z.string().optional(),
  organizationName: z.string().optional(),
  organizationCode: z.string().optional(),
  managerName: z.string().optional(),
  managerEmail: z.string().optional(),
  designation: z.string().optional(),
});

/**
 * POST /api/auth/complete-profile
 * Completes user profile after Clerk authentication
 * Creates/updates user record in database with selected user type
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log('[COMPLETE-PROFILE API] Clerk userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('[COMPLETE-PROFILE API] Request body:', { ...body, userType: body.userType });
    
    const validatedData = completeProfileSchema.parse(body);
    console.log('[COMPLETE-PROFILE API] Validated userType:', validatedData.userType);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    console.log('[COMPLETE-PROFILE API] Existing user:', existingUser ? { id: existingUser.id, userType: existingUser.userType } : null);

    if (existingUser) {
      // User already exists, update their type
      console.log('[COMPLETE-PROFILE API] Updating existing user from', existingUser.userType, 'to', validatedData.userType);
      
      // Generate manager code if upgrading to SALES_MANAGER and doesn't have one
      let managerCode = existingUser.managerCode;
      if (validatedData.userType === 'SALES_MANAGER' && !existingUser.managerCode) {
        managerCode = `MGR-${Date.now().toString(36).toUpperCase()}`;
        console.log('[COMPLETE-PROFILE API] Generated new manager code:', managerCode);
      }
      
      const updatedUser = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          userType: validatedData.userType,
          phone: validatedData.phone || null,
          industry: validatedData.industry || null,
          organizationCode: validatedData.organizationCode || null,
          designation: validatedData.designation || null,
          managerCode,
        },
      });

      console.log('[COMPLETE-PROFILE API] Updated user:', { id: updatedUser.id, userType: updatedUser.userType, managerCode: updatedUser.managerCode });

      return NextResponse.json({ 
        success: true, 
        user: updatedUser 
      });
    }

    // Get user info from Clerk
    const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then(res => res.json());

    const email = clerkUser.email_addresses?.[0]?.email_address || '';
    const name = `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || email;
    const avatarUrl = clerkUser.image_url || null;

    console.log('[COMPLETE-PROFILE API] Clerk user info:', { email, name });

    // Handle organization for sales users
    let organizationId: string | null = null;
    
    if (validatedData.userType !== 'INDIVIDUAL' && validatedData.organizationCode) {
      // Try to find existing organization
      let organization = await prisma.organization.findUnique({
        where: { code: validatedData.organizationCode },
      });

      if (!organization && validatedData.organizationName) {
        // Create new organization
        organization = await prisma.organization.create({
          data: {
            name: validatedData.organizationName,
            code: validatedData.organizationCode,
          },
        });
      }

      organizationId = organization?.id || null;
    }

    // Generate unique manager code for sales managers
    let managerCode: string | null = null;
    if (validatedData.userType === 'SALES_MANAGER') {
      managerCode = `MGR-${Date.now().toString(36).toUpperCase()}`;
    }

    // Create new user
    console.log('[COMPLETE-PROFILE API] Creating new user with userType:', validatedData.userType);
    
    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        avatarUrl,
        userType: validatedData.userType,
        phone: validatedData.phone || null,
        industry: validatedData.industry || null,
        organizationId,
        organizationCode: validatedData.organizationCode || null,
        designation: validatedData.designation || null,
        managerCode,
        subscriptionStatus: 'FREE',
        subscriptionPlan: 'FREE',
      },
    });

    console.log('[COMPLETE-PROFILE API] Created user:', { id: newUser.id, userType: newUser.userType, clerkId: newUser.clerkId });

    // Create user streak record
    await prisma.userStreak.create({
      data: {
        userId: newUser.id,
      },
    });

    // Handle manager linking for sales persons
    if (validatedData.userType === 'SALES_PERSON' && validatedData.managerEmail) {
      // Try to find the manager by email
      const manager = await prisma.user.findFirst({
        where: {
          email: validatedData.managerEmail,
          userType: 'SALES_MANAGER',
        },
      });

      if (manager) {
        // Link the sales person to the manager
        await prisma.user.update({
          where: { id: newUser.id },
          data: { managerId: manager.id },
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        userType: newUser.userType,
        managerCode: newUser.managerCode,
      }
    });

  } catch (error) {
    console.error('[COMPLETE-PROFILE API] Error completing profile:', error);
    return NextResponse.json({ 
      error: 'Failed to complete profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
