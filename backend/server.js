require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generateCricketPlan } = require('./services/openai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CricAI Backend is running 🏏', timestamp: new Date().toISOString() });
});

// Generate training plan
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { age, role, level, availability, fitness, name } = req.body;

    if (!age || !role || !level || !availability || !fitness) {
      return res.status(400).json({
        error: 'Missing required fields: age, role, level, availability, fitness'
      });
    }

    console.log(`[CricAI] Generating plan for ${name || 'Player'} | ${role} | ${level}`);

    const plan = await generateCricketPlan({ age, role, level, availability, fitness, name });

    res.json({
      success: true,
      data: plan,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CricAI] Error generating plan:', error.message);
    res.status(500).json({
      error: 'Failed to generate training plan. Check Ollama API / AI model.',
      details: error.message
    });
  }
});

// Start server — bind to all interfaces so phone can connect over WiFi
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏏 CricAI Backend running on port ${PORT}`);
  console.log(`📱 Phone access: Use your PC's local IP:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health\n`);
});
