@echo off
set "TARGET_DIR=%~1"

echo [Launcher] Target: "%TARGET_DIR%"

:: 1. Try common installation path (Root EXE)
if exist "%LOCALAPPDATA%\Programs\Antigravity\Antigravity.exe" (
    echo [Launcher] Found Antigravity.exe in root
    start "" "%LOCALAPPDATA%\Programs\Antigravity\Antigravity.exe" "%TARGET_DIR%"
    exit /b 0
)

:: 2. Try bin path (found via 'where' earlier)
if exist "%LOCALAPPDATA%\Programs\Antigravity\bin\antigravity.cmd" (
    echo [Launcher] Found antgravity.cmd in bin
    call "%LOCALAPPDATA%\Programs\Antigravity\bin\antigravity.cmd" "%TARGET_DIR%"
    exit /b 0
)

:: 3. Try global PATH
echo [Launcher] Trying global PATH...
where Antigravity >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [Launcher] Found in PATH
    Antigravity "%TARGET_DIR%"
    exit /b 0
)

echo [Launcher] Error: Antigravity not found.
exit /b 1
