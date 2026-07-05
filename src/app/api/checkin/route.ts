import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Fetch user's check-ins
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');

    const checkIns = await prisma.salesCheckIn.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json({ checkIns });
  } catch (error) {
    return serverErrorResponse(error, 'Fetch check-ins');
  }
}

// POST - Create a new check-in
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { mood, energy, confidence, impactTags, notes } = body;

    // Validate
    if (mood === undefined || energy === undefined || confidence === undefined) {
      return NextResponse.json({ 
        error: 'Mood, energy, and confidence are required' 
      }, { status: 400 });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckIn = await prisma.salesCheckIn.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
        },
      },
    });

    if (existingCheckIn) {
      return NextResponse.json({ 
        error: 'Already checked in today',
        checkIn: existingCheckIn,
      }, { status: 400 });
    }

    // Get user's archetype for insight
    const diagnosticResult = await prisma.diagnosticResult.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Generate pattern insight
    let patternInsight = '';
    if (diagnosticResult) {
      const archetype = diagnosticResult.primaryProfile;
      if (energy <= 2 && archetype === 'Driver') {
        patternInsight = 'Your energy is low today. As a Driver, this might indicate burnout risk. Consider taking a break.';
      } else if (confidence <= 2 && archetype === 'Connector') {
        patternInsight = 'Low confidence detected. As a Connector, focus on your relationships to rebuild confidence.';
      } else if (mood >= 4) {
        patternInsight = `Great day! This positive energy aligns well with your ${archetype} profile.`;
      } else {
        patternInsight = `Check-in recorded. Your ${archetype} profile helps you navigate days like this.`;
      }
    }

    // Create check-in
    const checkIn = await prisma.salesCheckIn.create({
      data: {
        userId: user.id,
        date: new Date(),
        mood: parseInt(mood),
        energy: parseInt(energy),
        confidence: parseInt(confidence),
        impactTags: impactTags || [],
        notes,
        patternInsight,
      },
    });

    // Update streak
    await updateStreak(user.id);

    return NextResponse.json({ 
      success: true, 
      checkIn,
      patternInsight,
    });
  } catch (error) {
    return serverErrorResponse(error, 'Create check-in');
  }
}

// Helper to update streak
async function updateStreak(userId: string) {
  try {
    const checkIns = await prisma.salesCheckIn.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 60,
    });

    if (checkIns.length === 0) return;

    // Calculate current streak
    let currentStreak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i < checkIns.length; i++) {
      const prevDate = new Date(checkIns[i - 1].date);
      prevDate.setHours(0, 0, 0, 0);
      
      const currDate = new Date(checkIns[i].date);
      currDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Get or create streak record
    const existingStreak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (existingStreak) {
      await prisma.userStreak.update({
        where: { userId },
        data: {
          currentStreak,
          longestStreak: Math.max(currentStreak, existingStreak.longestStreak),
          lastCheckInDate: new Date(),
        },
      });
    } else {
      await prisma.userStreak.create({
        data: {
          userId,
          currentStreak,
          longestStreak: currentStreak,
          lastCheckInDate: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}
