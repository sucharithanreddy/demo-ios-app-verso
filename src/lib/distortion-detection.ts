// ============================================================================
// COGNITIVE DISTORTION DETECTOR (Optimized for Low False Positives)
// ============================================================================

export interface DistortionAnalysis {
  type: string;
  confidence: number;
  evidence: string[];
  explanation: string;
}

// Weights help prioritize identity-based distortions (Labeling) over generic ones.
const DISTORTION_WEIGHTS: Record<string, number> = {
  'Labeling': 3.0,          // High priority: Identity/Core Belief
  'Catastrophizing': 2.0,   // High priority: Panic
  'All-or-Nothing Thinking': 1.5,
  'Fortune Telling': 1.5,
  'Mind Reading': 1.2,
  'Emotional Reasoning': 1.2,
  'Should Statements': 1.0,
  'Personalization': 1.2,
  'Mental Filtering': 1.0,
  'Overgeneralization': 1.0,
  'Rumination': 1.0,
  'Disqualifying the Positive': 1.0,
  'Self-Criticism': 1.5,
};

const COGNITIVE_DISTORTIONS: Record<string, {
  patterns: RegExp[];
  explanationTemplates: string[];
}> = {
  'Catastrophizing': {
    patterns: [
      /\b(disaster|catastrophe|nightmare|end of the world)\b/i,
      /\b(worst (thing|possible|case|mistake))\b/i,
      /\b(can'?t (survive|handle|take|bear) (this|it|anything))\b/i,
      /\b(going to (lose my job|ruin my life|end my life|die))\b/i,
      /\b(everything is (ruined|destroyed|over|lost|hopeless))\b/i
    ],
    explanationTemplates: [
      "Your mind is jumping to the worst possible outcome, treating a difficult situation as a total disaster.",
      "You're amplifying the negative consequences while minimizing your proven ability to cope.",
      "The situation feels apocalyptic right now, but that is likely the fear talking, not the reality."
    ]
  },
  'All-or-Nothing Thinking': {
    patterns: [
      /\b(always|never)\s+(fail|mess up|screw up|wrong|bad)\b/i,
      /\b(complete|total|utter|absolute)\s+(failure|disaster|mess|wreck)\b/i,
      /\b(if (it|this) isn'?t (perfect|exact), then (it|i)?\s+(is|am)?\s+(useless|pointless|a waste))\b/i,
      /\b(either (i|it) (succeeds|works) or (i|it) (fails|is ruined))\b/i
    ],
    explanationTemplates: [
      "You're viewing this situation in black-and-white terms, missing the gray areas and partial successes.",
      "Your thinking is polarized - either perfect or terrible - without recognizing the middle ground.",
      "You're discounting the nuance here. Reality rarely fits into absolute categories of success or failure."
    ]
  },
  'Mind Reading': {
    patterns: [
      /\b(they (think|believe|assume|probably think|must think|surely think))\s+(i'?m|i am|he|she|it is)\s+(bad|stupid|annoying|worthless|upset)\b/i,
      /\b(everyone (thinks|knows|sees|judges))\s+(me|that)\s+(negatively|badly|as a failure)\b/i,
      /\b(he|she|they) (must be|is probably) (laughing|judging|disappointed)\b/i
    ],
    explanationTemplates: [
      "You're assuming you know what others are thinking without having direct evidence of their thoughts.",
      "Your mind is filling in the gaps about others' perspectives, likely projecting your own fears onto them.",
      "You're predicting their judgment, but they might actually be focused on their own day."
    ]
  },
  'Fortune Telling': {
    patterns: [
      /\b(i (know|can tell) (it|this) (will|is going to) (fail|go wrong|be a disaster))\b/i,
      /\b(destined to|doomed to|bound to fail|certain to fail)\b/i,
      /\b(never going to|won'?t ever|will never be able to)\s+(work|succeed|get better)\b/i,
      /\b(i will (always|forever) be)\s+(alone|stuck|like this)\b/i
    ],
    explanationTemplates: [
      "You're predicting a negative future as if it's a guaranteed fact, but the future hasn't been written yet.",
      "Your mind is creating a self-fulfilling prophecy by assuming failure before you've even tried.",
      "You're treating your anxious predictions as facts rather than possibilities."
    ]
  },
  'Emotional Reasoning': {
    // CHANGED: Added negative keywords to prevent flagging "I feel like pizza"
    patterns: [
      /\b(i (feel|felt) (like|as if|that) .*(i'?m|i am|it is)\s+(wrong|bad|stupid|unlovable|a failure|hopeless))\b/i,
      /\b(because i feel (anxious|scared|bad), (it means|i must be))\b/i,
      /\b(my (gut|instincts) tell me (i'?m|it is)\s+(wrong|bad|doomed))\b/i
    ],
    explanationTemplates: [
      "You're using your feelings as evidence for what's true, but emotions are reactions, not facts.",
      "Just because something feels true doesn't make it objectively true. Feelings can be powerful but misleading.",
      "Your emotional experience is valid, but treating it as proof of reality can lead you astray."
    ]
  },
  'Should Statements': {
    // CHANGED: Added context of failure/guilt to avoid flagging "I should go to the gym"
    patterns: [
      /\b(i (should|must|have to|ought to))\s+(have (been|done)|be able to|know better)\b/i,
      /\b(i (shouldn'?t|mustn'?t))\s+(feel|think|be)\s+(this way|like this)\b/i,
      /\b(i (should|must) have)\s+(known|done|seen)\s+(it|that)\b/i
    ],
    explanationTemplates: [
      "You're using rigid rules about how things 'should' be, creating unnecessary pressure and guilt.",
      "These 'should' statements act like a harsh internal critic that never lets you off the hook.",
      "You're holding yourself to unrealistic standards that set you up for feeling inadequate."
    ]
  },
  'Labeling': {
    // CHANGED: High priority patterns for Identity statements
    patterns: [
      /\b(i (am|'?m) a\s+(loser|failure|idiot|stupid|worthless|pathetic|waste|mess|fraud|burden|disappointment))\b/i,
      /\b(i'?m such a\s+(loser|failure|idiot|mess))\b/i,
      /\b(i am (totally|completely|absolutely)\s+(worthless|useless|hopeless|broken))\b/i,
      /\b(that'?s just (who|what) i am)\b/i,
      /\b(i (am|'?m) (the type of|that kind of) person who)\s*(always|never)\s*(fails|messes up|ruins)\b/i
    ],
    explanationTemplates: [
      "You're applying a harsh, permanent label to yourself instead of describing a specific behavior or situation.",
      "This label reduces your complex humanity to a single negative judgment - you are more than this moment.",
      "Labels stick, but they're rarely accurate. You're describing what happened, not who you are."
    ]
  },
  'Personalization': {
    patterns: [
      /\b((it|this) is (all|totally|completely)\s+(my fault))\b/i,
      /\b(i (caused|ruined|messed up|screwed up))\s+(everything|it|this|the day|night))\b/i,
      /\b(if only i (had|hadn'?t|did|didn'?t))\b.*(this wouldn'?t have happened)\b/i
    ],
    explanationTemplates: [
      "You're taking more responsibility than is warranted, blaming yourself for things outside your control.",
      "While self-reflection is valuable, you may be over-owning outcomes that have multiple causes.",
      "Your mind is assuming more blame than the situation actually warrants."
    ]
  },
  'Mental Filtering': {
    patterns: [
      /\b(but (it|this) was (bad|wrong|terrible|awful|failed|a disaster))\b/i,
      /\b(the only thing that matters is)\s+(what went wrong|the bad part|the failure)\b/i,
      /\b(ignoring|dismissing)\s+(the good|the success|what worked)\b/i
    ],
    explanationTemplates: [
      "You're filtering out the positive aspects of the situation and focusing exclusively on the negative.",
      "Your mind is like a spotlight that only illuminates what went wrong, leaving the rest in darkness.",
      "You're discounting evidence that doesn't fit your negative narrative."
    ]
  },
  'Overgeneralization': {
    patterns: [
      /\b(this (always|never) happens)\b/i,
      /\b((i|it|things) (always|never) (work|go right|succeed))\b/i,
      /\b(another (failure|mistake|disaster))\b/i,
      /\b(just my (luck|typical))\b/i
    ],
    explanationTemplates: [
      "You're taking one situation and generalizing it to a universal pattern that may not exist.",
      "Your mind is drawing broad conclusions from limited evidence.",
      "You're treating this as part of an endless pattern when it might be an isolated incident."
    ]
  },
  'Rumination': {
    patterns: [
      /\b(i can'?t stop (thinking about|replaying|overthinking))\b/i,
      /\b(stuck in my head|on (a loop|repeat)|circling back)\b/i,
      /\b(keep (thinking|going back) to)\s+(what (i said|did|happened))\b/i
    ],
    explanationTemplates: [
      "Your mind is replaying past events on a loop, which can feel draining but often means there's something unresolved seeking attention.",
      "You're stuck in a thought cycle about the past - your brain is trying to process something.",
      "Rumination often happens when we're trying to solve something that can't be solved by thinking alone."
    ]
  },
  'Disqualifying the Positive': {
    patterns: [
      /\b(that (doesn'?t count|wasn'?t real|was just luck|isn'?t a big deal))\b/i,
      /\b(anyone (could have|would have) done (that|it))\b/i,
      /\b(but (that)?\s+(doesn'?t count|isn'?t enough|isn'?t special))\b/i
    ],
    explanationTemplates: [
      "You're dismissing positive experiences as if they don't count, which keeps the negative narrative intact.",
      "Your mind is explaining away anything good, refusing to let it balance the picture.",
      "When good things happen, you're finding reasons to discount them."
    ]
  },
  'Self-Criticism': {
    patterns: [
      /\b(i (am|'?m being)\s+(so|totally|completely)\s+(stupid|dumb|idiotic|pathetic|useless))\b/i,
      /\b(i (hate|loathe|can'?t stand))\s+(myself)\b/i,
      /\b(beating myself up|so hard on myself)\b/i
    ],
    explanationTemplates: [
      "You're being much harsher with yourself than you would be with anyone else.",
      "There's a lot of self-judgment here. Would you speak to a friend this way?",
      "Your inner critic is working overtime. It might think it's helping, but it's actually adding to your pain."
    ]
  }
};

export function detectDistortions(text: string): DistortionAnalysis {
  const lowerText = text.toLowerCase();
  
  let bestMatch: DistortionAnalysis = {
    type: 'Exploring Patterns',
    confidence: 0,
    evidence: [],
    explanation: 'Something in what you shared caught my attention. Let\'s explore what might be underneath it.'
  };
  
  let highestWeightedScore = 0;
  
  for (const [distortion, data] of Object.entries(COGNITIVE_DISTORTIONS)) {
    let matchCount = 0;
    const evidence: string[] = [];
    
    for (const pattern of data.patterns) {
      const match = text.match(pattern);
      if (match) {
        matchCount++;
        evidence.push(match[0]);
      }
    }
    
    if (matchCount > 0) {
      // Get the weight for this distortion (default to 1 if not found)
      const weight = DISTORTION_WEIGHTS[distortion] || 1.0;
      const weightedScore = matchCount * weight;
      
      // Compare using weighted score to prioritize Identity/Labeling
      if (weightedScore > highestWeightedScore) {
        const explanation = data.explanationTemplates[Math.floor(Math.random() * data.explanationTemplates.length)];
        bestMatch = {
          type: distortion,
          confidence: weightedScore, // Using weighted score as confidence proxy
          evidence,
          explanation
        };
        highestWeightedScore = weightedScore;
      }
    }
  }
  
  return bestMatch;
}
