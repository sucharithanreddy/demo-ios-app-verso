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
// POST - Submit a "right to object" request under GDPR Article 21.
// This is the buried third option: user wants to be excluded
// from ALL manager views entirely (not just anonymized).
//
// Until the request is resolved, the user's data is hidden from
// all manager views as a precaution (the manager dashboard API
// checks for any pending objection and excludes that user).
//
// Body: { reason?: string }
// ============================================================
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

    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === 'string' ? body.reason.slice(0, 1000) : null;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert: if there's already a request, update it; otherwise create new
    const objection = await prisma.managerVisibilityObjection.upsert({
      where: { userId: user.id },
      update: {
        reason,
        status: 'PENDING', // Reset to PENDING if user re-submits
        resolvedAt: null,
        adminNotes: null,
      },
      create: {
        userId: user.id,
        reason,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      objection: {
        id: objection.id,
        status: objection.status,
        createdAt: objection.createdAt,
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Submit manager visibility objection');
  }
}

// ============================================================
// DELETE - Withdraw a previously submitted objection request
// ============================================================
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Withdraw the objection
    await prisma.managerVisibilityObjection
      .update({
        where: { userId: user.id },
        data: {
          status: 'WITHDRAWN',
          resolvedAt: new Date(),
        },
      })
      .catch(() => {
        // No existing objection - that's fine, just succeed silently
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverErrorResponse(error, 'Withdraw manager visibility objection');
  }
}
