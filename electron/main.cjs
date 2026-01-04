const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

// Explicitly set the app name for taskbar/menus
app.name = 'DevControl';

let mainWindow;
let zeroTouchWindow;
let serverProcess;

// Zero-Touch State (Port-less)
let autoModeEnabled = false;
let autopilotSessionActive = false;
let pulseTimer = null;
let isPulseInProgress = false;

const SERVER_PORT = 42424;

// Function to start the pulse (Ghost Finger)
function startPulseLoop() {
    if (pulseTimer) clearTimeout(pulseTimer);

    const scriptPath = path.join(__dirname, '../scripts/ghost_finger.ps1');
    const flagPath = path.join(__dirname, '../scripts/AUTOPILOT_ACTIVE.tmp');

    const runPulse = () => {
        // Only proceed if enabled and not already pulsing
        if (autoModeEnabled && autopilotSessionActive && !isPulseInProgress) {
            isPulseInProgress = true;

            // Ensure safety flag exists
            if (!fs.existsSync(flagPath)) fs.writeFileSync(flagPath, 'ACTIVE');

            // Use Focus-Aware PowerShell Ghost Finger
            exec(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, (error, stdout, stderr) => {
                if (stdout && stdout.includes('Pulsed')) {
                    console.log(`[GhostFinger] ${stdout.trim()}`);
                }

                isPulseInProgress = false;
                // Schedule next pulse only after this one completes
                pulseTimer = setTimeout(runPulse, 2000);
            });
        } else {
            // Check again in 1.5s if we were idle
            pulseTimer = setTimeout(runPulse, 1500);
        }
    };
    runPulse();
}

// IPC Handlers for Port-less Operation
ipcMain.handle('get-auto-mode', () => {
    return {
        enabled: autoModeEnabled && autopilotSessionActive,
        globalEnabled: autoModeEnabled,
        sessionActive: autopilotSessionActive
    };
});

ipcMain.handle('toggle-auto-mode', (event, enabled) => {
    console.log(`[IPC] Received toggle-auto-mode: ${enabled}`);
    autoModeEnabled = enabled;
    autopilotSessionActive = enabled; // In widget mode, we sync these

    const flagPath = path.join(__dirname, '../scripts/AUTOPILOT_ACTIVE.tmp');
    if (enabled) {
        if (!fs.existsSync(flagPath)) fs.writeFileSync(flagPath, 'ACTIVE');
        console.log(`[IPC] Pulse loop ENABLED`);
    } else {
        if (fs.existsSync(flagPath)) fs.unlinkSync(flagPath);
        console.log(`[IPC] Pulse loop DISABLED`);
    }

    return { success: true, enabled: autoModeEnabled };
});

ipcMain.handle('sync-instructions', (event, inputInstructions) => {
    let instructions = inputInstructions;
    const projectId = 2; // Default to DevControl for now

    if (instructions === "LATEST_FROM_HISTORY") {
        try {
            const historyPath = path.join(__dirname, `../server/manager_history_${projectId}.json`);
            if (fs.existsSync(historyPath)) {
                const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
                const lastAssistantMsg = [...history].reverse().find(m => m.role === 'assistant');
                if (lastAssistantMsg) {
                    instructions = lastAssistantMsg.content;
                }
            }
        } catch (e) {
            console.error("Failed to read history for sync:", e);
        }
    }

    if (!instructions || instructions === "LATEST_FROM_HISTORY") {
        return { success: false, error: 'No instructions found to sync' };
    }

    try {
        const projectsPath = path.join(__dirname, '../server/projects.json');
        if (!fs.existsSync(projectsPath)) return { success: false, error: 'No projects found' };

        const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
        let successCount = 0;

        projectsData.forEach(project => {
            if (project.path && fs.existsSync(project.path)) {
                const instructionFile = path.join(project.path, '.antigravity-instructions.md');
                const content = `### MANAGER INSTRUCTIONS [${new Date().toLocaleString()}]\n\n${instructions}\n\n--- \n*Sent via DevControl IPC Bridge*`;
                fs.writeFileSync(instructionFile, content);
                successCount++;
            }
        });
        return { success: true, synced: successCount };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// Function to start the Express server (only for full dashboard)
function startServer() {
    const serverPath = path.join(__dirname, '../server/index.js');
    console.log('Starting server from:', serverPath);

    serverProcess = spawn('node', [serverPath], {
        stdio: 'inherit',
        env: { ...process.env, PORT: SERVER_PORT, NODE_ENV: 'production' }
    });

    serverProcess.on('error', (err) => {
        console.error('Failed to start server:', err);
    });
}

function createZeroTouchWindow() {
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    zeroTouchWindow = new BrowserWindow({
        width: 100,
        height: 100,
        x: width - 120,
        y: height - 120,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: true,
        focusable: true,
        type: 'panel',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });

    const isDev = !app.isPackaged;
    const isWidgetOnly = process.argv.includes('--widget-only');

    // Force local file for the HUD to avoid port conflicts unless explicitly in dev mode
    // and even then, we prefer the build if it exists.
    if (isWidgetOnly && fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
        zeroTouchWindow.loadFile(path.join(__dirname, '../dist/index.html'), { query: { mode: 'zero-touch' } });
    } else if (isDev) {
        // In dev, we still need the dev server for the React UI if no build is found
        zeroTouchWindow.loadURL('http://localhost:7777?mode=zero-touch');
    } else {
        zeroTouchWindow.loadFile(path.join(__dirname, '../dist/index.html'), { query: { mode: 'zero-touch' } });
    }

    zeroTouchWindow.on('closed', () => {
        zeroTouchWindow = null;
    });

    zeroTouchWindow.once('ready-to-show', () => {
        zeroTouchWindow.show();
        zeroTouchWindow.setAlwaysOnTop(true, 'screen-saver');
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        backgroundColor: '#030305',
        icon: path.join(__dirname, '../build/icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        },
        show: false
    });

    const isDev = !app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:7777');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        } else {
            createWindow();
        }
    });

    app.whenReady().then(async () => {
        const isDev = !app.isPackaged;
        const isWidgetOnly = process.argv.includes('--widget-only');

        // Start pulse loop (Integrated)
        startPulseLoop();

        if (!isWidgetOnly) {
            // Only start the Express server if we are running the full dashboard
            startServer();
            createWindow();
        }

        createZeroTouchWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                if (!isWidgetOnly) createWindow();
                createZeroTouchWindow();
            }
        });
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && !zeroTouchWindow && !mainWindow) {
        app.quit();
    }
});

app.on('will-quit', () => {
    if (serverProcess) serverProcess.kill();
    if (pulseTimer) clearTimeout(pulseTimer);
});
