import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Fetch coaching tips for user
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
        diagnosticResults: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const situation = searchParams.get('situation') || 'morning';

    // Get user's archetype
    const archetype = user.diagnosticResults[0]?.primaryProfile || 'Driver';

    // Fetch coaching tips for this archetype and situation
    const tips = await prisma.coachingTip.findMany({
      where: {
        archetype,
        situation,
        isActive: true,
      },
    });

    // If no specific tips, get general tips for the archetype
    const tipsToReturn = tips.length > 0 ? tips : await prisma.coachingTip.findMany({
      where: {
        archetype,
        isActive: true,
      },
      take: 3,
    });

    // If still no tips, get any tips
    const finalTips = tipsToReturn.length > 0 ? tipsToReturn : await prisma.coachingTip.findMany({
      where: { isActive: true },
      take: 3,
    });

    return NextResponse.json({ 
      tips: finalTips,
      archetype,
      situation,
    });
  } catch (error) {
    return serverErrorResponse(error, 'Fetch coaching tips');
  }
}
