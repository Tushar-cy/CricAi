# 🔮 CricAI — Future Roadmap

> This file tracks planned features, improvements, and ideas for CricAI's future development.  
> Last updated: February 2026

---

## 🚦 Status Legend

| Badge | Meaning |
|-------|---------|
| 🔴 Not Started | Idea captured, work not begun |
| 🟡 In Progress | Currently being worked on |
| 🟢 Done | Shipped and live |
| 💡 Idea | Concept stage, needs validation |

---

## 🏗️ Phase 1 — Foundation (Current)

| Feature | Status | Notes |
|---------|--------|-------|
| AI-generated 100-day plan | 🟢 Done | OpenAI GPT integration |
| 5-step onboarding | 🟢 Done | Age, role, level, fitness, availability |
| Dashboard with streak | 🟢 Done | Day tracking |
| Plan viewer (100 days) | 🟢 Done | 4 phases |
| Day detail view | 🟢 Done | Skill + fitness breakdown |
| Progress tab with charts | 🟢 Done | Weekly chart + badges |
| Android support via Expo Go | 🟢 Done | Scan QR to run |

---

## 🚀 Phase 2 — Improvements (Next Up)

### 🤖 AI & Backend

- [ ] **Switch to local AI (Ollama)** — Run completely offline using [Ollama](https://ollama.com) with `llama3` or `mistral` model. No API key needed, free, private.
  - Install: `ollama pull llama3`
  - Update `backend/services/openai.js` to point to `http://localhost:11434`
  
- [ ] **Smarter prompts** — Include injury history, preferred training time (morning/evening), and equipment availability in the AI prompt

- [ ] **Multi-language support** — Generate plans in Hindi, Tamil, Bengali for regional players

- [ ] **Plan regeneration logic** — If a player misses 3+ days, auto-suggest a revised plan

### 📱 Mobile App

- [ ] **Push notifications** — Daily reminders to complete training ("Don't break your streak! 🏏")

- [ ] **Offline mode** — Cache the plan locally so it works without internet

- [ ] **Dark / Light theme toggle** — Let users pick their preferred theme

- [ ] **Video tutorials** — Embed YouTube links for each drill (batting grip, bowling action, etc.)

- [ ] **Workout timer** — Built-in timer for drills like "10-minute shadow batting"

- [ ] **Share progress** — Share streak card or achievement badges on WhatsApp/Instagram

### 🗄️ Data & Storage

- [ ] **Persistent storage** — Use SQLite or AsyncStorage so plan survives app restarts

- [ ] **Cloud sync** — Save plan to Firebase so players can switch devices

- [ ] **Progress history** — Track improvement week-over-week with graphs

---

## 🌟 Phase 3 — Big Features

### 👥 Social & Community

- [ ] **Player profiles** — Public profiles showing stats and achievements

- [ ] **Leaderboard** — Compete with friends on streaks and completed days

- [ ] **Coach mode** — Coaches can create and assign plans to multiple players

- [ ] **Team management** — Create a team, invite players, view everyone's progress

### 📊 Analytics

- [ ] **Performance insights** — AI analysis of your training consistency patterns

- [ ] **Injury risk score** — Warn players when training load is too high

- [ ] **Skill radar chart** — Visual breakdown of batting, bowling, fielding, fitness

### 🏟️ Match Integration

- [ ] **Match logger** — Log real match scores and AI adjusts training focus

- [ ] **Post-match analysis** — Enter match performance, get targeted drill suggestions

- [ ] **Tournament prep mode** — Specialized 30-day plan before a tournament

---

## 📦 Phase 4 — Platform Expansion

- [ ] **iOS support** — Build and publish on Apple App Store

- [ ] **Standalone APK** — Package as a `.apk` for direct install (no Expo Go needed)

- [ ] **Web version** — Browser-accessible version at a custom domain

- [ ] **Wearable integration** — Sync with Mi Band / Fitbit for fitness tracking

- [ ] **AI video analysis** — Upload batting/bowling video and get AI feedback (computer vision)

---

## 🐛 Known Issues & Tech Debt

| Issue | Priority | Notes |
|-------|----------|-------|
| Plan lost on app restart | High | Add AsyncStorage persistence |
| No error boundary in React | Medium | App crashes on unexpected errors |
| Hardcoded PC IP in `constants/api.js` | Medium | Should auto-discover or use env var |
| No loading state for slow networks | Low | Add skeleton loaders |
| `.env` not documented clearly enough | Low | Done in README now |

---

## 💡 Wild Ideas

> These are experimental concepts — not committed, just brainstormed

- 🎮 **Gamification** — XP system, levels, cricket player "classes" (pace bowler, spin wizard, etc.)
- 🤝 **Mentorship matching** — AI matches young players with volunteer coaches nearby
- 🌐 **NGO partnerships** — Free tier for cricket academies in rural India
- 📻 **Voice assistant** — "Hey CricAI, what's my training today?"
- 🏅 **NFT badges** — Mint achievement badges as NFTs (optional, Web3 feature)

---

## 🤝 How to Contribute

1. Fork the repo
2. Pick a task from this roadmap
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Commit your changes
5. Open a Pull Request with a clear description

---

## 📬 Contact

For suggestions or collaboration, open a GitHub Issue on the [CricAI repo](https://github.com/Tushar-cy/CricAi).
