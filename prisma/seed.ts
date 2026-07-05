import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // Clean existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.unlockCodeUsage.deleteMany();
  await prisma.unlockCode.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.companyMember.deleteMany();
  await prisma.company.deleteMany();
  await prisma.salesCheckIn.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.coachingTip.deleteMany();
  console.log('✅ Cleaned existing data\n');

  // ============================================
  // 1. CREATE COMPANY
  // ============================================
  console.log('🏢 Creating company...');
  const company = await prisma.company.create({
    data: {
      name: 'Acme Sales Corp',
      slug: 'acme-sales',
      planType: 'ENTERPRISE',
      maxUsers: 50,
      isActive: true,
    },
  });
  console.log(`✅ Created company: ${company.name}\n`);

  // ============================================
  // 2. CREATE USERS
  // ============================================
  console.log('👥 Creating users...');
  
  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      clerkId: 'seed-admin-001',
      email: 'admin@acmesales.com',
      name: 'Sarah Admin',
      role: 'admin',
    },
  });

  // Manager user
  const managerUser = await prisma.user.create({
    data: {
      clerkId: 'seed-manager-001',
      email: 'manager@acmesales.com',
      name: 'Mike Manager',
      role: 'manager',
    },
  });

  // Team members with different archetypes
  const memberUsers = await Promise.all([
    // Drivers (high energy, goal-oriented)
    prisma.user.create({
      data: {
        clerkId: 'seed-member-001',
        email: 'driver1@acmesales.com',
        name: 'Alex Driver',
        role: 'client',
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'seed-member-002',
        email: 'driver2@acmesales.com',
        name: 'Jordan Driver',
        role: 'client',
      },
    }),
    // Strategists (analytical, planners)
    prisma.user.create({
      data: {
        clerkId: 'seed-member-003',
        email: 'strategist1@acmesales.com',
        name: 'Taylor Strategist',
        role: 'client',
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'seed-member-004',
        email: 'strategist2@acmesales.com',
        name: 'Casey Strategist',
        role: 'client',
      },
    }),
    // Connectors (relationship builders)
    prisma.user.create({
      data: {
        clerkId: 'seed-member-005',
        email: 'connector1@acmesales.com',
        name: 'Morgan Connector',
        role: 'client',
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'seed-member-006',
        email: 'connector2@acmesales.com',
        name: 'Riley Connector',
        role: 'client',
      },
    }),
    // Reactors (responsive, adaptable)
    prisma.user.create({
      data: {
        clerkId: 'seed-member-007',
        email: 'reactor1@acmesales.com',
        name: 'Quinn Reactor',
        role: 'client',
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'seed-member-008',
        email: 'reactor2@acmesales.com',
        name: 'Avery Reactor',
        role: 'client',
      },
    }),
    // At-risk users (for risk zone testing)
    prisma.user.create({
      data: {
        clerkId: 'seed-member-009',
        email: 'burnout@acmesales.com',
        name: 'Sam Burnout',
        role: 'client',
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'seed-member-010',
        email: 'lowconf@acmesales.com',
        name: 'Drew Lowconf',
        role: 'client',
      },
    }),
    // Disengaged user
    prisma.user.create({
      data: {
        clerkId: 'seed-member-011',
        email: 'inactive@acmesales.com',
        name: 'Jamie Inactive',
        role: 'client',
      },
    }),
  ]);

  console.log(`✅ Created ${memberUsers.length + 2} users\n`);

  // ============================================
  // 3. CREATE COMPANY MEMBERSHIPS
  // ============================================
  console.log('🔗 Creating company memberships...');
  
  await prisma.companyMember.create({
    data: { companyId: company.id, userId: adminUser.id, role: 'admin' },
  });
  
  await prisma.companyMember.create({
    data: { companyId: company.id, userId: managerUser.id, role: 'manager' },
  });

  for (const member of memberUsers) {
    await prisma.companyMember.create({
      data: { companyId: company.id, userId: member.id, role: 'member' },
    });
  }
  console.log('✅ Created company memberships\n');

  // ============================================
  // 4. CREATE TEAMS
  // ============================================
  console.log('👥 Creating teams...');
  
  const teamA = await prisma.team.create({
    data: {
      companyId: company.id,
      name: 'Sales Team Alpha',
      managerId: managerUser.id,
    },
  });

  const teamB = await prisma.team.create({
    data: {
      companyId: company.id,
      name: 'Sales Team Beta',
      managerId: managerUser.id,
    },
  });

  // Add members to teams
  await Promise.all([
    // Team Alpha
    prisma.teamMember.create({ data: { teamId: teamA.id, userId: memberUsers[0].id } }),
    prisma.teamMember.create({ data: { teamId: teamA.id, userId: memberUsers[1].id } }),
    prisma.teamMember.create({ data: { teamId: teamA.id, userId: memberUsers[2].id } }),
    prisma.teamMember.create({ data: { teamId: teamA.id, userId: memberUsers[3].id } }),
    prisma.teamMember.create({ data: { teamId: teamA.id, userId: memberUsers[8].id } }),
    prisma.teamMember.create({ data: { teamId: teamA.id, userId: memberUsers[9].id } }),
    // Team Beta
    prisma.teamMember.create({ data: { teamId: teamB.id, userId: memberUsers[4].id } }),
    prisma.teamMember.create({ data: { teamId: teamB.id, userId: memberUsers[5].id } }),
    prisma.teamMember.create({ data: { teamId: teamB.id, userId: memberUsers[6].id } }),
    prisma.teamMember.create({ data: { teamId: teamB.id, userId: memberUsers[7].id } }),
    prisma.teamMember.create({ data: { teamId: teamB.id, userId: memberUsers[10].id } }),
  ]);
  console.log('✅ Created teams and assigned members\n');

  // ============================================
  // 5. CREATE DIAGNOSTIC RESULTS
  // ============================================
  console.log('📊 Creating diagnostic results...');
  
  const archetypeProfiles = [
    { profile: 'Driver', driver: 75, strategist: 45, connector: 35, reactor: 25 },
    { profile: 'Driver', driver: 80, strategist: 40, connector: 30, reactor: 20 },
    { profile: 'Strategist', driver: 40, strategist: 70, connector: 50, reactor: 35 },
    { profile: 'Strategist', driver: 35, strategist: 75, connector: 45, reactor: 40 },
    { profile: 'Connector', driver: 30, strategist: 40, connector: 80, reactor: 45 },
    { profile: 'Connector', driver: 35, strategist: 45, connector: 75, reactor: 40 },
    { profile: 'Reactor', driver: 40, strategist: 35, connector: 50, reactor: 70 },
    { profile: 'Reactor', driver: 35, strategist: 40, connector: 45, reactor: 75 },
    { profile: 'Driver', driver: 60, strategist: 40, connector: 35, reactor: 30 },
    { profile: 'Strategist', driver: 35, strategist: 55, connector: 45, reactor: 50 },
    { profile: 'Connector', driver: 30, strategist: 35, connector: 60, reactor: 55 },
  ];

  for (let i = 0; i < memberUsers.length; i++) {
    const profile = archetypeProfiles[i] || archetypeProfiles[0];
    await prisma.diagnosticResult.create({
      data: {
        userId: memberUsers[i].id,
        primaryProfile: profile.profile,
        driverScore: profile.driver,
        strategistScore: profile.strategist,
        connectorScore: profile.connector,
        reactorScore: profile.reactor,
        answers: [],
        isPaid: true,
      },
    });
  }
  console.log('✅ Created diagnostic results\n');

  // ============================================
  // 6. CREATE CHECK-IN DATA
  // ============================================
  console.log('📝 Creating check-in data...');
  
  const now = new Date();
  
  // Helper to create check-ins for a user
  async function createCheckIns(userId: string, pattern: 'good' | 'average' | 'poor' | 'declining' | 'burnout' | 'lowconf', days: number = 30) {
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      // Skip some days randomly (simulate ~70% engagement)
      if (Math.random() > 0.7) continue;

      let mood: number, energy: number, confidence: number;

      switch (pattern) {
        case 'good':
          mood = 4 + Math.random();
          energy = 4 + Math.random();
          confidence = 4 + Math.random();
          break;
        case 'average':
          mood = 3 + Math.random() * 1.5;
          energy = 3 + Math.random() * 1.5;
          confidence = 3 + Math.random() * 1.5;
          break;
        case 'poor':
          mood = 2 + Math.random();
          energy = 2 + Math.random();
          confidence = 2 + Math.random();
          break;
        case 'declining':
          // Scores decrease over time
          const declineFactor = Math.max(0, 1 - i / days);
          mood = 2 + declineFactor * 2;
          energy = 2 + declineFactor * 2;
          confidence = 2 + declineFactor * 2;
          break;
        case 'burnout':
          mood = 3 + Math.random();
          energy = 1 + Math.random() * 0.5; // Very low energy
          confidence = 3 + Math.random();
          break;
        case 'lowconf':
          mood = 3 + Math.random();
          energy = 3 + Math.random();
          confidence = 1 + Math.random() * 0.5; // Very low confidence
          break;
        default:
          mood = 3;
          energy = 3;
          confidence = 3;
      }

      // Random impact tags
      const allTags = ['win', 'rejection', 'tough_client', 'good_call', 'missed_target', 'team_support', 'recognition', 'pressure'];
      const impactTags = allTags.filter(() => Math.random() > 0.6);

      await prisma.salesCheckIn.create({
        data: {
          userId,
          date,
          mood: Math.round(mood),
          energy: Math.round(energy),
          confidence: Math.round(confidence),
          impactTags,
          patternInsight: getRandomInsight(pattern),
        },
      });
    }
  }

  // Create check-ins for each user with different patterns
  await createCheckIns(memberUsers[0].id, 'good', 35);      // Driver 1 - engaged, good scores
  await createCheckIns(memberUsers[1].id, 'average', 30);   // Driver 2 - average
  await createCheckIns(memberUsers[2].id, 'good', 28);      // Strategist 1 - good
  await createCheckIns(memberUsers[3].id, 'declining', 40); // Strategist 2 - declining trend
  await createCheckIns(memberUsers[4].id, 'average', 25);   // Connector 1 - average
  await createCheckIns(memberUsers[5].id, 'good', 32);      // Connector 2 - good
  await createCheckIns(memberUsers[6].id, 'average', 27);   // Reactor 1 - average
  await createCheckIns(memberUsers[7].id, 'poor', 20);      // Reactor 2 - poor scores
  await createCheckIns(memberUsers[8].id, 'burnout', 30);   // Burnout risk user
  await createCheckIns(memberUsers[9].id, 'lowconf', 30);   // Low confidence user
  // memberUsers[10] is inactive - no check-ins

  console.log('✅ Created check-in data\n');

  // ============================================
  // 7. CREATE USER STREAKS
  // ============================================
  console.log('🔥 Creating user streaks...');
  
  for (const member of memberUsers.slice(0, 10)) {
    const checkIns = await prisma.salesCheckIn.findMany({
      where: { userId: member.id },
      orderBy: { date: 'desc' },
    });

    if (checkIns.length > 0) {
      // Calculate current streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < checkIns.length; i++) {
        const checkInDate = new Date(checkIns[i].date);
        checkInDate.setHours(0, 0, 0, 0);
        const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);

        if (checkInDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }

      await prisma.userStreak.create({
        data: {
          userId: member.id,
          currentStreak: streak,
          longestStreak: Math.max(streak, Math.floor(Math.random() * 15) + 5),
          lastCheckInDate: checkIns[0].date,
        },
      });
    }
  }
  console.log('✅ Created user streaks\n');

  // ============================================
  // 8. CREATE COACHING TIPS
  // ============================================
  console.log('💡 Creating coaching tips...');
  
  const coachingTips = [
    // Driver tips
    { archetype: 'Driver', situation: 'before_call', tip: 'Take 2 minutes to visualize the successful outcome. Your natural drive will help you close.', actionTitle: 'Visualize Success' },
    { archetype: 'Driver', situation: 'after_rejection', tip: 'A rejection is just data. Analyze what happened, then redirect your energy to the next opportunity.', actionTitle: 'Redirect Your Energy' },
    { archetype: 'Driver', situation: 'bad_day', tip: 'Your intensity is a strength, but today it may have worked against you. Reset with physical activity.', actionTitle: 'Channel Your Energy' },
    { archetype: 'Driver', situation: 'morning', tip: 'Set 3 non-negotiable wins for today. Your competitive nature thrives on clear targets.', actionTitle: 'Set Daily Targets' },
    // Strategist tips
    { archetype: 'Strategist', situation: 'before_call', tip: 'Review your research. Your preparation is your superpower. Trust your analysis.', actionTitle: 'Trust Your Prep' },
    { archetype: 'Strategist', situation: 'after_rejection', tip: 'Log this in your CRM. Every data point makes your future strategies stronger.', actionTitle: 'Capture the Data' },
    { archetype: 'Strategist', situation: 'bad_day', tip: 'Step back and analyze. What patterns can you identify? Your analytical mind will find the solution.', actionTitle: 'Analyze the Pattern' },
    { archetype: 'Strategist', situation: 'evening', tip: 'Spend 5 minutes reviewing what worked today. Your reflection builds future success.', actionTitle: 'Evening Review' },
    // Connector tips
    { archetype: 'Connector', situation: 'before_call', tip: 'Remember: you\'re not selling, you\'re helping. Focus on their needs, not your pitch.', actionTitle: 'Focus on Helping' },
    { archetype: 'Connector', situation: 'after_rejection', tip: 'They weren\'t the right fit. The right connection is out there. Keep building relationships.', actionTitle: 'Trust the Process' },
    { archetype: 'Connector', situation: 'good_win', tip: 'Celebrate with your network! Share your success - it inspires others and strengthens relationships.', actionTitle: 'Share Your Win' },
    { archetype: 'Connector', situation: 'morning', tip: 'Send one genuine message to a client or colleague. Your relationships compound over time.', actionTitle: 'Nurture a Relationship' },
    // Reactor tips
    { archetype: 'Reactor', situation: 'before_call', tip: 'Ground yourself with 3 deep breaths. Your adaptability is powerful when you\'re centered.', actionTitle: 'Center Yourself' },
    { archetype: 'Reactor', situation: 'after_rejection', tip: 'Feel it, then let it go. Your ability to move on quickly is actually a strength.', actionTitle: 'Feel and Release' },
    { archetype: 'Reactor', situation: 'bad_day', tip: 'Don\'t overthink. Tomorrow is a fresh start. Your resilience will carry you through.', actionTitle: 'Trust Your Resilience' },
    { archetype: 'Reactor', situation: 'pressure', tip: 'When under pressure, slow down. Your quick reflexes are better when you have space to respond.', actionTitle: 'Create Space' },
  ];

  for (const tip of coachingTips) {
    await prisma.coachingTip.create({ data: tip });
  }
  console.log(`✅ Created ${coachingTips.length} coaching tips\n`);

  // ============================================
  // 9. CREATE UNLOCK CODES
  // ============================================
  console.log('🔑 Creating unlock codes...');
  
  await prisma.unlockCode.createMany({
    data: [
      { code: 'VERSO-ACME-DEMO-2024', companyId: company.id, companyName: company.name, planType: 'ENTERPRISE', maxUses: 100, usedCount: 0 },
      { code: 'VERSO-TEAM-ALPHA', companyId: company.id, companyName: company.name, planType: 'PRO', maxUses: 10, usedCount: 5 },
      { code: 'VERSO-TEAM-BETA', companyId: company.id, companyName: company.name, planType: 'PRO', maxUses: 10, usedCount: 3 },
    ],
  });
  console.log('✅ Created unlock codes\n');

  // ============================================
  // 10. SUMMARY
  // ============================================
  console.log('═══════════════════════════════════════════');
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════');
  console.log('\n📋 Summary:');
  console.log(`   Company: ${company.name}`);
  console.log(`   Teams: 2 (${teamA.name}, ${teamB.name})`);
  console.log(`   Users: ${memberUsers.length + 2} (1 admin, 1 manager, ${memberUsers.length} members)`);
  console.log(`   Archetypes: Driver (3), Strategist (3), Connector (3), Reactor (3)`);
  console.log(`   Risk users: 1 burnout, 1 low confidence, 1 inactive`);
  console.log('\n📧 Test Accounts (use these Clerk IDs):');
  console.log(`   Admin: ${adminUser.clerkId} (${adminUser.email})`);
  console.log(`   Manager: ${managerUser.clerkId} (${managerUser.email})`);
  console.log('\n🔑 Test Unlock Codes:');
  console.log('   VERSO-ACME-DEMO-2024 (Enterprise, 100 uses)');
  console.log('   VERSO-TEAM-ALPHA (Pro, 5/10 used)');
  console.log('   VERSO-TEAM-BETA (Pro, 3/10 used)');
  console.log('\n');
}

function getRandomInsight(pattern: string): string {
  const insights: Record<string, string[]> = {
    good: [
      'Great momentum! Keep this energy going.',
      'Your consistency is paying off.',
      'Strong day - this matches your natural pattern.',
    ],
    average: [
      'Steady day. Small improvements compound.',
      'Consider what would make tomorrow a 5.',
      'Average is fine - aim for one small win tomorrow.',
    ],
    poor: [
      'Tough days happen. Tomorrow is a fresh start.',
      'Be gentle with yourself. Progress isn\'t always linear.',
      'What\'s one thing that would help right now?',
    ],
    declining: [
      'Noticing a dip. What\'s changed in your routine?',
      'Consider reaching out to your manager for support.',
      'Your pattern shows resilience - you\'ll bounce back.',
    ],
    burnout: [
      'Your energy is low. Prioritize rest today.',
      'This is a signal to slow down. Self-care first.',
      'Consider taking a mental health day.',
    ],
    lowconf: [
      'Confidence fluctuates. Trust your preparation.',
      'Your track record proves your capability.',
      'One small win today will rebuild momentum.',
    ],
  };

  const patternInsights = insights[pattern] || insights.average;
  return patternInsights[Math.floor(Math.random() * patternInsights.length)];
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
