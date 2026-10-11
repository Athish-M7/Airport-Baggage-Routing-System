@echo off
title Vaanam Airport Baggage Routing System - Launcher
echo =====================================================================
echo    Vaanam Airport Baggage Handling and Routing System
echo =====================================================================
echo.
echo [1/3] Starting Spring Boot 3 Backend on http://localhost:8080 ...
start "Vaanam Airport - Backend Server (Port 8080)" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2"

echo.
echo [2/3] Waiting 10 seconds for backend initialization...
timeout /t 10 /nobreak >nul

echo.
echo [3/3] Starting React + Vite Frontend on http://localhost:5173 ...
start "Vaanam Airport - Frontend Web UI (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo.
echo =====================================================================
echo  System is starting up!
echo  - Backend API:  http://localhost:8080
echo  - H2 Console:   http://localhost:8080/h2-console
echo  - Frontend Web: http://localhost:5173
echo =====================================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
pause
