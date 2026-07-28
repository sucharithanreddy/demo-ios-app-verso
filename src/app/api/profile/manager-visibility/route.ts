import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  checkDatabaseConnection,
  databaseErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-utils';

// ============================================================
// GET - Fetch the current user's manager visibility preference
// ============================================================
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        managerVisibility: true,
        userType: true,
        managerId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Also fetch any pending objection request
    const objection = await prisma.managerVisibilityObjection.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      managerVisibility: user.managerVisibility,
      userType: user.userType,
      hasManager: !!user.managerId,
      objection: objection
        ? {
            status: objection.status,
            reason: objection.reason,
            createdAt: objection.createdAt,
            resolvedAt: objection.resolvedAt,
          }
        : null,
    });
  } catch (error) {
    return serverErrorResponse(error, 'Get manager visibility');
  }
}

// ============================================================
// PATCH - Update the user's manager visibility preference
// Body: { managerVisibility: 'NAMED' | 'ANONYMOUS' }
// ============================================================
export async function PATCH(request: NextRequest) {
  try {
    const db = await checkDatabaseConnection();
    if (!db.connected) {
      return databaseErrorResponse();
    }

    const { userId } = await auth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { managerVisibility } = body;

    // Validate input
    if (managerVisibility !== 'NAMED' && managerVisibility !== 'ANONYMOUS') {
      return NextResponse.json(
        { error: 'Invalid value. Must be NAMED or ANONYMOUS.' },
        { status: 400 }
      );
    }

    // Update the user's preference
    const updated = await prisma.user.update({
      where: { clerkId: userId },
      data: { managerVisibility },
      select: {
        id: true,
        managerVisibility: true,
      },
    });

    return NextResponse.json({
      success: true,
      managerVisibility: updated.managerVisibility,
    });
  } catch (error) {
    return serverErrorResponse(error, 'Update manager visibility');
  }
}
