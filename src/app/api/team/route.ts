import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Fetch team details
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
    const teamId = searchParams.get('teamId');

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (teamId) {
      // Fetch specific team
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          members: {
            include: {
              user: {
                include: {
                  diagnosticResults: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                  },
                  salesCheckIns: {
                    orderBy: { date: 'desc' },
                    take: 7,
                  },
                },
              },
            },
          },
          company: {
            include: {
              members: {
                where: { userId: user.id },
              },
            },
          },
        },
      });

      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }

      // Check if user has access
      const isManager = team.managerId === user.id;
      const isCompanyAdmin = team.company.members.some(m => 
        m.userId === user.id && ['admin', 'manager'].includes(m.role)
      );

      if (!isManager && !isCompanyAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json({ team });
    } else {
      // Fetch all teams user has access to
      const teams = await prisma.team.findMany({
        where: {
          OR: [
            { managerId: user.id },
            {
              company: {
                members: {
                  some: {
                    userId: user.id,
                    role: { in: ['admin', 'manager'] },
                  },
                },
              },
            },
          ],
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({ teams });
    }
  } catch (error) {
    return serverErrorResponse(error, 'Team fetch');
  }
}

// POST - Create a new team
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
          where: { role: { in: ['admin', 'manager'] } },
        },
      },
    });

    if (!user || user.companyMemberships.length === 0) {
      return NextResponse.json(
        { error: 'You need to be a manager or admin to create teams' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, companyId } = body;

    if (!name || !companyId) {
      return NextResponse.json(
        { error: 'Team name and company ID are required' },
        { status: 400 }
      );
    }

    // Verify user has access to this company
    const hasAccess = user.companyMemberships.some(m => m.companyId === companyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this company' }, { status: 403 });
    }

    const team = await prisma.team.create({
      data: {
        name,
        companyId,
        managerId: user.id,
      },
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    return serverErrorResponse(error, 'Team creation');
  }
}

// PUT - Add/remove member to team
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { teamId, memberEmail, action } = body;

    if (!teamId || !memberEmail || !action) {
      return NextResponse.json(
        { error: 'Team ID, member email, and action are required' },
        { status: 400 }
      );
    }

    // Check team access
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        company: {
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const isManager = team.managerId === user.id;
    const isCompanyAdmin = team.company.members.some(m => 
      ['admin', 'manager'].includes(m.role)
    );

    if (!isManager && !isCompanyAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find the member to add
    const memberToAdd = await prisma.user.findUnique({
      where: { email: memberEmail },
    });

    if (!memberToAdd) {
      return NextResponse.json(
        { error: 'User not found. They need to sign up first.' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      // Check if already a member
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: memberToAdd.id,
          },
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a team member' },
          { status: 400 }
        );
      }

      // Add to team
      await prisma.teamMember.create({
        data: {
          teamId,
          userId: memberToAdd.id,
        },
      });

      // Also add to company if not already
      await prisma.companyMember.upsert({
        where: {
          companyId_userId: {
            companyId: team.companyId,
            userId: memberToAdd.id,
          },
        },
        create: {
          companyId: team.companyId,
          userId: memberToAdd.id,
          role: 'member',
        },
        update: {},
      });

      return NextResponse.json({ success: true, message: 'Member added to team' });
    } else if (action === 'remove') {
      await prisma.teamMember.delete({
        where: {
          teamId_userId: {
            teamId,
            userId: memberToAdd.id,
          },
        },
      });

      return NextResponse.json({ success: true, message: 'Member removed from team' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return serverErrorResponse(error, 'Team update');
  }
}
