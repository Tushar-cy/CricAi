@echo off
SET PATH=C:\Program Files\nodejs;%PATH%
echo.
echo ==========================================
echo    CricAI Frontend (Expo) Starting...
echo ==========================================
echo.
cd /d "%~dp0frontend"
echo Installing packages...
npm install
echo.
echo Starting Expo (scan QR with Expo Go on your phone)...
echo.
npx expo start --clear
pause
