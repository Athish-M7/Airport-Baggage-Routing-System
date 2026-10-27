@echo off
title Vaanam Airport System - Shutdown
color 0c

echo ==============================================================================
echo    VAANAM AIRPORT SYSTEM - SHUTTING DOWN SERVERS (PORTS 8080 & 5173)
echo ==============================================================================
echo.

echo Stopping backend process on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping frontend process on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All airport servers have been cleanly stopped.
echo ==============================================================================
echo.
pause
