import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Export company data as CSV
export async function GET(request: NextRequest) {
  try {
    const db = await checkDatabaseConnection();
    if (!db.connected) {
      return databaseErrorResponse();
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'engagement';

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        companyMemberships: {
          where: { role: { in: ['admin', 'manager'] } },
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
                          take: 30,
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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const company = user.companyMemberships[0].company;
    const members = company.members;

    // Generate CSV based on type
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'engagement':
        csvContent = generateEngagementCSV(members);
        filename = `${company.name.toLowerCase().replace(/\s+/g, '-')}_engagement_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'wellbeing':
        csvContent = generateWellbeingCSV(members);
        filename = `${company.name.toLowerCase().replace(/\s+/g, '-')}_wellbeing_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'risks':
        csvContent = generateRisksCSV(members);
        filename = `${company.name.toLowerCase().replace(/\s+/g, '-')}_risks_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'all':
      default:
        csvContent = generateFullCSV(members, company);
        filename = `${company.name.toLowerCase().replace(/\s+/g, '-')}_full_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }

    // Return CSV as download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Export data');
  }
}

function generateEngagementCSV(members: any[]): string {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const headers = ['Name', 'Email', 'Total Check-ins', 'Check-ins (30d)', 'Last Active', 'Engagement Status'];
  const rows = members.map(m => {
    const checkIns = m.user.salesCheckIns;
    const last30 = checkIns.filter((c: any) => new Date(c.date) >= thirtyDaysAgo);
    const lastCheckIn = checkIns[0]?.date || 'Never';
    const daysSinceActive = checkIns[0]
      ? Math.floor((now.getTime() - new Date(checkIns[0].date).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    let status = 'Active';
    if (daysSinceActive > 14) status = 'Inactive';
    else if (daysSinceActive > 7) status = 'At Risk';

    return [
      m.user.name || 'Unknown',
      m.user.email,
      checkIns.length,
      last30.length,
      lastCheckIn,
      status,
    ];
  });

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generateWellbeingCSV(members: any[]): string {
  const headers = ['Name', 'Email', 'Archetype', 'Avg Mood', 'Avg Energy', 'Avg Confidence', 'Overall Score', 'Trend'];
  const rows = members.map(m => {
    const checkIns = m.user.salesCheckIns.slice(0, 7);
    const archetype = m.user.diagnosticResults[0]?.primaryProfile || 'Not Assessed';
    
    let avgMood = 0, avgEnergy = 0, avgConfidence = 0;
    if (checkIns.length > 0) {
      avgMood = Math.round((checkIns.reduce((sum: number, c: any) => sum + c.mood, 0) / checkIns.length) * 20);
      avgEnergy = Math.round((checkIns.reduce((sum: number, c: any) => sum + c.energy, 0) / checkIns.length) * 20);
      avgConfidence = Math.round((checkIns.reduce((sum: number, c: any) => sum + c.confidence, 0) / checkIns.length) * 20);
    }

    const overallScore = Math.round((avgMood + avgEnergy + avgConfidence) / 3);

    let trend = 'Stable';
    if (checkIns.length >= 5) {
      const recent = checkIns.slice(0, 3);
      const older = checkIns.slice(3, 6);
      const recentAvg = recent.reduce((sum: number, c: any) => sum + (c.mood + c.energy + c.confidence) / 3, 0) / 3;
      const olderAvg = older.reduce((sum: number, c: any) => sum + (c.mood + c.energy + c.confidence) / 3, 0) / 3;
      const diff = recentAvg - olderAvg;
      if (diff > 0.3) trend = 'Improving';
      else if (diff < -0.3) trend = 'Declining';
    }

    return [m.user.name || 'Unknown', m.user.email, archetype, avgMood, avgEnergy, avgConfidence, overallScore, trend];
  });

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generateRisksCSV(members: any[]): string {
  const now = new Date();
  const headers = ['Name', 'Email', 'Risk Type', 'Severity', 'Score', 'Details', 'Recommendation'];
  const rows: any[] = [];

  members.forEach(m => {
    const checkIns = m.user.salesCheckIns.slice(0, 5);

    // Check burnout risk
    if (checkIns.length >= 3) {
      const avgEnergy = checkIns.reduce((sum: number, c: any) => sum + c.energy, 0) / checkIns.length;
      if (avgEnergy < 2.5) {
        rows.push([
          m.user.name || 'Unknown',
          m.user.email,
          'Burnout',
          avgEnergy < 2 ? 'High' : 'Medium',
          Math.round(avgEnergy * 20) + '%',
          `Average energy: ${avgEnergy.toFixed(1)}/5`,
          'Consider workload review and 1:1 check-in',
        ]);
      }
    }

    // Check confidence risk
    if (checkIns.length >= 3) {
      const avgConfidence = checkIns.reduce((sum: number, c: any) => sum + c.confidence, 0) / checkIns.length;
      if (avgConfidence < 2.5) {
        rows.push([
          m.user.name || 'Unknown',
          m.user.email,
          'Low Confidence',
          avgConfidence < 2 ? 'High' : 'Medium',
          Math.round(avgConfidence * 20) + '%',
          `Average confidence: ${avgConfidence.toFixed(1)}/5`,
          'Consider coaching or mentorship support',
        ]);
      }
    }

    // Check disengagement risk
    const lastCheckIn = checkIns[0]?.date;
    if (!lastCheckIn || new Date(lastCheckIn) < new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)) {
      const daysSince = lastCheckIn
        ? Math.floor((now.getTime() - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60 * 24))
        : 'N/A';
      rows.push([
        m.user.name || 'Unknown',
        m.user.email,
        'Disengagement',
        !lastCheckIn ? 'High' : 'Medium',
        !lastCheckIn ? 'Never active' : `${daysSince} days`,
        lastCheckIn ? `Last check-in: ${daysSince} days ago` : 'Never completed a check-in',
        'Reach out for re-engagement conversation',
      ]);
    }
  });

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generateFullCSV(members: any[], company: any): string {
  const headers = [
    'Company', 'Team', 'Name', 'Email', 'Role',
    'Archetype', 'Total Check-ins', 'Last Active',
    'Avg Mood (7d)', 'Avg Energy (7d)', 'Avg Confidence (7d)', 'Overall Score',
    'Engagement Status', 'Risk Flags'
  ];

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const rows = members.map(m => {
    const checkIns = m.user.salesCheckIns;
    const last7 = checkIns.slice(0, 7);
    const archetype = m.user.diagnosticResults[0]?.primaryProfile || 'Not Assessed';

    const daysSinceActive = checkIns[0]
      ? Math.floor((now.getTime() - new Date(checkIns[0].date).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let status = 'Active';
    if (daysSinceActive > 14) status = 'Inactive';
    else if (daysSinceActive > 7) status = 'At Risk';

    const avgMood = last7.length > 0
      ? Math.round((last7.reduce((sum: number, c: any) => sum + c.mood, 0) / last7.length) * 20)
      : 0;
    const avgEnergy = last7.length > 0
      ? Math.round((last7.reduce((sum: number, c: any) => sum + c.energy, 0) / last7.length) * 20)
      : 0;
    const avgConfidence = last7.length > 0
      ? Math.round((last7.reduce((sum: number, c: any) => sum + c.confidence, 0) / last7.length) * 20)
      : 0;

    const risks: string[] = [];
    if (last7.length >= 3) {
      const avgE = last7.reduce((sum: number, c: any) => sum + c.energy, 0) / last7.length;
      const avgC = last7.reduce((sum: number, c: any) => sum + c.confidence, 0) / last7.length;
      if (avgE < 2.5) risks.push('Burnout');
      if (avgC < 2.5) risks.push('Low Confidence');
    }
    if (daysSinceActive > 7) risks.push('Disengaged');

    return [
      company.name,
      m.team?.name || 'Unassigned',
      m.user.name || 'Unknown',
      m.user.email,
      m.role,
      archetype,
      checkIns.length,
      checkIns[0]?.date || 'Never',
      avgMood,
      avgEnergy,
      avgConfidence,
      Math.round((avgMood + avgEnergy + avgConfidence) / 3),
      status,
      risks.join('; '),
    ];
  });

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
