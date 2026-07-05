// Sales Wellbeing Diagnostic Tool - Questions & Scoring
// Based on 4 patterns: Driver, Strategist, Connector, Reactor

export interface DiagnosticQuestion {
  id: number;
  question: string;
  pattern: 'driver' | 'strategist' | 'connector' | 'reactor';
  reverseScored?: boolean; // If true, lower score = higher pattern
}

export const diagnosticQuestions: DiagnosticQuestion[] = [
  // Driver Pattern Questions (4 questions)
  {
    id: 1,
    question: "I feel most energized when I'm chasing ambitious targets and hitting milestones.",
    pattern: 'driver',
  },
  {
    id: 2,
    question: "I tend to push through obstacles rather than step back and reassess.",
    pattern: 'driver',
  },
  {
    id: 3,
    question: "My self-worth is closely tied to my performance and achievements.",
    pattern: 'driver',
  },
  {
    id: 4,
    question: "I often sacrifice personal time to meet work goals.",
    pattern: 'driver',
  },

  // Strategist Pattern Questions (4 questions)
  {
    id: 5,
    question: "I spend significant time analyzing data and planning before taking action.",
    pattern: 'strategist',
  },
  {
    id: 6,
    question: "I feel anxious when things don't go according to my carefully laid plans.",
    pattern: 'strategist',
  },
  {
    id: 7,
    question: "I prefer to have contingency plans for multiple scenarios.",
    pattern: 'strategist',
  },
  {
    id: 8,
    question: "I sometimes get stuck in 'analysis paralysis' when making decisions.",
    pattern: 'strategist',
  },

  // Connector Pattern Questions (4 questions)
  {
    id: 9,
    question: "Building and maintaining relationships is central to how I approach sales.",
    pattern: 'connector',
  },
  {
    id: 10,
    question: "I often prioritize others' needs over my own wellbeing.",
    pattern: 'connector',
  },
  {
    id: 11,
    question: "Rejection or conflict with clients affects me deeply on a personal level.",
    pattern: 'connector',
  },
  {
    id: 12,
    question: "I derive most of my energy from positive interactions with others.",
    pattern: 'connector',
  },

  // Reactor Pattern Questions (4 questions)
  {
    id: 13,
    question: "I often feel overwhelmed by competing demands and shifting priorities.",
    pattern: 'reactor',
  },
  {
    id: 14,
    question: "I tend to respond to whoever is shouting the loudest rather than following my own agenda.",
    pattern: 'reactor',
  },
  {
    id: 15,
    question: "My stress levels fluctuate significantly based on external circumstances.",
    pattern: 'reactor',
  },
  {
    id: 16,
    question: "I struggle to maintain consistent routines and habits.",
    pattern: 'reactor',
  },
];

// Response scale: 1 = Strongly Agree, 5 = Strongly Disagree
export const responseLabels = [
  { value: 5, label: "Strongly Agree" },
  { value: 4, label: "Agree" },
  { value: 3, label: "Neutral" },
  { value: 2, label: "Disagree" },
  { value: 1, label: "Strongly Disagree" },
];

// Profile descriptions
export const profileDescriptions = {
  driver: {
    name: "Driver",
    emoji: "🚀",
    tagline: "High achiever who thrives on challenges",
    description: "Drivers are motivated by targets, competition, and achievement. They push hard and deliver results, but may risk burnout if they don't balance their drive with self-care.",
    strengths: [
      "Exceptional goal orientation and focus",
      "High resilience and determination",
      "Natural ability to inspire and lead",
      "Strong performance under pressure",
    ],
    risks: [
      "Prone to burnout from overwork",
      "May neglect personal relationships",
      "Self-worth too tied to achievements",
      "Difficulty switching off from work",
    ],
    recommendations: [
      "Schedule regular breaks and honor them",
      "Develop identity markers outside of work",
      "Practice mindfulness to stay present",
      "Set boundaries around work hours",
    ],
  },
  strategist: {
    name: "Strategist",
    emoji: "🎯",
    tagline: "Thoughtful planner who excels through preparation",
    description: "Strategists bring analytical rigor and careful planning to their work. They anticipate problems and prepare solutions, but may struggle with overthinking and flexibility.",
    strengths: [
      "Excellent at planning and preparation",
      "Strong analytical and problem-solving skills",
      "Prevents problems through foresight",
      "Detail-oriented and thorough",
    ],
    risks: [
      "Analysis paralysis - overthinking decisions",
      "Difficulty adapting when plans change",
      "High anxiety around uncertainty",
      "May miss opportunities by over-preparing",
    ],
    recommendations: [
      "Set time limits for decision-making",
      "Practice embracing 'good enough'",
      "Build flexibility into your plans",
      "Develop tolerance for uncertainty",
    ],
  },
  connector: {
    name: "Connector",
    emoji: "🤝",
    tagline: "Relationship builder who creates lasting bonds",
    description: "Connectors excel at building genuine relationships and creating trust. They're natural networkers who care deeply, but may struggle with boundaries and personal resilience.",
    strengths: [
      "Exceptional at building trust",
      "Strong emotional intelligence",
      "Creates loyal, long-term clients",
      "Natural networker and collaborator",
    ],
    risks: [
      "Taking rejection too personally",
      "Neglecting self-care for others",
      "Difficulty setting boundaries",
      "Emotional exhaustion from empathy",
    ],
    recommendations: [
      "Practice saying no without guilt",
      "Schedule self-care like client meetings",
      "Develop emotional boundaries",
      "Separate personal worth from client relationships",
    ],
  },
  reactor: {
    name: "Reactor",
    emoji: "⚡",
    tagline: "Adaptable responder who handles chaos well",
    description: "Reactors are highly responsive and can handle rapidly changing situations. They're flexible and quick, but may struggle with consistency and feeling in control.",
    strengths: [
      "Highly adaptable to change",
      "Thrives in fast-paced environments",
      "Quick problem-solving in crises",
      "Flexible and spontaneous",
    ],
    risks: [
      "Feeling overwhelmed by demands",
      "Lack of consistent routines",
      "Reactive rather than proactive mindset",
      "Stress from feeling out of control",
    ],
    recommendations: [
      "Build morning routines for stability",
      "Use time-blocking to regain control",
      "Practice prioritization frameworks",
      "Schedule proactive time each week",
    ],
  },
};

export type ProfileType = keyof typeof profileDescriptions;

// Calculate scores from answers
export function calculateResults(answers: { questionId: number; score: number }[]): {
  driverScore: number;
  strategistScore: number;
  connectorScore: number;
  reactorScore: number;
  primaryProfile: ProfileType;
  secondaryProfile: ProfileType;
} {
  const patternScores: Record<ProfileType, number> = {
    driver: 0,
    strategist: 0,
    connector: 0,
    reactor: 0,
  };

  const patternCounts: Record<ProfileType, number> = {
    driver: 0,
    strategist: 0,
    connector: 0,
    reactor: 0,
  };

  answers.forEach((answer) => {
    const question = diagnosticQuestions.find(q => q.id === answer.questionId);
    if (question) {
      const pattern = question.pattern as ProfileType;
      // Score is 1-5, we want higher = stronger pattern
      // For normal questions: lower score (agree) = stronger pattern
      // So we invert: 5-score+1 = stronger pattern score
      const patternStrength = 6 - answer.score; // 5->1, 4->2, 3->3, 2->4, 1->5
      patternScores[pattern] += patternStrength;
      patternCounts[pattern]++;
    }
  });

  // Convert to percentages
  const scores = {
    driverScore: Math.round((patternScores.driver / (patternCounts.driver * 5)) * 100),
    strategistScore: Math.round((patternScores.strategist / (patternCounts.strategist * 5)) * 100),
    connectorScore: Math.round((patternScores.connector / (patternCounts.connector * 5)) * 100),
    reactorScore: Math.round((patternScores.reactor / (patternCounts.reactor * 5)) * 100),
  };

  // Determine primary and secondary profiles
  const sortedProfiles = (Object.entries(scores) as [ProfileType, number][])
    .filter(([key]) => key.endsWith('Score'))
    .map(([key, value]) => ({
      profile: key.replace('Score', '') as ProfileType,
      score: value,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    ...scores,
    primaryProfile: sortedProfiles[0].profile,
    secondaryProfile: sortedProfiles[1].profile,
  };
}
