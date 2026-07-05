import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Validate an unlock code
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

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const unlockCode = await prisma.unlockCode.findUnique({
      where: { code },
    });

    if (!unlockCode) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid code' 
      }, { status: 404 });
    }

    // Check if code is still active
    if (!unlockCode.isActive) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This code has been deactivated' 
      }, { status: 400 });
    }

    // Check usage limit
    if (unlockCode.usedCount >= unlockCode.maxUses) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This code has reached its usage limit' 
      }, { status: 400 });
    }

    // Check expiration
    if (unlockCode.expiresAt && new Date(unlockCode.expiresAt) < new Date()) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This code has expired' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      valid: true,
      code: {
        planType: unlockCode.planType,
        companyName: unlockCode.companyName,
        remainingUses: unlockCode.maxUses - unlockCode.usedCount,
        expiresAt: unlockCode.expiresAt,
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Validate code');
  }
}

// POST - Redeem an unlock code
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const unlockCode = await prisma.unlockCode.findUnique({
      where: { code },
    });

    if (!unlockCode) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
    }

    // Validate code
    if (!unlockCode.isActive) {
      return NextResponse.json({ error: 'This code has been deactivated' }, { status: 400 });
    }

    if (unlockCode.usedCount >= unlockCode.maxUses) {
      return NextResponse.json({ error: 'This code has reached its usage limit' }, { status: 400 });
    }

    if (unlockCode.expiresAt && new Date(unlockCode.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This code has expired' }, { status: 400 });
    }

    // Check if user already redeemed this code
    const existingUsage = await prisma.unlockCodeUsage.findFirst({
      where: {
        codeId: unlockCode.id,
        userId: user.id,
      },
    });

    if (existingUsage) {
      return NextResponse.json({ error: 'You have already redeemed this code' }, { status: 400 });
    }

    // Redeem code in transaction
    await prisma.$transaction([
      // Record usage
      prisma.unlockCodeUsage.create({
        data: {
          codeId: unlockCode.id,
          userId: user.id,
        },
      }),
      // Increment usage count
      prisma.unlockCode.update({
        where: { id: unlockCode.id },
        data: { usedCount: { increment: 1 } },
      }),
      // Update user subscription
      prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionPlan: unlockCode.planType === 'ENTERPRISE' ? 'ENTERPRISE' : 'PRO',
        },
      }),
    ]);

    // Add to company if code is associated with one
    if (unlockCode.companyId) {
      await prisma.companyMember.upsert({
        where: {
          companyId_userId: {
            companyId: unlockCode.companyId,
            userId: user.id,
          },
        },
        create: {
          companyId: unlockCode.companyId,
          userId: user.id,
          role: 'member',
        },
        update: {},
      }).catch(err => console.error('Failed to add to company:', err));
    }

    return NextResponse.json({ 
      success: true,
      message: 'Code redeemed successfully',
      planType: unlockCode.planType,
    });
  } catch (error) {
    return serverErrorResponse(error, 'Redeem code');
  }
}
