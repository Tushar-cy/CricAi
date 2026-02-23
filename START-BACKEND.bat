@echo off
SET PATH=C:\Program Files\nodejs;%PATH%
echo.
echo ==========================================
echo    CricAI Backend Starting...
echo ==========================================
echo.
cd /d "%~dp0backend"
echo Installing packages...
npm install
echo.
echo Starting server on port 3001...
echo.
node server.js
pause
