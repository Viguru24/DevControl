@echo off
TITLE DevControl: Zero-Touch Shutdown
echo Cleaning up all Zero-Touch processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1
taskkill /F /IM cscript.exe /F >nul 2>&1
echo.
echo Ghost Finger has been retired.
echo.
timeout /t 3
