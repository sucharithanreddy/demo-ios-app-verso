import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// NPS-style thresholds (0-100 scale)
const NPS_THRESHOLDS = {
  THRIVING: 80,      // Promoters: score >= 80
  STABLE: 50,        // Passives: 50 <= score < 80
  NEEDS_SUPPORT: 0,  // Detractors: score < 50
};

// Time decay factor for weighting recent check-ins
const DECAY_FACTOR = 0.05;

// Calculate exponential decay weight based on days ago
function getDecayWeight(daysAgo: number): number {
  return Math.exp(-DECAY_FACTOR * daysAgo);
}

// Calculate time-decay weighted average
function calculateWeightedAverage(checkIns: { mood: number; energy: number; confidence: number; date: Date }[]): {
  avgMood: number;
  avgEnergy: number;
  avgConfidence: number;
  overallScore: number;
  totalWeight: number;
} {
  if (checkIns.length === 0) {
    return { avgMood: 0, avgEnergy: 0, avgConfidence: 0, overallScore: 0, totalWeight: 0 };
  }

  const now = new Date();
  let weightedMood = 0;
  let weightedEnergy = 0;
  let weightedConfidence = 0;
  let totalWeight = 0;

  for (const checkIn of checkIns) {
    const daysAgo = Math.floor((now.getTime() - new Date(checkIn.date).getTime()) / (1000 * 60 * 60 * 24));
    const weight = getDecayWeight(daysAgo);
    
    weightedMood += checkIn.mood * weight;
    weightedEnergy += checkIn.energy * weight;
    weightedConfidence += checkIn.confidence * weight;
    totalWeight += weight;
  }

  const avgMood = weightedMood / totalWeight;
  const avgEnergy = weightedEnergy / totalWeight;
  const avgConfidence = weightedConfidence / totalWeight;
  const overallScore = (avgMood + avgEnergy + avgConfidence) / 3;

  return { avgMood, avgEnergy, avgConfidence, overallScore, totalWeight };
}

// Categorize member based on overall score
function categorizeMember(score: number): 'thriving' | 'stable' | 'needsSupport' {
  if (score >= NPS_THRESHOLDS.THRIVING) return 'thriving';
  if (score >= NPS_THRESHOLDS.STABLE) return 'stable';
  return 'needsSupport';
}

// Calculate participation weight (more check-ins = more reliable data)
function getParticipationWeight(checkInCount: number, optimalCount: number = 10): number {
  // Weight caps at 1.0, scales linearly up to optimal count
  return Math.min(checkInCount / optimalCount, 1.0);
}

// GET - Get all team members for a manager with NPS-style scoring
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

    // Get the current user (manager)
    const manager = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        teamMembers: {
          include: {
            diagnosticResults: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            salesCheckIns: {
              where: {
                date: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
              orderBy: { date: 'desc' },
            },
            userStreak: true,
          },
        },
      },
    });

    if (!manager) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    if (manager.userType !== 'SALES_MANAGER') {
      return NextResponse.json({ 
        error: 'Access denied',
        message: 'Only sales managers can access team data.'
      }, { status: 403 });
    }

    // Calculate team stats with time-decay weighting
    const teamMembers = manager.teamMembers.map(member => {
      const recentCheckIns = member.salesCheckIns || [];
      
      // Use time-decay weighted average instead of simple average
      const { avgMood, avgEnergy, avgConfidence, overallScore } = calculateWeightedAverage(recentCheckIns);
      
      // Calculate trend
      let trend = 'stable';
      if (recentCheckIns.length >= 6) {
        const recent = recentCheckIns.slice(0, 3);
        const previous = recentCheckIns.slice(3, 6);
        const recentAvg = recent.reduce((sum, c) => sum + (c.mood + c.energy + c.confidence) / 3, 0) / 3;
        const prevAvg = previous.reduce((sum, c) => sum + (c.mood + c.energy + c.confidence) / 3, 0) / 3;
        
        if (recentAvg > prevAvg + 0.3) {
          trend = 'improving';
        } else if (recentAvg < prevAvg - 0.3) {
          trend = 'declining';
        }
      }
      
      // Convert to 0-100 scale
      const scorePercent = {
        mood: Math.round(avgMood * 20),
        energy: Math.round(avgEnergy * 20),
        confidence: Math.round(avgConfidence * 20),
        overall: Math.round(overallScore * 20),
      };

      // Determine risk level (legacy support)
      let riskLevel = 'green';
      if (avgEnergy < 2.5 || avgConfidence < 2.5 || overallScore < 2.5) {
        riskLevel = 'red';
      } else if (avgEnergy < 3 || avgConfidence < 3 || overallScore < 3) {
        riskLevel = 'yellow';
      }

      // NPS-style categorization
      const category = categorizeMember(scorePercent.overall);
      
      // Participation weight
      const participationWeight = getParticipationWeight(recentCheckIns.length);

      return {
        id: member.id,
        name: member.name || member.email,
        email: member.email,
        avatarUrl: member.avatarUrl,
        archetype: member.diagnosticResults[0]?.primaryProfile || null,
        streak: member.userStreak?.currentStreak || 0,
        checkIns: {
          total: recentCheckIns.length,
          lastCheckIn: recentCheckIns[0]?.date || null,
        },
        scores: scorePercent,
        trend,
        riskLevel,
        category,
        participationWeight,
        joinedAt: member.createdAt,
      };
    });

    // Calculate team averages (simple average for backward compatibility)
    const teamAverages = {
      mood: teamMembers.length > 0 
        ? Math.round(teamMembers.reduce((sum, m) => sum + m.scores.mood, 0) / teamMembers.length)
        : 0,
      energy: teamMembers.length > 0 
        ? Math.round(teamMembers.reduce((sum, m) => sum + m.scores.energy, 0) / teamMembers.length)
        : 0,
      confidence: teamMembers.length > 0 
        ? Math.round(teamMembers.reduce((sum, m) => sum + m.scores.confidence, 0) / teamMembers.length)
        : 0,
      overall: teamMembers.length > 0 
        ? Math.round(teamMembers.reduce((sum, m) => sum + m.scores.overall, 0) / teamMembers.length)
        : 0,
    };

    // NPS-style distribution
    const thriving = teamMembers.filter(m => m.category === 'thriving');
    const stable = teamMembers.filter(m => m.category === 'stable');
    const needsSupport = teamMembers.filter(m => m.category === 'needsSupport');

    const totalMembers = teamMembers.length;
    const npsDistribution = {
      thriving: {
        count: thriving.length,
        percentage: totalMembers > 0 ? Math.round((thriving.length / totalMembers) * 100) : 0,
        label: 'Thriving',
        description: 'Score 80%+ - Performing well with good wellbeing',
        color: 'green',
      },
      stable: {
        count: stable.length,
        percentage: totalMembers > 0 ? Math.round((stable.length / totalMembers) * 100) : 0,
        label: 'Stable',
        description: 'Score 50-79% - Doing okay, room for improvement',
        color: 'amber',
      },
      needsSupport: {
        count: needsSupport.length,
        percentage: totalMembers > 0 ? Math.round((needsSupport.length / totalMembers) * 100) : 0,
        label: 'Needs Support',
        description: 'Score below 50% - May need attention',
        color: 'red',
      },
    };

    // NPS Score (similar to Net Promoter Score)
    // Range: -100 to +100
    const npsScore = totalMembers > 0 
      ? Math.round(((thriving.length - needsSupport.length) / totalMembers) * 100)
      : 0;

    // Risk distribution (legacy support)
    const riskDistribution = {
      green: teamMembers.filter(m => m.riskLevel === 'green').length,
      yellow: teamMembers.filter(m => m.riskLevel === 'yellow').length,
      red: teamMembers.filter(m => m.riskLevel === 'red').length,
    };

    // Archetype distribution
    const archetypeDistribution = {
      Driver: teamMembers.filter(m => m.archetype === 'Driver').length,
      Strategist: teamMembers.filter(m => m.archetype === 'Strategist').length,
      Connector: teamMembers.filter(m => m.archetype === 'Connector').length,
      Reactor: teamMembers.filter(m => m.archetype === 'Reactor').length,
      Unknown: teamMembers.filter(m => !m.archetype).length,
    };

    // Participation stats
    const activeMembers = teamMembers.filter(m => m.checkIns.total >= 5);
    const participationRate = totalMembers > 0 
      ? Math.round((activeMembers.length / totalMembers) * 100) 
      : 0;

    return NextResponse.json({
      manager: {
        id: manager.id,
        name: manager.name || manager.email,
        email: manager.email,
        designation: manager.designation,
        managerCode: manager.managerCode,
      },
      team: {
        totalMembers: teamMembers.length,
        members: teamMembers,
        averages: teamAverages,
        
        // NPS-style team health
        nps: {
          score: npsScore,
          distribution: npsDistribution,
          label: npsScore >= 50 ? 'Excellent' : npsScore >= 20 ? 'Good' : npsScore >= 0 ? 'Fair' : 'Needs Attention',
          trend: 'stable', // Can be enhanced to show NPS trend over time
        },
        
        // Participation metrics
        participation: {
          rate: participationRate,
          activeMembers: activeMembers.length,
          optimalCheckIns: 10,
          description: `${activeMembers.length} of ${totalMembers} members actively checking in`,
        },
        
        // Legacy support
        riskDistribution,
        archetypeDistribution,
      },
    });

  } catch (error) {
    return serverErrorResponse(error, 'Get team');
  }
}
