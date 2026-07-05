import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Fetch admin dashboard data (company-wide ROI)
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
      include: {
        companyMemberships: {
          where: { role: 'admin' },
          include: {
            company: {
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
                        },
                      },
                    },
                  },
                },
                teams: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.companyMemberships.length === 0) {
      return NextResponse.json({ 
        error: 'Admin access required',
        message: 'You need admin privileges to access this dashboard.'
      }, { status: 403 });
    }

    const company = user.companyMemberships[0].company;
    const members = company.members;

    // Calculate metrics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Time-based metrics
    const last30Days = { checkIns: 0, avgScore: 0, activeUsers: 0 };
    const last60Days = { checkIns: 0, avgScore: 0, activeUsers: 0 };
    const last90Days = { checkIns: 0, avgScore: 0, activeUsers: 0 };

    // Trend data
    const weeklyTrend: Array<{ week: string; checkIns: number; avgScore: number }> = [];
    
    // Retention risk
    const retentionRisks: Array<{ userId: string; name: string; risk: string; lastActive: string }> = [];

    // Process member data
    members.forEach(member => {
      const checkIns = member.user.salesCheckIns;
      
      // 30-day stats
      const last30 = checkIns.filter(c => new Date(c.date) >= thirtyDaysAgo);
      if (last30.length > 0) {
        last30Days.checkIns += last30.length;
        last30Days.activeUsers++;
      }

      // 60-day stats
      const last60 = checkIns.filter(c => new Date(c.date) >= sixtyDaysAgo);
      if (last60.length > 0) {
        last60Days.checkIns += last60.length;
        last60Days.activeUsers++;
      }

      // 90-day stats
      const last90 = checkIns.filter(c => new Date(c.date) >= ninetyDaysAgo);
      if (last90.length > 0) {
        last90Days.checkIns += last90.length;
        last90Days.activeUsers++;
      }

      // Retention risk
      const lastCheckIn = checkIns[0];
      if (!lastCheckIn || new Date(lastCheckIn.date) < new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)) {
        retentionRisks.push({
          userId: member.user.id,
          name: member.user.name || member.user.email,
          risk: !lastCheckIn ? 'inactive' : 'at_risk',
          lastActive: lastCheckIn?.date ? new Date(lastCheckIn.date).toISOString() : 'Never',
        });
      }
    });

    // Calculate averages
    const allScores30 = members.flatMap(m => 
      m.user.salesCheckIns
        .filter(c => new Date(c.date) >= thirtyDaysAgo)
        .map(c => (c.mood + c.energy + c.confidence) / 3)
    );
    last30Days.avgScore = allScores30.length > 0 
      ? Math.round((allScores30.reduce((a, b) => a + b, 0) / allScores30.length) * 20)
      : 0;

    // Generate weekly trend (last 8 weeks)
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekCheckIns = members.flatMap(m => 
        m.user.salesCheckIns.filter(c => {
          const date = new Date(c.date);
          return date >= weekStart && date < weekEnd;
        })
      );

      const avgScore = weekCheckIns.length > 0
        ? weekCheckIns.reduce((sum, c) => sum + (c.mood + c.energy + c.confidence) / 3, 0) / weekCheckIns.length
        : 0;

      weeklyTrend.push({
        week: `Week ${8 - i}`,
        checkIns: weekCheckIns.length,
        avgScore: Math.round(avgScore * 20),
      });
    }

    // Engagement rate
    const engagementRate = members.length > 0 
      ? Math.round((last30Days.activeUsers / members.length) * 100)
      : 0;

    // Wellbeing trend
    const wellbeingTrend = weeklyTrend.length >= 2
      ? weeklyTrend[weeklyTrend.length - 1].avgScore - weeklyTrend[0].avgScore
      : 0;

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        planType: company.planType,
        maxUsers: company.maxUsers,
        totalMembers: members.length,
        totalTeams: company.teams.length,
      },
      metrics: {
        last30Days,
        last60Days,
        last90Days,
        engagementRate,
        wellbeingTrend,
      },
      weeklyTrend,
      retentionRisk: {
        count: retentionRisks.length,
        percentage: members.length > 0 
          ? Math.round((retentionRisks.length / members.length) * 100)
          : 0,
        users: retentionRisks.slice(0, 5),
      },
      unlockCodes: {
        total: 0,
        used: 0,
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Admin dashboard');
  }
}
