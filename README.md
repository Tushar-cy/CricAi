# CricAI 🏏

> AI-powered 100-day cricket training system for grassroots players. Runs on Android via Expo Go.

---

## 📁 Project Structure

```
CricAI/
├── backend/           ← Node.js + Express + Gemini API
│   ├── server.js
│   ├── services/gemini.js
│   ├── package.json
│   └── .env           ← Add your Gemini API key here
│
└── frontend/          ← React Native + Expo Router
    ├── app/
    │   ├── _layout.jsx         (root layout)
    │   ├── index.jsx           (landing)
    │   ├── onboard.jsx         (5-step setup)
    │   ├── generating.jsx      (AI loading)
    │   ├── (tabs)/
    │   │   ├── dashboard.jsx   (home)
    │   │   ├── plan.jsx        (100-day plan)
    │   │   ├── progress.jsx    (charts & badges)
    │   │   └── settings.jsx    (profile)
    │   └── day/[id].jsx        (day detail)
    ├── constants/
    │   ├── api.js              ← ⚠️ Update your PC IP here
    │   └── theme.js
    ├── context/PlanContext.jsx
    └── package.json
```

---

## 🚀 Setup (Step by Step)

### Prerequisites
- [Node.js](https://nodejs.org) (v18+) — install if not present
- [Expo Go](https://expo.dev/go) installed on your Android phone
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free)

---

### Step 1: Get your Gemini API Key
1. Go to [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Open `backend/.env` and replace `your_gemini_api_key_here` with your key

### Step 2: Find your PC's Local IP
Open PowerShell and run:
```powershell
ipconfig
```
Look for **IPv4 Address** under your active WiFi adapter.  
Example: `192.168.1.5`

### Step 3: Update the API URL
Open `frontend/constants/api.js` and update:
```js
export const API_BASE = 'http://YOUR_IP_HERE:3001';
// Example: 'http://192.168.1.5:3001'
```

### Step 4: Start the Backend
```powershell
cd CricAI\backend
npm install
node server.js
```
✅ You should see: `CricAI Backend running on port 3001`

### Step 5: Start the Frontend
Open a **new** PowerShell window:
```powershell
cd CricAI\frontend
npm install
npx expo start
```
A QR code will appear in the terminal.

### Step 6: Open on Android
1. Make sure phone and PC are on the **same WiFi**
2. Open **Expo Go** app on your Android phone
3. Scan the QR code

---

## 🎯 Demo Flow

1. **Landing** → Tap "Start Your 100-Day Journey"
2. **Onboarding** → Fill 5 steps (name, age, role, level, fitness)
3. **Generating** → Watch animated AI loading screen (takes ~15-30 seconds)
4. **Dashboard** → See streak, phase, today's task
5. **Plan tab** → Browse all 100 days across 4 phases
6. **Tap any day** → See full skill + fitness breakdown
7. **Mark Complete** → Feel haptic feedback, streak increments
8. **Progress tab** → See weekly chart + badges
9. **Profile tab** → View stats, regenerate plan

---

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| "Network request failed" | Wrong IP in `constants/api.js` — check with `ipconfig` |
| "Backend not running" | Run `node server.js` in `backend/` folder |
| "API key error" | Check `.env` file has correct Gemini key |
| Expo QR not scanning | Make sure phone and PC on same WiFi network |
| App crashes on boot | Run `npx expo start --clear` to clear cache |
