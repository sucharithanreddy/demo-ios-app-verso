import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for registration
const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  userType: z.enum(['individual', 'sales_person', 'sales_manager']),
  phone: z.string().optional(),
  industry: z.string().optional(),
  organizationName: z.string().optional(),
  organizationCode: z.string().optional(),
  managerName: z.string().optional(),
  managerEmail: z.string().optional(),
  designation: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Additional validation based on user type
    if (data.userType === 'sales_person') {
      if (!data.phone || !data.organizationName || !data.organizationCode || !data.managerName || !data.managerEmail) {
        return NextResponse.json(
          { error: 'Missing required fields for sales person registration' },
          { status: 400 }
        );
      }
    }

    if (data.userType === 'sales_manager') {
      if (!data.phone || !data.organizationName || !data.organizationCode || !data.designation) {
        return NextResponse.json(
          { error: 'Missing required fields for sales manager registration' },
          { status: 400 }
        );
      }
    }

    // Generate a unique ID for the user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Try database operations if available
    try {
      const { db } = await import('@/lib/db');
      
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      // Handle organization for sales users
      let organizationId: string | null = null;
      
      if (data.userType !== 'individual' && data.organizationCode) {
        // Try to find existing organization
        let organization = await db.organization.findUnique({
          where: { code: data.organizationCode },
        });

        if (!organization && data.organizationName) {
          // Create new organization if doesn't exist
          organization = await db.organization.create({
            data: {
              name: data.organizationName,
              code: data.organizationCode,
            },
          });
        }

        organizationId = organization?.id || null;
      }

      // Create user in database
      const user = await db.user.create({
        data: {
          clerkId: userId,
          email: data.email,
          name: data.fullName,
          userType: data.userType.toUpperCase() as any,
          phone: data.phone || null,
          industry: data.industry || null,
          organizationId,
          organizationCode: data.organizationCode || null,
          designation: data.designation || null,
          subscriptionStatus: 'FREE',
          subscriptionPlan: 'FREE',
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        },
      });
    } catch (dbError) {
      // Database not available - return success for demo mode
      console.log('Database not available, using demo mode');
      
      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          email: data.email,
          name: data.fullName,
          userType: data.userType.toUpperCase(),
        },
        demo: true,
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
