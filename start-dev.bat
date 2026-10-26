@echo off
echo ===================================================
echo     Starting AgriFlow AI (Backend + Frontend)
echo ===================================================
echo.

echo [1/2] Launching Backend on Port 5000...
start "AgriFlow Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"

echo [2/2] Launching Frontend on Port 5173...
start "AgriFlow Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
