/**
 * CricAI — AI Service (OpenAI GPT-4o-mini)
 *
 * All AI features route through this file.
 * Model is configured via GPT_MODEL env var (default: gpt-4o-mini).
 */

const OpenAI = require('openai');

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
});
const MODEL  = process.env.GPT_MODEL || 'gpt-4o-mini';

// ── Coach Personas ────────────────────────────────────────────────────────────
const COACH_PERSONAS = {
  virat: {
    name: 'Coach Virat',
    gender: 'male',
    style: `You are Coach Virat — a legendary Indian cricket coach who sounds like a mix of Virat Kohli's intensity and MS Dhoni's calm. You are brutally honest, deeply technical, and drop cricket wisdom like bars. You use desi slang occasionally ("bhai", "yaar", "absolutely smashed it"), cricket metaphors, and end responses with a fire motivational line. You are NOT a robot — you have opinions, you hype up good questions, and you call out lazy thinking. Max 4 sentences. Be specific, technical, FUNNY when appropriate.`,
  },
  rashid: {
    name: 'Coach Rashid',
    gender: 'male',
    style: `You are Coach Rashid — think a mix of Rashid Khan's joy and a T20 wizard. You're energetic, punny, love cricket humor. You use phrases like "absolutely ripped", "that's a hat-trick of great points", cricket wordplay. You make technical advice FUN and memorable. Always drop one cricket pun per response. Max 4 sentences.`,
  },
  priya: {
    name: 'Coach Priya',
    gender: 'female',
    style: `You are Coach Priya — a fierce, brilliant women's cricket coach. Think Smriti Mandhana's elegance meets a STEM PhD coach. You are sharp, precise, and don't sugarcoat. You celebrate wins loudly and fix weaknesses ruthlessly. You say things like "let's actually fix this", "the data says", "come on, you're better than that". One laugh-out-loud moment per response. Max 4 sentences.`,
  },
  deandra: {
    name: 'Coach Deandra',
    gender: 'female',
    style: `You are Coach Deandra — inspired by West Indies power cricket. You are bold, loud, confident. You talk about cricket like it's a party you're winning. "Big energy only", "that's a six and a half!", cricket slang mixed with hype. You make every player feel like an international superstar. Max 4 sentences.`,
  },
};

// ── Core OpenAI caller ────────────────────────────────────────────────────────
async function callGPT(messages, maxTokens = 500, temperature = 0.8) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  });
  return completion.choices[0].message.content.trim();
}

// ── Feature: Personalized player insight (attached to generated plan) ─────────
async function generatePlayerInsight(profile) {
  try {
    const text = await callGPT([
      {
        role: 'system',
        content: 'You are an expert cricket coach with 20 years of experience. Write concise, personalized player assessments.',
      },
      {
        role: 'user',
        content: `Write a personalized 3-sentence assessment for this cricket player:
Name: ${profile.name || 'Player'}
Age: ${profile.age} years old
Specialization: ${profile.role}
Experience Level: ${profile.level}
Fitness Level: ${profile.fitness}
Training Days Per Week: ${profile.availability}

Requirements:
- Be specific to their role (${profile.role}) and level (${profile.level})
- Mention their biggest area for improvement in the 100-day program
- End with one key mental mindset tip
- Keep it under 80 words, no bullet points, conversational tone`,
      },
    ], 300, 0.75);
    return { text, aiGenerated: true };
  } catch (err) {
    console.error('[CricAI] generatePlayerInsight error:', err.message);
    return {
      text: `${profile.name || 'Player'} is a ${profile.level?.toLowerCase()} ${profile.role?.toLowerCase()} beginning a structured 100-day transformation. Focus on strong fundamentals before advancing to competitive simulation.`,
      aiGenerated: false,
    };
  }
}

// ── Feature: AI Cricket Coach Chat ────────────────────────────────────────────
async function answerCoachQuestion(message, context = {}, personaKey = 'virat') {
  const persona = COACH_PERSONAS[personaKey] || COACH_PERSONAS.virat;

  const ctxParts = [
    context.role      && `The player is a ${context.role}`,
    context.level     && `at ${context.level} level`,
    context.dayNumber && `currently on Day ${context.dayNumber} of their 100-day plan`,
    context.phase     && `in Phase ${context.phase}${context.phaseLabel ? ': ' + context.phaseLabel : ''}`,
  ].filter(Boolean);

  const contextStr = ctxParts.length > 0
    ? ctxParts.join(', ') + '.'
    : 'The player has not set up their profile yet.';

  try {
    const reply = await callGPT([
      {
        role: 'system',
        content: `${persona.style}

Player context: ${contextStr}

Rules:
- NEVER say you're an AI or mention GPT/OpenAI
- NEVER use bullet points in responses
- Always give ONE concrete drill or technique they can do TODAY
- If the question is vague, give your best cricket advice anyway
- Inject personality — don't be boring`,
      },
      { role: 'user', content: message },
    ], 400, 0.9);

    return { reply, model: MODEL, online: true, coach: persona.name };
  } catch (err) {
    console.error('[CricAI Coach] answerCoachQuestion error:', err.message);
    return {
      reply: `Something went wrong connecting to the AI. Check your OPENAI_API_KEY in backend/.env.`,
      model: 'error',
      online: false,
      error: err.message,
    };
  }
}

// ── Feature: Single personalized day tip ─────────────────────────────────────
async function generateDayTip(day, profile) {
  try {
    const tip = await callGPT([
      {
        role: 'system',
        content: 'You are a cricket coach. Give exactly one sharp, technical, actionable training tip in 1-2 sentences.',
      },
      {
        role: 'user',
        content: `Cricket training tip for Day ${day.dayNumber} (${day.phaseLabel} phase).
Player: ${profile?.role || 'Batsman'}, ${profile?.level || 'Intermediate'} level.
Today's focus: ${day.skillTask}.
Give one specific, actionable technique tip. Be direct and technical.`,
      },
    ], 120, 0.8);
    return tip;
  } catch (err) {
    console.error('[CricAI] generateDayTip error:', err.message);
    return day.tip || 'Keep your head still at point of contact — eyes level always.';
  }
}

// ── Feature: 100-day plan template generator (unchanged logic) ────────────────
const PHASE_CONFIG = [
  { phase: 1, start: 1, end: 20, label: 'Fundamentals & Conditioning' },
  { phase: 2, start: 21, end: 50, label: 'Skill Development' },
  { phase: 3, start: 51, end: 80, label: 'Competitive Simulation' },
  { phase: 4, start: 81, end: 100, label: 'Performance Optimization' },
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SKILL_TASKS = {
  1: [
    'Shadow batting stance drill (300 reps)',
    'Grip & footwork fundamentals',
    'Straight drive technique (200 balls throwdown)',
    'Defense against hard-length pace bowling',
    'Front foot play against spin (100 balls)',
  ],
  2: [
    'Throwdown session: pace & spin (200 balls)',
    'Cut & pull shot practice (100 reps)',
    'Power hitting against off-spin (50 balls)',
    'Sweep shot variations drill (30 mins)',
    'Running between wickets simulation',
  ],
  3: [
    'Death over net session - T20 format (10 overs)',
    'Match scenario: 20 runs off last 2 overs drill',
    'Pressure chase simulation: 150 target in 15 overs',
    'Handling wrist spin under pressure',
    'Yorker handling drill (100 balls faced)',
  ],
  4: [
    'Full T20 match simulation (batting & fielding)',
    'Reverse sweep mastery drill (50 reps)',
    'Switch hitting practice against pace',
    'Pressure innings: 50 off 30 balls drill',
    'On-field decision making & batting review',
  ],
};

const FITNESS_TASKS = {
  1: 'Core Stability Circuit + 5km Light Jog',
  2: 'HIIT Sprints (10×100m) + Box Jumps (3 sets of 15)',
  3: 'Agility Ladders + Lateral Band Walks + Sprint Intervals',
  4: 'Match-Day Dynamic Warmup + Explosive Power Drills',
};

const ELABORATE_TIPS = {
  1: [
    "Focus entirely on your head position today. If your head falls over to the off-side during your trigger movement, you will struggle against the inswinger. Keep it completely still.",
    "Your grip dictates your bat speed. Ensure your top hand is dominating the stroke while the bottom hand remains loose, only guiding the direction at the very last second.",
    "Footwork isn't just about moving forward or back; it's about transferring your entire body weight into the line of the ball. Don't just reach for it—stride into it."
  ],
  2: [
    "When facing pace, your backlift needs to be higher and more pronounced. A high backlift generates natural downswing momentum, allowing you to punch the ball without forcing it.",
    "Against spin, don't pre-meditate. Watch the ball out of the bowler's hand. If it's tossed up above the eye-line, get to the pitch. If it's flat, stay deep in your crease.",
    "Explosive rotation is key for the pull shot. Don't just use your arms; swivel your hips violently and let the bat follow the rotation of your core."
  ],
  3: [
    "Under pressure, your breathing gets shallow. Before every delivery in this drill, take a deep breath in through your nose for 3 seconds, and exhale slowly. Reset your mind.",
    "In death over situations, bowler's will hunt for the wide yorker. Stand deep in your crease and slightly open your stance to access the off-side field more easily.",
    "When chasing a high required rate, don't try to hit every ball for six. Look for the gaps, hit hard into the turf, and aggressively convert ones into twos."
  ],
  4: [
    "Match day is about execution, not technique. Trust the thousands of hours of muscle memory you've built. See the ball, hit the ball. Do not overthink.",
    "Body language dictates dominance. Walk to the crease like you own it. Stare the bowler down. If you project absolute confidence, the opposition will feel the pressure.",
    "Game awareness is your greatest weapon today. Know the field, know the bowler's strike rate, and understand exactly where your low-risk boundaries are."
  ]
};

const ELABORATE_DIET_TIPS = {
  1: [
    "Hydration starts 24 hours before your session. Drink at least 3 liters of water today. Add a pinch of Himalayan pink salt to your morning water to replenish essential electrolytes.",
    "Focus on slow-releasing carbohydrates today to build your energy reserves. Sweet potatoes, brown rice, and rolled oats should make up 40% of your total caloric intake.",
    "Muscle breakdown is high during foundational phases. Consume a minimum of 30g of high-quality protein (like grilled chicken, paneer, or whey isolate) within 45 minutes of finishing your session."
  ],
  2: [
    "Intensity is peaking. You need immediate energy sources. Consume a banana and a black coffee 45 minutes before this session to spike your blood glucose and central nervous system.",
    "During this high-intensity drill, you will sweat out crucial minerals. Sip on an electrolyte-infused sports drink every 15 minutes. Plain water won't cut it today.",
    "Post-session inflammation will be severe. Incorporate omega-3 fatty acids tonight (salmon or chia seeds) and drink tart cherry juice before bed to accelerate muscle repair."
  ],
  3: [
    "Simulation days require sustained cognitive function. Don't eat heavy, fat-rich foods before the session as they draw blood to the stomach. Stick to easily digestible carbs and lean protein.",
    "Keep your blood sugar perfectly stable during this long session. Snack on dates or a small handful of raisins between overs to maintain focus without crashing.",
    "Recovery is just as important as the drill. Tonight's dinner must be macro-balanced: 40% complex carbs, 40% lean protein, and 20% healthy fats to completely repair torn muscle fibers."
  ],
  4: [
    "Match Day Nutrition: Do not try anything new today. Stick to the exact pre-match meal that has made you feel energetic in practice. Comfort and familiarity are key.",
    "Avoid heavy dairy or fibrous vegetables leading into the match; they slow digestion and can make you feel sluggish on the field. Keep it light, clean, and carb-heavy.",
    "During the innings break, avoid heavy foods. Drink coconut water and eat half a banana. You want your blood in your muscles for explosive movements, not in your gut for digestion."
  ]
};

async function generateCricketPlan(userProfile) {
  console.log('[CricAI] Generating 100-day plan...');
  await new Promise(resolve => setTimeout(resolve, 800));

  const plan = [];
  for (let i = 1; i <= 100; i++) {
    const phase     = i <= 20 ? 1 : i <= 50 ? 2 : i <= 80 ? 3 : 4;
    const phaseLabel = PHASE_CONFIG[phase - 1].label;
    const isRest    = i % 7 === 0;
    const drillIdx  = (i - 1) % SKILL_TASKS[phase].length;
    const dayOfWeek = DAYS_OF_WEEK[(i - 1) % 7];

    const skillTask   = isRest ? 'Active Recovery & Match Video Analysis' : SKILL_TASKS[phase][drillIdx];
    const fitnessTask = isRest ? 'Yoga & Deep Tissue Stretching (30 mins)' : FITNESS_TASKS[phase];
    const intensity   = isRest ? 'Low' : phase === 1 ? 'Medium' : phase === 2 ? 'High' : phase === 3 ? 'High' : 'Maximum';
    const duration    = isRest ? 30 : 60 + (phase - 1) * 20;
    const goal        = isRest
      ? 'Full muscle recovery and mental reset'
      : phase === 1 ? 'Build correct muscle memory and technical foundation'
      : phase === 2 ? 'Sharpen match-specific skills and explosiveness'
      : phase === 3 ? 'Perform under match-like pressure with consistency'
      : 'Deliver peak match-winning performance';

    const tip = isRest 
      ? 'Rest days are for mental visualization. Watch footage of your favorite player and study their footwork.'
      : ELABORATE_TIPS[phase][drillIdx % ELABORATE_TIPS[phase].length];

    const dietTip = isRest
      ? 'High protein, low carb recovery day. Prioritise deep sleep over supplements. Your muscles grow while you rest, not while you train.'
      : ELABORATE_DIET_TIPS[phase][drillIdx % ELABORATE_DIET_TIPS[phase].length];

    plan.push({
      dayNumber: i, phase, phaseLabel, dayOfWeek, isRestDay: isRest,
      skillTask, fitnessTask, durationMinutes: duration, goal, intensity,
      tip: tip,
      dietTip: dietTip,
      mentalEdge: 'Visualise your best performance against your toughest opponent. See it, then believe it.',
    });
  }

  return {
    playerSummary: {
      name:         userProfile.name || 'Player',
      age:          userProfile.age,
      role:         userProfile.role,
      level:        userProfile.level,
      availability: userProfile.availability,
      fitness:      userProfile.fitness,
      targetDays:   100,
    },
    phases: PHASE_CONFIG,
    plan,
  };
}

module.exports = {
  generateCricketPlan,
  generatePlayerInsight,
  answerCoachQuestion,
  generateDayTip,
  COACH_PERSONAS,
  MODEL,
};
