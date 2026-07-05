import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Get detailed insights for a specific team member or overall team insights
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
    const memberId = searchParams.get('memberId');

    // Get the current user (manager)
    const manager = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!manager || manager.userType !== 'SALES_MANAGER') {
      return NextResponse.json({ 
        error: 'Access denied',
        message: 'Only sales managers can access insights.'
      }, { status: 403 });
    }

    // If memberId is provided, get individual insights
    if (memberId) {
      return getIndividualInsights(manager.id, memberId);
    }

    // Otherwise, get overall team insights
    return getTeamInsights(manager.id);
  } catch (error) {
    return serverErrorResponse(error, 'Get insights');
  }
}

async function getIndividualInsights(managerId: string, memberId: string) {
  // Verify this member belongs to this manager
  const member = await prisma.user.findFirst({
    where: {
      id: memberId,
      managerId: managerId,
    },
    include: {
      diagnosticResults: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      salesCheckIns: {
        where: {
          date: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
          },
        },
        orderBy: { date: 'desc' },
      },
      userStreak: true,
    },
  });

  if (!member) {
    return NextResponse.json({ 
      error: 'Member not found or not in your team' 
    }, { status: 404 });
  }

  const checkIns = member.salesCheckIns;
  
  // Weekly breakdown (last 8 weeks)
  const weeklyData = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const weekCheckIns = checkIns.filter(c => {
      const date = new Date(c.date);
      return date >= weekStart && date < weekEnd;
    });
    
    if (weekCheckIns.length > 0) {
      weeklyData.push({
        week: `Week ${8 - i}`,
        avgMood: Math.round(weekCheckIns.reduce((sum, c) => sum + c.mood, 0) / weekCheckIns.length * 20),
        avgEnergy: Math.round(weekCheckIns.reduce((sum, c) => sum + c.energy, 0) / weekCheckIns.length * 20),
        avgConfidence: Math.round(weekCheckIns.reduce((sum, c) => sum + c.confidence, 0) / weekCheckIns.length * 20),
        checkInCount: weekCheckIns.length,
      });
    }
  }

  // Pattern detection
  const patterns = [];
  
  // Low energy pattern
  const recentEnergy = checkIns.slice(0, 5).map(c => c.energy);
  const avgRecentEnergy = recentEnergy.reduce((a, b) => a + b, 0) / recentEnergy.length;
  if (avgRecentEnergy < 2.5) {
    patterns.push({
      type: 'energy',
      severity: 'high',
      title: 'Low Energy Pattern Detected',
      description: 'This team member has shown consistently low energy levels recently.',
      recommendation: 'Consider checking in about workload or personal wellbeing.',
    });
  }

  // Declining confidence
  if (checkIns.length >= 6) {
    const recent = checkIns.slice(0, 3);
    const previous = checkIns.slice(3, 6);
    const recentConf = recent.reduce((sum, c) => sum + c.confidence, 0) / 3;
    const prevConf = previous.reduce((sum, c) => sum + c.confidence, 0) / 3;
    
    if (recentConf < prevConf - 0.5) {
      patterns.push({
        type: 'confidence',
        severity: 'medium',
        title: 'Declining Confidence',
        description: 'Confidence levels have dropped compared to previous weeks.',
        recommendation: 'A supportive conversation might help identify any challenges.',
      });
    }
  }

  // Archetype insights
  const archetype = member.diagnosticResults[0];
  let archetypeInsight = null;
  
  if (archetype) {
    const archetypePatterns: Record<string, { strengths: string[], challenges: string[] }> = {
      Driver: {
        strengths: ['Goal-oriented', 'Action-focused', 'Resilient under pressure'],
        challenges: ['May push too hard', 'Risk of burnout', 'Can be impatient'],
      },
      Strategist: {
        strengths: ['Thoughtful approach', 'Good planning', 'Analytical'],
        challenges: ['Overthinking', 'Analysis paralysis', 'Delayed action'],
      },
      Connector: {
        strengths: ['Relationship builder', 'Empathetic', 'Team player'],
        challenges: ['Takes rejection hard', 'May avoid conflict', 'People-pleasing'],
      },
      Reactor: {
        strengths: ['Passionate', 'Accountable', 'Quick to adapt'],
        challenges: ['Emotional volatility', 'Stress sensitivity', 'Needs validation'],
      },
    };
    
    archetypeInsight = {
      type: archetype.primaryProfile,
      ...archetypePatterns[archetype.primaryProfile] || { strengths: [], challenges: [] },
    };
  }

  return NextResponse.json({
    member: {
      id: member.id,
      name: member.name || member.email,
      email: member.email,
      avatarUrl: member.avatarUrl,
    },
    insights: {
      archetype: archetypeInsight,
      currentScores: {
        mood: checkIns.length > 0 ? Math.round(checkIns.slice(0, 5).reduce((sum, c) => sum + c.mood, 0) / Math.min(checkIns.length, 5) * 20) : 0,
        energy: checkIns.length > 0 ? Math.round(checkIns.slice(0, 5).reduce((sum, c) => sum + c.energy, 0) / Math.min(checkIns.length, 5) * 20) : 0,
        confidence: checkIns.length > 0 ? Math.round(checkIns.slice(0, 5).reduce((sum, c) => sum + c.confidence, 0) / Math.min(checkIns.length, 5) * 20) : 0,
      },
      streak: member.userStreak?.currentStreak || 0,
      totalCheckIns: checkIns.length,
      weeklyTrend: weeklyData,
      patterns,
    },
  });
}

async function getTeamInsights(managerId: string) {
  const teamMembers = await prisma.user.findMany({
    where: { managerId: managerId },
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
      userStreak: true,
    },
  });

  // Team patterns
  const teamPatterns = [];
  
  // Calculate team averages
  const allCheckIns = teamMembers.flatMap(m => m.salesCheckIns);
  const avgMood = allCheckIns.length > 0 
    ? allCheckIns.reduce((sum, c) => sum + c.mood, 0) / allCheckIns.length 
    : 0;
  const avgEnergy = allCheckIns.length > 0 
    ? allCheckIns.reduce((sum, c) => sum + c.energy, 0) / allCheckIns.length 
    : 0;
  const avgConfidence = allCheckIns.length > 0 
    ? allCheckIns.reduce((sum, c) => sum + c.confidence, 0) / allCheckIns.length 
    : 0;

  // High stress team
  if (avgEnergy < 2.5) {
    teamPatterns.push({
      type: 'team_stress',
      severity: 'high',
      title: 'Team Energy is Low',
      description: 'The team is showing signs of fatigue or burnout.',
      recommendation: 'Consider team-building activities or workload review.',
    });
  }

  // Archetype imbalance
  const archetypeCounts = {
    Driver: teamMembers.filter(m => m.diagnosticResults[0]?.primaryProfile === 'Driver').length,
    Strategist: teamMembers.filter(m => m.diagnosticResults[0]?.primaryProfile === 'Strategist').length,
    Connector: teamMembers.filter(m => m.diagnosticResults[0]?.primaryProfile === 'Connector').length,
    Reactor: teamMembers.filter(m => m.diagnosticResults[0]?.primaryProfile === 'Reactor').length,
  };
  
  const totalWithArchetype = Object.values(archetypeCounts).reduce((a, b) => a + b, 0);
  if (totalWithArchetype > 0) {
    const dominantArchetype = Object.entries(archetypeCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (dominantArchetype[1] / totalWithArchetype > 0.5) {
      teamPatterns.push({
        type: 'archetype_imbalance',
        severity: 'low',
        title: `Team is ${dominantArchetype[0]}-Heavy`,
        description: `The team has a high concentration of ${dominantArchetype[0]} personalities.`,
        recommendation: `Consider how to balance ${dominantArchetype[0]} traits with other strengths.`,
      });
    }
  }

  // Engagement rate
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeMembers = teamMembers.filter(m => 
    m.salesCheckIns.some(c => new Date(c.date) >= oneWeekAgo)
  ).length;
  
  const engagementRate = teamMembers.length > 0 
    ? Math.round((activeMembers / teamMembers.length) * 100) 
    : 0;

  if (engagementRate < 50) {
    teamPatterns.push({
      type: 'engagement',
      severity: 'medium',
      title: 'Low Team Engagement',
      description: 'Less than half the team has checked in this week.',
      recommendation: 'Encourage daily check-ins to track wellbeing.',
    });
  }

  return NextResponse.json({
    teamSize: teamMembers.length,
    teamAverages: {
      mood: Math.round(avgMood * 20),
      energy: Math.round(avgEnergy * 20),
      confidence: Math.round(avgConfidence * 20),
    },
    archetypeDistribution: archetypeCounts,
    engagement: {
      activeMembers,
      totalMembers: teamMembers.length,
      rate: engagementRate,
    },
    patterns: teamPatterns,
  });
}
