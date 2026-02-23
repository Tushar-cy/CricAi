# 🏏 CricAI

> **AI-powered 100-day cricket training system for grassroots players.**  
> Built with React Native (Expo) + Node.js + OpenAI. Runs on Android via Expo Go.

---

## � Table of Contents

- [What is CricAI?](#-what-is-cricai)
- [Tech Stack](#-tech-stack)
- [Requirements](#-requirements)
- [Project Structure](#-project-structure)
- [Setup Guide](#-setup-guide)
- [Running the App](#-running-the-app)
- [Demo Flow](#-demo-flow)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)

---

## 🤔 What is CricAI?

CricAI generates a **personalized 100-day cricket training plan** using AI. Players fill in their profile (age, role, skill level, fitness, availability) and get a structured day-by-day training schedule tailored to them.

- 🤖 AI generates the full 100-day plan via OpenAI
- 📱 Mobile app built with React Native + Expo
- 🖥️ Backend runs locally on your PC/laptop
- 📡 Phone connects to your PC over WiFi (same network)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo Router |
| Backend | Node.js + Express.js |
| AI Model | OpenAI API (GPT) via `openai` npm package |
| Navigation | Expo Router (file-based) |
| State | React Context API |
| Styling | React Native StyleSheet |

---

## ✅ Requirements

Make sure you have **all of the following** installed before running CricAI:

### 💻 On Your Laptop / PC

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18 or higher | [nodejs.org](https://nodejs.org) |
| **npm** | Comes with Node.js | — |
| **Git** | Any recent version | [git-scm.com](https://git-scm.com) |
| **OpenAI API Key** | Free tier works | [platform.openai.com](https://platform.openai.com/api-keys) |

> ⚠️ **Ollama (optional):** If you want to run a **local AI model** instead of OpenAI (offline/free), install [Ollama](https://ollama.com) and pull a model like `llama3` or `mistral`. You'll need to update the backend service accordingly.

### 📱 On Your Android Phone

| Tool | Notes |
|------|-------|
| **Expo Go** app | Download from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| Same WiFi as your PC | Phone and PC **must** be on the same network |

### 🔌 Network

- Both your **PC and phone must be on the same WiFi network**
- Your PC's firewall must allow connections on port `3001`

---

## 📁 Project Structure

```
CricAI/
├── backend/                    ← Node.js API Server
│   ├── server.js               ← Express app, API routes
│   ├── services/
│   │   └── openai.js           ← OpenAI integration & prompt
│   ├── package.json
│   └── .env                    ← 🔑 Put your OpenAI API key here
│
├── frontend/                   ← React Native (Expo) App
│   ├── app/
│   │   ├── _layout.jsx         ← Root layout & navigation
│   │   ├── index.jsx           ← Landing / splash screen
│   │   ├── onboard.jsx         ← 5-step player profile setup
│   │   ├── generating.jsx      ← AI loading animation screen
│   │   ├── (tabs)/
│   │   │   ├── dashboard.jsx   ← Home: streak, today's task
│   │   │   ├── plan.jsx        ← Full 100-day plan view
│   │   │   ├── progress.jsx    ← Charts & achievement badges
│   │   │   └── settings.jsx    ← Player profile & stats
│   │   └── day/[id].jsx        ← Individual day detail view
│   ├── constants/
│   │   ├── api.js              ← ⚠️ Update your PC's IP here!
│   │   └── theme.js            ← Colors, fonts, design tokens
│   ├── context/
│   │   └── PlanContext.jsx     ← Global state for training plan
│   ├── assets/                 ← Images, icons
│   ├── app.json                ← Expo config
│   └── package.json
│
├── START-BACKEND.bat           ← One-click backend starter (Windows)
├── START-FRONTEND.bat          ← One-click frontend starter (Windows)
├── KILL-SERVERS.bat            ← Kills both servers
├── .gitignore
├── README.md                   ← You are here
└── FUTURE.md                   ← Roadmap & planned features
```

---

## 🚀 Setup Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/Tushar-cy/CricAi.git
cd CricAi
```

### Step 2: Get an OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Open `backend/.env` and add your key:

```env
OPENAI_API_KEY=sk-your-key-here
PORT=3001
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 5: Find Your PC's Local IP Address

Open PowerShell and run:
```powershell
ipconfig
```
Look for **IPv4 Address** under your active WiFi adapter.  
Example: `192.168.1.5`

### Step 6: Update the API URL in Frontend

Open `frontend/constants/api.js` and update with your IP:
```js
export const API_BASE = 'http://192.168.1.5:3001';
//                              ↑ Replace with your actual IP
```

### Step 7: Install Expo Go on Your Phone

Download **Expo Go** from the Google Play Store on your Android phone.

---

## ▶️ Running the App

### Option A — Use Batch Scripts (Easiest, Windows only)

Double-click these files from the `CricAI` folder:
1. `START-BACKEND.bat` → starts the Node.js API server
2. `START-FRONTEND.bat` → starts the Expo dev server + shows QR code

### Option B — Manual (Any OS)

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```
You should see: `🏏 CricAI Backend running on port 3001`

**Terminal 2 — Frontend:**
```bash
cd frontend
npx expo start
```
A QR code will appear.

**On your phone:**
1. Open **Expo Go**
2. Scan the QR code
3. The app will load on your phone 🎉

---

## 🎯 Demo Flow

1. **Landing Screen** → Tap *"Start Your 100-Day Journey"*
2. **Onboarding** → Fill 5 steps: name, age, cricket role, skill level, fitness
3. **Generating** → AI loading screen while OpenAI creates your plan (~15–30s)
4. **Dashboard** → See your streak, current phase, and today's task
5. **Plan Tab** → Browse all 100 days organized into 4 training phases
6. **Day Detail** → Tap any day to see skill + fitness breakdown
7. **Mark Complete** → Haptic feedback, streak increments
8. **Progress Tab** → Weekly chart + achievement badges
9. **Profile Tab** → View stats, regenerate plan anytime

---

## 🔐 Environment Variables

Create a `backend/.env` file with these values:

```env
# Required — your OpenAI API key
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional — defaults to 3001
PORT=3001
```

> ⚠️ **Never commit your `.env` file to Git!** It's already in `.gitignore`.

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| `"Network request failed"` | Wrong IP in `frontend/constants/api.js` — run `ipconfig` to find IP |
| `"Backend not running"` | Run `node server.js` inside `backend/` folder |
| `"OpenAI API key error"` | Check `.env` file has correct key and no extra spaces |
| Expo QR code not scanning | Ensure phone and PC are on the **same WiFi** |
| App crashes on load | Run `npx expo start --clear` to clear Expo cache |
| Port 3001 blocked | Allow port 3001 through Windows Firewall |
| `node_modules` missing | Run `npm install` inside both `backend/` and `frontend/` |
| Git not recognized | Restart terminal after installing Git |

---

## 👥 Authors

- **Ansh** — Backend & AI Integration
- **Tushar** — Frontend & Mobile App

---

## 📄 License

This project is for educational and personal use. See [FUTURE.md](./FUTURE.md) for planned improvements.
