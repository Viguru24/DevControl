@echo off
TITLE DevControl: Zero-Touch Launcher
echo [1/3] Cleaning up old sessions...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1
taskkill /F /IM cscript.exe /F >nul 2>&1

echo [2/3] Warming up the Ghost Finger...
START /B npm run electron:dev >nul 2>&1

echo [3/3] Zero-Touch HUD Is Loading!
echo.
echo The orb will appear in the bottom-right corner shortly.
echo You can close this window at any time.
echo.
pause
