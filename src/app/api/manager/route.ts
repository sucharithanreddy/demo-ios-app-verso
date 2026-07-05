import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Fetch manager dashboard data
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
          where: { role: { in: ['admin', 'manager'] } },
          include: {
            company: {
              include: {
                teams: {
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
                              where: {
                                date: {
                                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                                },
                              },
                              orderBy: { date: 'desc' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                members: {
                  include: {
                    user: {
                      include: {
                        diagnosticResults: {
                          orderBy: { createdAt: 'desc' },
                          take: 1,
                        },
                        salesCheckIns: {
                          where: {
                            date: {
                              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.companyMemberships.length === 0) {
      return NextResponse.json({ 
        error: 'No manager access',
        message: 'You are not a manager of any company. Contact your admin to get access.'
      }, { status: 403 });
    }

    const companyMembership = user.companyMemberships[0];
    const company = companyMembership.company;

    // Calculate team stats
    const allMembers = company.members;

    // Archetype distribution
    const archetypeDistribution = {
      Driver: 0,
      Strategist: 0,
      Connector: 0,
      Reactor: 0,
    };

    // Risk indicators
    const riskZones = {
      burnout: [] as Array<{ userId: string; name: string; score: number }>,
      lowConfidence: [] as Array<{ userId: string; name: string; score: number }>,
      decliningTrend: [] as Array<{ userId: string; name: string; trend: string }>,
    };

    // Engagement metrics
    let totalCheckIns = 0;
    let activeMembersThisWeek = 0;
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Process each member
    allMembers.forEach(member => {
      const memberUser = member.user;
      
      // Count archetype
      const primaryProfile = memberUser.diagnosticResults[0]?.primaryProfile;
      if (primaryProfile && archetypeDistribution.hasOwnProperty(primaryProfile)) {
        archetypeDistribution[primaryProfile as keyof typeof archetypeDistribution]++;
      }

      // Check engagement
      const recentCheckIns = memberUser.salesCheckIns.filter(
        c => new Date(c.date) >= oneWeekAgo
      );
      totalCheckIns += memberUser.salesCheckIns.length;
      
      if (recentCheckIns.length > 0) {
        activeMembersThisWeek++;
      }

      // Calculate risk scores based on recent check-ins
      if (memberUser.salesCheckIns.length >= 3) {
        const lastThree = memberUser.salesCheckIns.slice(0, 3);
        const avgMood = lastThree.reduce((sum, c) => sum + c.mood, 0) / 3;
        const avgEnergy = lastThree.reduce((sum, c) => sum + c.energy, 0) / 3;
        const avgConfidence = lastThree.reduce((sum, c) => sum + c.confidence, 0) / 3;
        const overallScore = (avgMood + avgEnergy + avgConfidence) / 3;

        // Burnout risk (low energy)
        if (avgEnergy < 2.5) {
          riskZones.burnout.push({
            userId: memberUser.id,
            name: memberUser.name || memberUser.email,
            score: Math.round(avgEnergy * 20),
          });
        }

        // Low confidence
        if (avgConfidence < 2.5) {
          riskZones.lowConfidence.push({
            userId: memberUser.id,
            name: memberUser.name || memberUser.email,
            score: Math.round(avgConfidence * 20),
          });
        }

        // Declining trend
        if (memberUser.salesCheckIns.length >= 6) {
          const prevThree = memberUser.salesCheckIns.slice(3, 6);
          const prevAvg = prevThree.reduce((sum, c) => sum + (c.mood + c.energy + c.confidence) / 3, 0) / 3;
          
          if (overallScore < prevAvg - 0.5) {
            riskZones.decliningTrend.push({
              userId: memberUser.id,
              name: memberUser.name || memberUser.email,
              trend: `↓ ${Math.round((prevAvg - overallScore) * 20)}%`,
            });
          }
        }
      }
    });

    // Team breakdown
    const teamsData = company.teams.map(team => ({
      id: team.id,
      name: team.name,
      memberCount: team.members.length,
      members: team.members.map(m => ({
        id: m.user.id,
        name: m.user.name || m.user.email,
        email: m.user.email,
        profile: m.user.diagnosticResults[0]?.primaryProfile || null,
        lastCheckIn: m.user.salesCheckIns[0]?.date || null,
        avgScore: m.user.salesCheckIns.length > 0
          ? Math.round(
              m.user.salesCheckIns.slice(0, 5).reduce((sum, c) => 
                sum + (c.mood + c.energy + c.confidence) / 3, 0
              ) / Math.min(m.user.salesCheckIns.length, 5) * 20
            )
          : null,
      })),
    }));

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        planType: company.planType,
        totalMembers: allMembers.length,
        totalTeams: company.teams.length,
      },
      archetypeDistribution,
      riskZones,
      engagement: {
        activeThisWeek: activeMembersThisWeek,
        totalMembers: allMembers.length,
        engagementRate: Math.round((activeMembersThisWeek / allMembers.length) * 100) || 0,
        totalCheckIns,
      },
      teams: teamsData,
      userRole: companyMembership.role,
    });
  } catch (error) {
    return serverErrorResponse(error, 'Manager dashboard');
  }
}
