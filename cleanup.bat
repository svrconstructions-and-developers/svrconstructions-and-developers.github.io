@echo off
echo ===================================================
echo SVR Construction - Cleanup Script
echo ===================================================
echo.
echo This script will safely remove the obsolete 'client' and 'server' directories,
echo as all files have been migrated to 'frontend', 'admin', and 'backend'.
echo.
set /p confirm="Are you sure you want to delete 'client' and 'server' directories? (Y/N): "
if /i "%confirm%"=="Y" (
    echo.
    if exist client (
        echo Removing old 'client' directory...
        rmdir /s /q client
    )
    if exist server (
        echo Removing old 'server' directory...
        rmdir /s /q server
    )
    echo.
    echo Cleanup complete!
) else (
    echo.
    echo Cleanup cancelled.
)
pause
