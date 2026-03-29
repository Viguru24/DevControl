@echo off
TITLE DevControl: Zero-Touch Launcher
cd /d "%~dp0"

echo [1/3] Cleaning up old autopilot instances and temp files...
taskkill /F /IM cscript.exe /F >nul 2>&1
wmic process where "CommandLine like '%%ghost_finger.ps1%%'" call terminate >nul 2>&1
wmic process where "CommandLine like '%%ZeroTouchHUD.ps1%%'" call terminate >nul 2>&1
del /q "scripts\*.tmp" >nul 2>&1
del /q "*.tmp" >nul 2>&1
del /q "*.html" >nul 2>&1

echo [2/3] Launching Zero-Touch Globe (Force-On Mode)...
start /min "" npx electron . --widget-only --force-on

echo.
echo Launching Zero-Touch Interface.
timeout /t 3
exit
