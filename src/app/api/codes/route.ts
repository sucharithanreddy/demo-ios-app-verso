import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - List all unlock codes for admin's company
export async function GET(request: NextRequest) {
  try {
    // Check database connection
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
      include: {
        companyMemberships: {
          where: { role: 'admin' },
        },
      },
    });

    if (!user || user.companyMemberships.length === 0) {
      return forbiddenResponse('Admin access required');
    }

    // Get unlock codes created by this admin or for their company
    const codes = await prisma.unlockCode.findMany({
      where: {
        OR: [
          { createdById: user.id },
          { companyId: user.companyMemberships[0].companyId },
        ],
      },
      include: {
        usages: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ codes });
  } catch (error) {
    return serverErrorResponse(error, 'Fetching codes');
  }
}

// POST - Generate bulk unlock codes
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
      include: {
        companyMemberships: {
          where: { role: 'admin' },
          include: { company: true },
        },
      },
    });

    if (!user || user.companyMemberships.length === 0) {
      return forbiddenResponse('Admin access required');
    }

    const body = await request.json();
    const { count = 1, planType = 'PRO', maxUses = 1, expiresInDays } = body;

    // Validate
    if (count < 1 || count > 100) {
      return NextResponse.json({ error: 'Count must be between 1 and 100' }, { status: 400 });
    }

    const company = user.companyMemberships[0].company;
    const codes: any[] = [];

    // Generate codes
    for (let i = 0; i < count; i++) {
      const code = generateCode();
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const unlockCode = await prisma.unlockCode.create({
        data: {
          code,
          companyId: company.id,
          companyName: company.name,
          planType,
          maxUses,
          expiresAt,
          createdById: user.id,
        },
      });

      codes.push(unlockCode);
    }

    return NextResponse.json({ 
      success: true, 
      count: codes.length,
      codes: codes.map(c => ({
        id: c.id,
        code: c.code,
        planType: c.planType,
        maxUses: c.maxUses,
        expiresAt: c.expiresAt,
      })),
    });
  } catch (error) {
    return serverErrorResponse(error, 'Generating codes');
  }
}

// DELETE - Delete a code
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        companyMemberships: {
          where: { role: 'admin' },
        },
      },
    });

    if (!user || user.companyMemberships.length === 0) {
      return forbiddenResponse('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get('id');

    if (!codeId) {
      return NextResponse.json({ error: 'Code ID required' }, { status: 400 });
    }

    // Verify ownership
    const code = await prisma.unlockCode.findUnique({
      where: { id: codeId },
    });

    if (!code) {
      return notFoundResponse('Code not found');
    }

    if (code.companyId !== user.companyMemberships[0].companyId && code.createdById !== user.id) {
      return forbiddenResponse();
    }

    await prisma.unlockCode.delete({
      where: { id: codeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverErrorResponse(error, 'Deleting code');
  }
}

// Helper: Generate random code
function generateCode(): string {
  const prefix = 'VERSO';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix + '-';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      code += chars[randomBytes(1)[0] % chars.length];
    }
    if (i < 3) code += '-';
  }
  return code;
}
