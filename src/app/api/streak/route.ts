import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkDatabaseConnection, databaseErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

// GET - Fetch user's streak data
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

    // Get or create streak
    let streak = await prisma.userStreak.findUnique({
      where: { userId: user.id },
    });

    if (!streak) {
      // Check if user has any check-ins
      const checkIns = await prisma.salesCheckIn.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 30,
      });

      if (checkIns.length > 0) {
        // Calculate streak from existing check-ins
        let currentStreak = 1;
        for (let i = 1; i < checkIns.length; i++) {
          const prevDate = new Date(checkIns[i - 1].date);
          const currDate = new Date(checkIns[i].date);
          const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }

        streak = await prisma.userStreak.create({
          data: {
            userId: user.id,
            currentStreak,
            longestStreak: currentStreak,
            lastCheckInDate: checkIns[0].date,
          },
        });
      } else {
        // No check-ins yet
        return NextResponse.json({ 
          streak: {
            currentStreak: 0,
            longestStreak: 0,
            lastCheckInDate: null,
          },
          hasStreak: false,
        });
      }
    }

    // Check if streak should be reset (missed yesterday)
    const lastCheckIn = streak.lastCheckInDate ? new Date(streak.lastCheckInDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastCheckIn) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastCheckInDay = new Date(lastCheckIn);
      lastCheckInDay.setHours(0, 0, 0, 0);

      // If last check-in was before yesterday, reset streak
      if (lastCheckInDay < yesterday && streak.currentStreak > 0) {
        streak = await prisma.userStreak.update({
          where: { userId: user.id },
          data: { currentStreak: 0 },
        });
      }
    }

    return NextResponse.json({ 
      streak: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastCheckInDate: streak.lastCheckInDate,
      },
      hasStreak: streak.currentStreak > 0,
    });
  } catch (error) {
    return serverErrorResponse(error, 'Fetch streak');
  }
}
