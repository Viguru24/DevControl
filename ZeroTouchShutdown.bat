@echo off
TITLE DevControl: Zero-Touch Shutdown
echo [1/1] Releasing the Ghost Finger...
taskkill /F /IM cscript.exe /F >nul 2>&1
rem We don't kill electron.exe here to avoid closing other instances.
rem The user can close the HUD window manually if it stays open.
echo.
echo Ghost Finger has been retired.
echo.
timeout /t 3
