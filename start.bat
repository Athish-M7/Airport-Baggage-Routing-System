@echo off
title Vaanam Airport Baggage Routing System - Launcher
color 0b

echo ==============================================================================
echo    VAANAM INTERNATIONAL AIRPORT - BAGGAGE ROUTING & LOGISTICS SYSTEM
echo                      One-Click Automated Launcher
echo ==============================================================================
echo.

:: 1. Check for Java
where java >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not installed or not in your PATH!
    echo Please install Java 21 JDK from https://adoptium.net/
    pause
    exit /b 1
)

:: 2. Check for Node.js
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not in your PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Checking frontend dependencies...
if not exist "frontend\node_modules\" (
    echo Installing npm dependencies, please wait...
    cd frontend
    call npm install
    cd ..
) else (
    echo Frontend dependencies are already installed.
)

echo.
echo [2/3] Starting Spring Boot Backend (Java 21 / H2 Database) on port 8080...
start "Vaanam Backend (Spring Boot :8080)" cmd /k "cd backend && .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2"

echo.
echo [3/3] Starting React Vite Frontend on port 5173...
start "Vaanam Frontend (Vite :5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting 6 seconds for services to initialize...
timeout /t 6 /nobreak >nul

echo.
echo Opening Airport Operations Terminal in your default browser...
start http://localhost:5173

echo.
echo ==============================================================================
echo  SYSTEM IS LIVE!
echo  - Operations Terminal:  http://localhost:5173
echo  - Staff Login:          http://localhost:5173/login
echo  - Passenger QR Tracker: http://localhost:5173/track?id=BAG-1001
echo  - Database Console:     http://localhost:8080/h2-console
echo.
echo  To cleanly stop all servers, double-click 'stop.bat'.
echo ==============================================================================
echo.
pause
