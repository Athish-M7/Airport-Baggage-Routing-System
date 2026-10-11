@echo off
title Vaanam Airport - Stop All Services
echo Stopping Vaanam Airport services...

echo Freeing port 8080 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul

echo Freeing port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul

echo All services stopped cleanly.
pause
