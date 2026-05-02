# CricAI — Deployment Guide

## 1. Backend Deployment (Render)
Render is the easiest free/low-cost host for Node.js.

1. Go to [Render.com](https://render.com) and sign in via GitHub.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set the Root Directory to `backend` (or leave blank if it's the root of your repo).
5. Ensure settings match:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
6. Add the following **Environment Variables**:
   - `OPENAI_API_KEY`: your key starting with `sk-proj...`
   - `GPT_MODEL`: `gpt-4o-mini`
   - `SUPABASE_URL`: `https://xfnesscwmqfromyygvim.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `sb_publishable_IdJRiPVC7VvoSaWkn6nRgg_9OSJaP7W` *(Note: using publishable key temporarily, you should swap to the actual Service Role key for production security!)*
7. Click **Create Web Service**. Wait 2-3 minutes for the build to finish.
8. Copy the provided Render URL (e.g., `https://cricai-backend.onrender.com`).

---

## 2. Frontend Connection
Once the backend is deployed, you must tell the app to talk to Render instead of your local PC.

1. Create a file named `frontend/.env.production` (or add to EAS Secrets) and add:
   ```
   EXPO_PUBLIC_API_BASE=https://your-render-url.onrender.com
   EXPO_PUBLIC_SUPABASE_URL=https://xfnesscwmqfromyygvim.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_IdJRiPVC7VvoSaWkn6nRgg_9OSJaP7W
   ```
   *(Note: The `__DEV__` switch in `api.js` automatically uses `EXPO_PUBLIC_API_BASE` for production builds).*

---

## 3. Frontend Deployment (EAS / APK Build)
To build the `.apk` file for your physical Android device.

1. Open terminal inside the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Login to Expo (if not already):
   ```bash
   npx expo login
   ```
3. Run the Android build command:
   ```bash
   npx eas build -p android --profile preview
   ```
4. Wait ~10 minutes. EAS will provide a link to download the `.apk` file directly. Download it on your phone and install!

---

## Quick Checklist Before Building:
- [ ] Backend is running on Render and `/api/health` returns OK.
- [ ] `EXPO_PUBLIC_API_BASE` points to your Render URL.
- [ ] No local `10.101.203.17` hardcoded in `api.js` for production.
- [ ] Supabase has the latest SQL schema from Prompt 8 applied.
