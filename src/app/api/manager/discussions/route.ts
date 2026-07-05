import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Get all discussions for manager or a specific discussion
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
    const discussionId = searchParams.get('discussionId');
    const memberId = searchParams.get('memberId');

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get specific discussion
    if (discussionId) {
      const discussion = await prisma.managerDiscussion.findUnique({
        where: { id: discussionId },
        include: {
          member: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!discussion) {
        return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
      }

      // Verify access
      if (discussion.managerId !== currentUser.id && discussion.memberId !== currentUser.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json({ discussion });
    }

    // Get discussions for a manager
    if (currentUser.userType === 'SALES_MANAGER') {
      const discussions = await prisma.managerDiscussion.findMany({
        where: { managerId: currentUser.id },
        include: {
          member: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { messages: { where: { isRead: false, isManagerMessage: false } } }
          }
        },
        orderBy: { updatedAt: 'desc' },
      });

      return NextResponse.json({ discussions });
    }

    // Get discussions for a team member
    const discussions = await prisma.managerDiscussion.findMany({
      where: { memberId: currentUser.id },
      include: {
        manager: {
          select: { id: true, name: true, email: true, avatarUrl: true, designation: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: { where: { isRead: false, isManagerMessage: true } } }
        }
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ discussions });

  } catch (error) {
    return serverErrorResponse(error, 'Get discussions');
  }
}

// POST - Create a new discussion
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

    const body = await request.json();
    const { memberId, title, message, priority, recommendedActions, scheduledAt } = body;

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.userType !== 'SALES_MANAGER') {
      return NextResponse.json({ 
        error: 'Only managers can initiate discussions' 
      }, { status: 403 });
    }

    // Verify the member belongs to this manager
    const member = await prisma.user.findFirst({
      where: { id: memberId, managerId: currentUser.id },
    });

    if (!member) {
      return NextResponse.json({ 
        error: 'Team member not found or not in your team' 
      }, { status: 404 });
    }

    // Create discussion with first message
    const discussion = await prisma.managerDiscussion.create({
      data: {
        managerId: currentUser.id,
        memberId,
        title,
        priority: priority || 'normal',
        recommendedActions: recommendedActions || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        messages: {
          create: {
            senderId: currentUser.id,
            content: message,
            isManagerMessage: true,
          }
        }
      },
      include: {
        member: {
          select: { id: true, name: true, email: true }
        },
        messages: true,
      }
    });

    return NextResponse.json({ 
      success: true,
      discussion 
    });

  } catch (error) {
    return serverErrorResponse(error, 'Create discussion');
  }
}

// PUT - Update discussion (add message, mark as resolved, etc.)
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

    const body = await request.json();
    const { discussionId, message, status, markAsRead, recommendedActions } = body;

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const discussion = await prisma.managerDiscussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Verify access
    if (discussion.managerId !== currentUser.id && discussion.memberId !== currentUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const isManager = discussion.managerId === currentUser.id;

    // Add new message
    if (message) {
      await prisma.discussionMessage.create({
        data: {
          discussionId,
          senderId: currentUser.id,
          content: message,
          isManagerMessage: isManager,
        }
      });
    }

    // Update status
    if (status && isManager) {
      await prisma.managerDiscussion.update({
        where: { id: discussionId },
        data: { 
          status,
          completedAt: status === 'resolved' || status === 'closed' ? new Date() : null,
        }
      });
    }

    // Mark messages as read
    if (markAsRead) {
      await prisma.discussionMessage.updateMany({
        where: {
          discussionId,
          isRead: false,
          isManagerMessage: !isManager, // Mark messages from the other party as read
        },
        data: {
          isRead: true,
          readAt: new Date(),
        }
      });
    }

    // Update recommended actions
    if (recommendedActions && isManager) {
      await prisma.managerDiscussion.update({
        where: { id: discussionId },
        data: { recommendedActions }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return serverErrorResponse(error, 'Update discussion');
  }
}

// DELETE - Delete a discussion
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

    const { searchParams } = new URL(request.url);
    const discussionId = searchParams.get('discussionId');

    if (!discussionId) {
      return NextResponse.json({ error: 'Discussion ID required' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.userType !== 'SALES_MANAGER') {
      return NextResponse.json({ 
        error: 'Only managers can delete discussions' 
      }, { status: 403 });
    }

    await prisma.managerDiscussion.delete({
      where: { id: discussionId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return serverErrorResponse(error, 'Delete discussion');
  }
}
