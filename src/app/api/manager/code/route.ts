import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Get manager code or generate one
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.userType !== 'SALES_MANAGER') {
      return NextResponse.json({ 
        error: 'Only managers can have a manager code',
        message: 'Update your profile to be a sales manager first.'
      }, { status: 403 });
    }

    // If manager already has a code, return it
    if (user.managerCode) {
      return NextResponse.json({
        managerCode: user.managerCode,
        teamSize: await prisma.user.count({ where: { managerId: user.id } }),
      });
    }

    // Generate a new unique code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'MGR-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let newCode = generateCode();
    let attempts = 0;
    
    // Ensure uniqueness
    while (await prisma.user.findUnique({ where: { managerCode: newCode } })) {
      newCode = generateCode();
      attempts++;
      if (attempts > 10) {
        return NextResponse.json({ 
          error: 'Failed to generate unique code' 
        }, { status: 500 });
      }
    }

    // Update user with new code
    await prisma.user.update({
      where: { id: user.id },
      data: { managerCode: newCode },
    });

    return NextResponse.json({
      managerCode: newCode,
      teamSize: 0,
    });

  } catch (error) {
    return serverErrorResponse(error, 'Get manager code');
  }
}

// POST - Regenerate manager code
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

    if (!user || user.userType !== 'SALES_MANAGER') {
      return NextResponse.json({ 
        error: 'Only managers can regenerate codes' 
      }, { status: 403 });
    }

    // Generate new code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'MGR-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let newCode = generateCode();
    while (await prisma.user.findUnique({ where: { managerCode: newCode } })) {
      newCode = generateCode();
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { managerCode: newCode },
    });

    return NextResponse.json({
      managerCode: newCode,
      message: 'New manager code generated. Share this with your team members.',
    });

  } catch (error) {
    return serverErrorResponse(error, 'Regenerate manager code');
  }
}
