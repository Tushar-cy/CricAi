// ─────────────────────────────────────────────────────────────────────────────
// 🔧 SETUP: Change DEV_IP to your computer's local IPv4 address
//    Windows:   run `ipconfig`  → "IPv4 Address"
//    Mac/Linux: run `ifconfig`  → "inet" under en0/wlan0
//
//    For EAS/production builds: set EXPO_PUBLIC_API_BASE in your .env or EAS Secrets
// ─────────────────────────────────────────────────────────────────────────────

const DEV_IP = '10.101.203.17'; // ← CHANGE THIS to your PC's local IP

export const API_BASE =
    process.env.EXPO_PUBLIC_API_BASE           // EAS / production env var
    || (__DEV__
        ? `http://${DEV_IP}:3001`              // local dev on physical device
        : 'https://your-backend.onrender.com');// ← CHANGE for production deploy

export const ENDPOINTS = {
    health:        `${API_BASE}/api/health`,
    generatePlan:  `${API_BASE}/api/generate-plan`,
    coachChat:     `${API_BASE}/api/coach-chat`,
    dayTip:        `${API_BASE}/api/day-tip`,
    warmup:        `${API_BASE}/api/warmup`,
    matchScenario: `${API_BASE}/api/match-scenario`,
    matchEvaluate: `${API_BASE}/api/match-evaluate`,
};
