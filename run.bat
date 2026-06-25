@echo off
echo ===================================================
echo SVR Construction - Setup and Start Script
echo ===================================================
echo.

:: 1. Build Client
echo [1/3] Navigating to client and installing/building...
cd client
call npm install
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend build failed! Please check client errors.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

:: 2. Start Server
echo.
echo [2/3] Cleaning and installing server dependencies...
cd server
if exist node_modules (
    echo [INFO] Removing existing node_modules to resolve package corruption...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del /f /q package-lock.json
)
call npm install

echo.
echo [3/3] Launching server on http://localhost:5000...
echo.
call npm start
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to start backend server.
    pause
    exit /b %ERRORLEVEL%
)
cd ..
pause
