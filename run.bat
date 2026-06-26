@echo off
echo ===================================================
echo SVR Construction - Setup and Start Script
echo ===================================================
echo.

:: 1. Build Admin
echo [1/4] Navigating to admin and installing/building...
cd admin
call npm install
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Admin build failed! Please check admin errors.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

:: 2. Build Frontend
echo [2/4] Navigating to frontend and installing/building...
cd frontend
call npm install
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend build failed! Please check frontend errors.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

:: 3. Start Backend
echo.
echo [3/4] Cleaning and installing backend dependencies...
cd backend
if exist node_modules (
    echo [INFO] Removing existing node_modules to resolve package corruption...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del /f /q package-lock.json
)
call npm install

echo.
echo [4/4] Launching server on http://localhost:5000...
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
