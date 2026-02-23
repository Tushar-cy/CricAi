@echo off
echo ==========================================
echo    Stopping all Node.js processes...
echo ==========================================
echo.
taskkill /F /IM node.exe
echo.
echo Done. All server processes should be terminated.
pause
