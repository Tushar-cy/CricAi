require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { createClient } = require('@supabase/supabase-js');
const {
  generateCricketPlan,
  generatePlayerInsight,
  answerCoachQuestion,
  generateDayTip,
  MODEL,
} = require('./services/openai');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Supabase admin client (server-side only — never exposed to client) ─────────
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

app.use(cors({ origin: '*' })); // TODO: restrict to your domain in production
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ok',
    message:   'CricAI Backend is running 🏏',
    model:     MODEL,
    timestamp: new Date().toISOString(),
  });
});

// ── Generate training plan + GPT player insight ───────────────────────────────
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { age, role, level, availability, fitness, name } = req.body;
    if (!age || !role || !level || !availability || !fitness) {
      return res.status(400).json({ error: 'Missing required fields: age, role, level, availability, fitness' });
    }
    console.log(`[CricAI] Generating plan for ${name || 'Player'} | ${role} | ${level}`);

    const [plan, insight] = await Promise.all([
      generateCricketPlan({ age, role, level, availability, fitness, name }),
      generatePlayerInsight({ name, age, role, level, availability, fitness }),
    ]);

    plan.playerSummary.aiInsight   = insight.text;
    plan.playerSummary.aiGenerated = insight.aiGenerated;
    console.log(`[CricAI] AI insight ${insight.aiGenerated ? '✅ GPT' : '⚠️ fallback'} for ${name || 'Player'}`);

    res.json({ success: true, data: plan, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[CricAI] Error generating plan:', error.message);
    res.status(500).json({ error: 'Failed to generate training plan.', details: error.message });
  }
});

// ── AI Cricket Coach Chat ─────────────────────────────────────────────────────
app.post('/api/coach-chat', async (req, res) => {
  try {
    const { message, context, coachPersona } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'message is required' });
    console.log(`[Coach:${coachPersona || 'virat'}] Q: "${message.slice(0, 60)}…"`);
    const result = await answerCoachQuestion(message, context || {}, coachPersona || 'virat');
    console.log(`[Coach] A: "${(result.reply || '').slice(0, 60)}…"`);
    res.json(result);
  } catch (error) {
    console.error('[Coach] Error:', error.message);
    res.status(500).json({ error: 'Coach chat failed.', details: error.message });
  }
});

// ── Single day tip (GPT) ──────────────────────────────────────────────────────
app.post('/api/day-tip', async (req, res) => {
  try {
    const { day, profile } = req.body;
    if (!day) return res.status(400).json({ error: 'day is required' });
    const tip = await generateDayTip(day, profile || {});
    res.json({ tip });
  } catch (error) {
    console.error('[DayTip] Error:', error.message);
    res.status(500).json({ error: 'Day tip failed.', details: error.message });
  }
});

// ── Warmup generator ──────────────────────────────────────────────────────────
const WARMUPS = {
  '1_Low':     ['Neck rolls 30s', 'Arm circles 20 reps', 'Hip rotations', 'Walk 5 mins', 'Shadow batting 30 reps'],
  '1_Medium':  ['Neck rolls 30s', 'Arm circles 20 reps', 'Hip rotations 20 reps', 'Light jog 3 mins', 'Shadow batting 50 reps'],
  '2_High':    ['Dynamic stretching 2 mins', 'High knees 30s', 'Lateral bounds 10 reps', 'Wrist rotations 30s', 'Short sprints 3×20m'],
  '3_High':    ['Full body dynamic stretch 3 mins', 'High knees 45s', 'Agility cone drill', 'Arm & shoulder rotations', 'Bat swing warm-up 50 reps'],
  '4_Maximum': ['Explosive jumps 10 reps', 'Sprint 4×30m', 'Full rotational stretch', 'Reaction drill 2 mins', 'Match-intensity shadow batting 60 reps'],
};

app.get('/api/warmup', (req, res) => {
  const { phase, intensity } = req.query;
  const key = `${phase}_${intensity}`;
  const warmup = WARMUPS[key] || WARMUPS['1_Medium'];
  res.json({ warmup, phase, intensity });
});

// ── Match scenario (AI) ───────────────────────────────────────────────────────
app.post('/api/match-scenario', async (req, res) => {
  try {
    const { profile } = req.body;
    const role = profile?.role || 'Batsman';
    const { default: OpenAI } = await import('openai');
    const openai = new (require('openai'))({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a cricket match scenario generator. Always respond with valid JSON only, no markdown.',
        },
        {
          role: 'user',
          content: `Generate a tense cricket match scenario for a ${role}. Return JSON:
{
  "scenario": "2-sentence dramatic description of the match situation",
  "options": ["option A (1 sentence)", "option B (1 sentence)", "option C (1 sentence)"],
  "correctIndex": 0,
  "explanation": "Why the correct option is right (1-2 sentences)"
}`,
        },
      ],
      max_tokens: 400,
      temperature: 0.9,
    });
    const text = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    res.json(parsed);
  } catch (error) {
    console.error('[MatchSim] Error:', error.message);
    // Fallback static scenario
    res.json({
      scenario: 'Your team needs 15 runs off the last over. You are batting on 43, facing a pace bowler who has taken 3 wickets.',
      options: [
        'Play safe, rotate strike and trust your partner',
        'Go for big shots from ball 1, attack every delivery',
        'Play smart — take 2s and 3s, target the wide ones for boundaries',
      ],
      correctIndex: 2,
      explanation: 'Smart rotation with selective hitting is the optimal T20 strategy here — keeps wickets intact while maintaining a run rate above 2.5/ball.',
    });
  }
});

// ── Match evaluate ────────────────────────────────────────────────────────────
app.post('/api/match-evaluate', async (req, res) => {
  try {
    const { scenario, userChoice, correctIndex } = req.body;
    const correct = userChoice === correctIndex;
    res.json({
      correct,
      feedback: correct
        ? "Excellent call! That's exactly what a seasoned pro would do. Great cricket IQ. 🏏"
        : `Good thinking, but here's what the pros do: ${scenario?.explanation || 'analyse the field before committing to a shot.'}`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Evaluate failed.' });
  }
});

// ── Admin dashboard ───────────────────────────────────────────────────────────
app.get('/info', async (req, res) => {
  try {
    const [
      { data: authData, error: authError },
      { data: profiles },
      { data: plans },
      { data: progressRows },
    ] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from('user_profiles').select('*'),
      supabaseAdmin.from('training_plans').select('user_id, generated_at'),
      supabaseAdmin.from('progress').select('user_id, completed'),
    ]);

    if (authError) throw authError;
    const users       = authData?.users ?? [];
    const profileMap  = Object.fromEntries((profiles  ?? []).map(p => [p.user_id, p]));
    const planMap     = Object.fromEntries((plans     ?? []).map(p => [p.user_id, p]));
    const progressMap = {};
    (progressRows ?? []).forEach(r => {
      if (!progressMap[r.user_id]) progressMap[r.user_id] = 0;
      if (r.completed) progressMap[r.user_id]++;
    });

    const totalUsers    = users.length;
    const totalWithPlan = Object.keys(planMap).length;
    const totalDays     = Object.values(progressMap).reduce((a, b) => a + b, 0);

    const rows = users.map(u => {
      const profile  = profileMap[u.id] || {};
      const hasPlan  = !!planMap[u.id];
      const daysComp = progressMap[u.id] || 0;
      const joined   = new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const pct      = Math.round((daysComp / 100) * 100);
      const initial  = (profile.name || u.email || '?')[0].toUpperCase();
      return `<tr><td><div class="user-cell"><div class="avatar">${initial}</div><div><div class="user-name">${profile.name || '—'}</div><div class="user-email">${u.email || u.id.slice(0, 14) + '…'}</div></div></div></td><td><span class="badge badge-role">${profile.role || '—'}</span></td><td><span class="badge badge-level">${profile.level || '—'}</span></td><td><span class="badge badge-fitness">${profile.fitness || '—'}</span></td><td><span class="badge ${hasPlan ? 'badge-yes' : 'badge-no'}">${hasPlan ? '✅ Generated' : '⏳ Pending'}</span></td><td><div class="progress-cell"><div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div><span class="progress-label">${daysComp}/100</span></div></td><td class="joined">${joined}</td></tr>`;
    }).join('');

    res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>CricAI · Admin</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;900&display=swap" rel="stylesheet"/><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',sans-serif;background:#050810;color:#e2e8f0;min-height:100vh}.header{background:linear-gradient(135deg,#0A0E1A,#0D1829);border-bottom:1px solid #1E2D45;padding:20px 32px;display:flex;align-items:center;gap:16px}.logo{font-family:'Outfit',sans-serif;font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px}.logo span{color:#00C851}.admin-tag{background:#00C85120;border:1px solid #00C85140;color:#00C851;font-size:11px;font-weight:600;letter-spacing:2px;padding:4px 10px;border-radius:20px}.header-right{margin-left:auto;font-size:12px;color:#4A5568}.model-chip{background:#3B82F620;border:1px solid #3B82F640;color:#60A5FA;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px}.stats{display:flex;gap:16px;padding:24px 32px}.stat-card{flex:1;background:#0D1526;border:1px solid #1E2D45;border-radius:16px;padding:20px 24px}.stat-val{font-family:'Outfit',sans-serif;font-size:36px;font-weight:900;color:#fff;line-height:1}.stat-label{font-size:12px;color:#4A5568;margin-top:6px;font-weight:500;letter-spacing:.5px;text-transform:uppercase}.stat-card.green .stat-val{color:#00C851}.stat-card.blue .stat-val{color:#3B82F6}.table-wrap{margin:0 32px 32px;background:#0D1526;border:1px solid #1E2D45;border-radius:16px;overflow:hidden}.table-header{padding:16px 24px;border-bottom:1px solid #1E2D45;display:flex;align-items:center;justify-content:space-between}.table-title{font-family:'Outfit',sans-serif;font-weight:700;font-size:16px;color:#fff}.refresh-btn{background:#00C85115;border:1px solid #00C85140;color:#00C851;padding:6px 14px;border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit;font-weight:600}table{width:100%;border-collapse:collapse}th{padding:12px 20px;text-align:left;font-size:11px;font-weight:600;color:#4A5568;letter-spacing:.5px;text-transform:uppercase;border-bottom:1px solid #1E2D45;background:#080D1A}td{padding:14px 20px;border-bottom:1px solid #0F1A2E;vertical-align:middle}tr:last-child td{border-bottom:none}tr:hover td{background:#0A1220}.user-cell{display:flex;align-items:center;gap:12px}.avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#00C851,#00A041);display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;font-weight:700;font-size:14px;color:#fff;flex-shrink:0}.user-name{font-weight:600;font-size:14px;color:#e2e8f0}.user-email{font-size:12px;color:#4A5568;margin-top:2px}.badge{font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;white-space:nowrap}.badge-role{background:#3B82F620;color:#60A5FA;border:1px solid #3B82F640}.badge-level{background:#8B5CF620;color:#A78BFA;border:1px solid #8B5CF640}.badge-fitness{background:#F59E0B20;color:#FCD34D;border:1px solid #F59E0B40}.badge-yes{background:#00C85120;color:#00C851;border:1px solid #00C85140}.badge-no{background:#1E2D45;color:#4A5568;border:1px solid #243050}.progress-cell{display:flex;align-items:center;gap:10px}.progress-bar-wrap{width:80px;height:6px;background:#1E2D45;border-radius:3px;overflow:hidden}.progress-bar-fill{height:100%;background:linear-gradient(90deg,#00C851,#00A041);border-radius:3px}.progress-label{font-size:12px;color:#6B7FA3;font-weight:500}.joined{font-size:12px;color:#4A5568}</style></head><body><div class="header"><div class="logo">Cric<span>AI</span></div><span class="admin-tag">ADMIN</span><span class="model-chip">⚡ ${MODEL}</span><div class="header-right">Updated: ${new Date().toLocaleString('en-IN')}</div></div><div class="stats"><div class="stat-card"><div class="stat-val">${totalUsers}</div><div class="stat-label">Total Users</div></div><div class="stat-card green"><div class="stat-val">${totalWithPlan}</div><div class="stat-label">Plans Generated</div></div><div class="stat-card blue"><div class="stat-val">${totalDays}</div><div class="stat-label">Days Completed</div></div><div class="stat-card"><div class="stat-val">${totalUsers > 0 ? Math.round((totalWithPlan / totalUsers) * 100) : 0}%</div><div class="stat-label">Activation Rate</div></div></div><div class="table-wrap"><div class="table-header"><span class="table-title">🏏 Users</span><button class="refresh-btn" onclick="location.reload()">↻ Refresh</button></div><table><thead><tr><th>User</th><th>Role</th><th>Level</th><th>Fitness</th><th>Plan</th><th>Progress</th><th>Joined</th></tr></thead><tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:48px;color:#4A5568">No users yet</td></tr>'}</tbody></table></div></body></html>`);
  } catch (err) {
    res.status(500).send(`<pre style="background:#111;color:#f87171;padding:24px;font-family:monospace">Error: ${err.message}\n\nFix: Add SUPABASE_SERVICE_ROLE_KEY to backend/.env\nGet it from: Supabase Dashboard → Project Settings → API → service_role</pre>`);
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏏 CricAI Backend  —  port ${PORT}`);
  console.log(`⚡ AI Model:        ${MODEL}`);
  console.log(`📊 Admin:          http://localhost:${PORT}/info`);
  console.log(`✅ Health:         http://localhost:${PORT}/api/health\n`);
});
