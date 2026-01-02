const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Explicitly set the app name for taskbar/menus
app.name = 'DevControl';

let mainWindow;
let zeroTouchWindow;
let serverProcess;
let autopilotProcess;

const SERVER_PORT = 42424;

// Function to start the autopilot daemon
function startAutopilot() {
    const autopilotPath = path.join(__dirname, '../scripts/autopilot_daemon.mjs');
    console.log('Starting autopilot daemon from:', autopilotPath);

    // Spawn the autopilot daemon as a child process
    autopilotProcess = spawn('node', [autopilotPath], {
        stdio: 'inherit',
        env: { ...process.env }
    });

    autopilotProcess.on('error', (err) => {
        console.error('Failed to start autopilot daemon:', err);
    });
}

// Function to start the Express server
function startServer() {
    const serverPath = path.join(__dirname, '../server/index.js');
    console.log('Starting server from:', serverPath);

    // Spawn the Express server as a child process
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
        type: 'panel', // Utility window to help stay divorced from main app focus
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });

    const isDev = !app.isPackaged;
    if (isDev) {
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

        if (!isDev) {
            startServer();
        }

        startAutopilot();

        try {
            // Give server/daemon time to warm up
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (err) { }

        if (!isWidgetOnly) {
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
    // DO NOT QUIT if either window is still open
    if (process.platform !== 'darwin' && !zeroTouchWindow && !mainWindow) {
        app.quit();
    }
});

app.on('will-quit', () => {
    if (serverProcess) serverProcess.kill();
    if (autopilotProcess) autopilotProcess.kill();
});
