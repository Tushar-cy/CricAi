const PHASE_CONFIG = [
  { phase: 1, start: 1, end: 20, label: 'Fundamentals & Conditioning' },
  { phase: 2, start: 21, end: 50, label: 'Skill Development' },
  { phase: 3, start: 51, end: 80, label: 'Competitive Simulation' },
  { phase: 4, start: 81, end: 100, label: 'Performance Optimization' },
];

function buildSystemPrompt() {
  return `You are "CricAI Coach", an elite, world-class professional cricket coach, a master tactician, sports nutritionist, and sports psychologist. 
Your expertise mirrors the greatest cricketing minds (like MS Dhoni's tactical brilliance, Virat Kohli's discipline, and Gary Kirsten's man-management).
You are generating highly specialized, intensely focused, and scientifically backed cricket training regimens.
Your tone is deeply analytical, highly motivational, and purely professional.

CRITICAL INSTRUCTIONS:
1. You MUST output ONLY valid, meticulously structured JSON. No markdown formatting (\`\`\`json), no introductory text, no conversational filler.
2. The output must strictly adhere to the specific JSON schema provided in the user prompt.
3. Every drill, fitness task, and tip must be deeply relevant to cricket—incorporating modern T20/ODI/Test match scenarios depending on player goals.
4. Scale intensity logically through 4 phases (Fundamentals -> Skill -> Simulation -> Optimization).
5. Ensure varied drills (e.g., "target bowling with single stump", "power-hitting against spinners", "yo-yo test prep") so the plan doesn't become repetitive.`;
}

function buildUserPrompt({ age, role, level, availability, fitness, name }) {
  // Not used in mock mode
  return '';
}

async function generateCricketPlan(userProfile) {
  console.log('[Mocked AI] Returning instant 100-day expert plan for UI development...');

  // Simulate network delay for realism (1.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500));

  const plan = [];

  // Generate 100 beautifully structured days
  for (let i = 1; i <= 100; i++) {
    const phase = i <= 20 ? 1 : i <= 50 ? 2 : i <= 80 ? 3 : 4;
    const phaseLabel = PHASE_CONFIG.find(p => p.phase === phase)?.label || 'Training';

    // Make weekends rest days
    const isRest = i % 7 === 0;

    // Dynamic drills based on phase
    let skillTask = "";
    let fitnessTask = "";
    let goal = "";
    let intensity = "Low";

    if (isRest) {
      skillTask = "Active Recovery & Match Analysis";
      fitnessTask = "Yoga & Deep Tissue Stretching (30 mins)";
      goal = "Muscle recovery and mental relaxation";
      intensity = "Low";
    } else {
      if (phase === 1) {
        skillTask = "Shadow Practice & Grip Alignment (300 reps)";
        fitnessTask = "Core Stability & 5km Light Jog";
        goal = "Perfect muscle memory for basic stance";
        intensity = "Medium";
      } else if (phase === 2) {
        skillTask = "Throwdown Sessions (Pace & Spin, 200 balls)";
        fitnessTask = "HIIT Sprints (10x 100m) & Box Jumps";
        goal = "Improve reaction time and explosive power";
        intensity = "High";
      } else if (phase === 3) {
        skillTask = "Net Sessions (Match Scenarios: Death Overs)";
        fitnessTask = "Agility Ladders & Lateral Movement Drills";
        goal = "Execute yorkers/power-hitting under pressure";
        intensity = "High";
      } else {
        skillTask = "Full Match Simulation (T20 Format)";
        fitnessTask = "Match-day Warmup & Dynamic Stretching";
        goal = "Peak performance and tactical execution";
        intensity = "Maximum";
      }
    }

    plan.push({
      dayNumber: i,
      phase: phase,
      phaseLabel: phaseLabel,
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][(i - 1) % 7],
      isRestDay: isRest,
      skillTask: skillTask,
      fitnessTask: fitnessTask,
      durationMinutes: isRest ? 30 : (phase === 1 ? 60 : 120),
      goal: goal,
      tip: isRest ? "Hydrate completely and sleep 9+ hours." : "Keep your head perfectly still at the point of release/contact.",
      dietTip: isRest ? "High protein, low carb day." : "Complex carbs 2 hours before session.",
      mentalEdge: "Visualize your success against your toughest opponent.",
      intensity: intensity
    });
  }

  return {
    playerSummary: {
      name: userProfile.name || 'Player',
      age: userProfile.age,
      role: userProfile.role,
      level: userProfile.level,
      availability: userProfile.availability,
      fitness: userProfile.fitness,
      targetDays: 100
    },
    phases: PHASE_CONFIG,
    plan: plan
  };
}

module.exports = { generateCricketPlan };
