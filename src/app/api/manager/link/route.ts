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

// POST - Link a sales person to a manager using manager code
export async function POST(request: NextRequest) {
  try {
    const db = await checkDatabaseConnection();
    if (!db.connected) {
      return databaseErrorResponse();
    }

    const { userId } = await auth();
    console.log('[LINK MANAGER] Clerk userId:', userId);
    
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { managerCode } = body;

    console.log('[LINK MANAGER] Manager code received:', managerCode);

    if (!managerCode || typeof managerCode !== 'string') {
      return NextResponse.json({ 
        error: 'Manager code is required' 
      }, { status: 400 });
    }

    // Find the current user
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    console.log('[LINK MANAGER] Current user found:', currentUser ? 'Yes' : 'No');

    if (!currentUser) {
      // User doesn't exist in database - try to find by email or create them
      console.log('[LINK MANAGER] User not found in database, checking email...');
      
      // Get user info from Clerk
      const clerkUserInfo = await getClerkUserInfo(userId);
      
      if (!clerkUserInfo || !clerkUserInfo.email) {
        console.error('[LINK MANAGER] Failed to get user info from Clerk');
        return NextResponse.json({ 
          error: 'Account setup required',
          message: 'Unable to retrieve your account information. Please try refreshing the page or contact support.'
        }, { status: 400 });
      }

      const { email, name, avatarUrl } = clerkUserInfo;
      console.log('[LINK MANAGER] Clerk user data:', email);

      // First, find the manager by their code
      const manager = await prisma.user.findUnique({
        where: { managerCode: managerCode.trim().toUpperCase() },
      });

      console.log('[LINK MANAGER] Manager found:', manager ? 'Yes' : 'No');

      if (!manager) {
        return NextResponse.json({ 
          error: 'Invalid manager code',
          message: 'No manager found with this code. Please check and try again.'
        }, { status: 404 });
      }

      // Verify the manager is actually a manager
      if (manager.userType !== 'SALES_MANAGER') {
        return NextResponse.json({ 
          error: 'Invalid manager',
          message: 'This user is not registered as a sales manager.'
        }, { status: 400 });
      }

      // Prevent self-linking (by email)
      if (manager.email === email) {
        return NextResponse.json({ 
          error: 'Cannot link to yourself',
          message: 'You cannot link to your own manager account.'
        }, { status: 400 });
      }

      // Check if user exists with this email (might have different/null clerkId)
      let existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // User exists with this email - update the clerkId and link to manager
        console.log('[LINK MANAGER] Found user by email, updating clerkId and linking...');
        
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            clerkId: userId,
            managerId: manager.id,
            userType: 'SALES_PERSON'
          },
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
                designation: true,
              }
            }
          }
        });
        
        return NextResponse.json({
          success: true,
          message: `Successfully linked to ${manager.name || manager.email}`,
          manager: updatedUser.manager,
        });
      }

      // User doesn't exist at all - create new user
      try {
        // Create user and link to manager in one transaction
        const newUser = await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            name,
            avatarUrl,
            userType: 'SALES_PERSON',
            managerId: manager.id,
            subscriptionStatus: 'FREE',
            subscriptionPlan: 'FREE',
          },
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
                designation: true,
              }
            }
          }
        });

        console.log('[LINK MANAGER] Created new user and linked:', newUser.id);
        
        // Create user streak
        await prisma.userStreak.create({
          data: { userId: newUser.id },
        });

        return NextResponse.json({
          success: true,
          message: `Successfully linked to ${manager.name || manager.email}`,
          manager: newUser.manager,
        });

      } catch (createError: any) {
        console.error('[LINK MANAGER] Error creating user:', createError);
        
        // Check for unique constraint violation (user already exists)
        if (createError.code === 'P2002') {
          // User was created by another request, try to update instead
          console.log('[LINK MANAGER] Race condition detected, retrying...');
          
          // Try to find by clerkId again
          existingUser = await prisma.user.findUnique({
            where: { clerkId: userId },
          });
          
          if (!existingUser) {
            // Try to find by email
            existingUser = await prisma.user.findUnique({
              where: { email },
            });
          }
          
          if (existingUser) {
            const updatedUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: { 
                clerkId: userId,
                managerId: manager.id,
                userType: 'SALES_PERSON'
              },
              include: {
                manager: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    designation: true,
                  }
                }
              }
            });
            
            return NextResponse.json({
              success: true,
              message: `Successfully linked to ${manager.name || manager.email}`,
              manager: updatedUser.manager,
            });
          }
        }
        
        return NextResponse.json({ 
          error: 'Failed to create user account. Please try again.',
          details: createError instanceof Error ? createError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Find the manager by their code
    const manager = await prisma.user.findUnique({
      where: { managerCode: managerCode.trim().toUpperCase() },
    });

    console.log('[LINK MANAGER] Manager found:', manager ? 'Yes' : 'No', manager ? `(${manager.id})` : '');

    if (!manager) {
      return NextResponse.json({ 
        error: 'Invalid manager code',
        message: 'No manager found with this code. Please check and try again.'
      }, { status: 404 });
    }

    // Prevent self-linking
    if (manager.id === currentUser.id) {
      return NextResponse.json({ 
        error: 'Cannot link to yourself' 
      }, { status: 400 });
    }

    // Verify the manager is actually a manager
    if (manager.userType !== 'SALES_MANAGER') {
      return NextResponse.json({ 
        error: 'Invalid manager',
        message: 'This user is not registered as a sales manager.'
      }, { status: 400 });
    }

    // Update the user with the manager
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { 
        managerId: manager.id,
        userType: 'SALES_PERSON'
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
          }
        }
      }
    });

    console.log('[LINK MANAGER] Successfully linked user to manager');

    return NextResponse.json({
      success: true,
      message: `Successfully linked to ${manager.name || manager.email}`,
      manager: updatedUser.manager,
    });

  } catch (error) {
    console.error('[LINK MANAGER] Error:', error);
    return serverErrorResponse(error, 'Link manager');
  }
}

// DELETE - Unlink from manager
export async function DELETE(request: NextRequest) {
  try {
    const db = await checkDatabaseConnection();
    if (!db.connected) {
      return databaseErrorResponse();
    }

    const { userId } = await auth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { managerId: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unlinked from manager',
    });

  } catch (error) {
    return serverErrorResponse(error, 'Unlink manager');
  }
}
