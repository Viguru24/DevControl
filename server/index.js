import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

import { createMasterBackup, listMasterBackups, restoreMasterBackup } from './master_backup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECTS_FILE = path.join(__dirname, 'projects.json');

// Auto-mode state
const STATE_FILE = path.join(__dirname, '..', 'scripts', 'auto_mode_state.json');
let autoModeEnabled = false;
let autopilotSessionActive = false;
let sessionTimeout = null;

// Load persisted state
try {
    if (fs.existsSync(STATE_FILE)) {
        const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        autoModeEnabled = state.enabled || false;
        autopilotSessionActive = state.active || false;
    }
} catch (e) { }

const saveAutoState = () => {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify({
            enabled: autoModeEnabled,
            active: autopilotSessionActive
        }));
    } catch (e) { }
};

const defaultProjects = [
    {
        id: 1,
        title: "DevControl Dashboard",
        description: "Advanced clipboard manager with backup encryption and history tracking.",
        status: "Active",
        version: "1.2.2",
        tags: ["Electron", "React", "Utility", "Encryption"],
        path: "c:/Users/elois/OneDrive/Documents/GitHub/cosmos-clip",
        monitorUrl: "http://localhost:5678",
        loadCmd: "code c:/Users/elois/OneDrive/Documents/GitHub/cosmos-clip",
        departments: [
            {
                name: "Core Systems",
                description: "Essential process management and IPC bridging.",
                modules: [
                    { name: "Main Process", path: "electron/main.cjs", description: "App lifecycle, window creation, and native bridges." },
                    { name: "Preload Scripts", path: "electron/preload.cjs", description: "Secure IPC exposure to the renderer." }
                ]
            },
            {
                name: "Interface Division",
                description: "User-facing connection layers.",
                modules: [
                    { name: "Dashboard UI", path: "src/App.jsx", description: "Primary view and routing logic." },
                    { name: "Widget System", path: "src/styles/components/", description: "Floating 'Red Dot' widget implementation." }
                ]
            },
            {
                name: "Security & Backups",
                description: "Data persistence and protection protocols.",
                modules: [
                    { name: "Encryption Engine", path: "electron/main.cjs (decryptContent)", description: "AES-256 encryption for backup files." },
                    { name: "Restore Flow", path: "BACKUP_RESTORE_FIX.md", description: "Automated recovery with password prompts." }
                ]
            }
        ],
        docs: [],
        issues: [
            {
                id: "fix-001",
                problem: "Encryption Detection Bug",
                description: "Auto-backup files were encrypted but missing the isEncrypted flag, causing decryption failure.",
                solution: "Modified decryptContent() to check for IV/content fields."
            },
            {
                id: "fix-002",
                problem: "No Password Prompt",
                description: "Restore flow didn't prompt for password when encountering encrypted files.",
                solution: "Implemented automated password prompt modal flow."
            }
        ]
    },
    {
        id: 2,
        title: "DevControl",
        description: "Mission control dashboard for managing development projects with AI-powered optimization and real-time monitoring.",
        status: "Active",
        version: "0.0.0",
        tags: ["React", "Node.js", "Express", "AI", "Groq"],
        path: "c:/Users/elois/OneDrive/Documents/GitHub/DevControl",
        monitorUrl: "http://localhost:7777",
        departments: [
            {
                name: "Frontend Layer",
                description: "React-based user interface components.",
                modules: [
                    { name: "Main App", path: "src/App.jsx", description: "Primary dashboard with project cards and view switching." },
                    { name: "Project Detail", path: "src/components/ProjectDetail.jsx", description: "Detailed project view with AI Strategy tab." },
                    { name: "Command Center", path: "src/components/MonitorView.jsx", description: "Real-time project monitoring with metrics." },
                    { name: "Layout System", path: "src/components/Layout.jsx", description: "Header with auto-continue mode toggle." }
                ]
            },
            {
                name: "Backend API",
                description: "Express server with project management and AI integration.",
                modules: [
                    { name: "Server Core", path: "server/index.js", description: "REST API endpoints and project data management." },
                    { name: "Launch Handler", path: "server/index.js (/api/launch)", description: "VS Code project launcher." },
                    { name: "AI Optimizer", path: "server/index.js (/api/optimize)", description: "Groq AI integration for strategy generation." }
                ]
            },
            {
                name: "AI Integration",
                description: "Groq-powered project optimization system.",
                modules: [
                    { name: "Strategy Engine", path: "server/index.js (optimize endpoint)", description: "LLaMA 3.3 70B model for project analysis." },
                    { name: "Prompt Engineering", path: "server/index.js", description: "Structured prompts for actionable recommendations." }
                ]
            }
        ],
        docs: [],
        issues: [
            {
                id: "feature-001",
                problem: "Auto-Continue Mode",
                description: "Need ability to automatically proceed with actions without manual approval.",
                solution: "Implemented toggle in header with localStorage persistence and Ctrl+Shift+P hotkey."
            },
            {
                id: "feature-002",
                problem: "Command Center Enhancement",
                description: "Basic monitoring needed real-time metrics and quick actions.",
                solution: "Added project health indicators, uptime tracking, and quick launch buttons."
            }
        ]
    }
];

// Load projects from file or use defaults
let projects = [];
try {
    if (fs.existsSync(PROJECTS_FILE)) {
        const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
        projects = JSON.parse(data);
        console.log(`Loaded ${projects.length} projects from ${PROJECTS_FILE} `);
    } else {
        projects = defaultProjects;
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
        console.log(`Created ${PROJECTS_FILE} with default projects`);
    }
} catch (err) {
    console.error('Error loading projects:', err);
    projects = defaultProjects;
}

// Helper function to save projects to file
const saveProjects = () => {
    try {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
        console.log('Projects saved to file');
    } catch (err) {
        console.error('Error saving projects:', err);
    }
};

// Auto-mode state handled at top


// Configure Multer for audio uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import { createBackup, listBackups, restoreBackup } from './backup_manager.js';

const app = express();
const PORT = process.env.PORT || 42424;

// GET /api/automation-code - Fetch the Zero-Touch logic for UI display
app.get('/api/automation-code', (req, res) => {
    try {
        const vbsPath = path.join(__dirname, '..', 'scripts', 'trigger_continue.vbs');
        const docPath = path.join(__dirname, '..', 'ZERO_TOUCH_PROTOCOL.md');

        res.json({
            vbs: fs.existsSync(vbsPath) ? fs.readFileSync(vbsPath, 'utf-8') : "' Script not found",
            doc: fs.existsSync(docPath) ? fs.readFileSync(docPath, 'utf-8') : "Protocol documentation not found."
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/trigger-autopilot - Manually fire the Ghost Finger
app.post('/api/trigger-autopilot', (req, res) => {
    try {
        const vbsPath = path.join(__dirname, '..', 'scripts', 'trigger_continue.vbs');
        if (fs.existsSync(vbsPath)) {
            exec(`cscript.exe //Nologo "${vbsPath}"`, (err) => {
                if (err) console.error("Autopilot pulse failed:", err);
            });
            res.json({ success: true, message: "Ghost Finger Pulsed" });
        } else {
            res.status(404).json({ error: "Script not found" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.use(cors());
app.use(express.json());

// --- Activity Stream (SSE) & Real-time Monitoring ---
const clients = [];
const history = []; // Store log history
const MAX_HISTORY = 100;

const broadcastActivity = (msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const eventData = JSON.stringify({ time: timestamp, msg, type });

    // Store in history
    history.push(eventData);
    if (history.length > MAX_HISTORY) history.shift();

    // Send to connected clients
    clients.forEach(client => {
        client.res.write(`data: ${eventData}\n\n`);
    });
};

// Middleware to log API requests to the activity stream
app.use((req, res, next) => {
    // Exclude noisy endpoints and polling
    const excludedPaths = [
        '/api/activity-stream',
        '/api/log-message',
        '/api/projects',
        '/api/auto-mode',
        '/api/artifacts'
    ];

    if (!excludedPaths.includes(req.path)) {
        broadcastActivity(`${req.method} ${req.path}`, 'network');
    }
    next();
});

// Watch 'src' and 'server' directories for real file changes
const setupWatcher = (dir) => {
    try {
        if (fs.existsSync(dir)) {
            fs.watch(dir, { recursive: true }, (eventType, filename) => {
                if (filename && !filename.includes('node_modules') && !filename.includes('.git')) {
                    broadcastActivity(`File ${eventType}: ${path.join(dir, filename)}`, 'filesystem');
                }
            });
            console.log(`Monitoring directory: ${dir}`);
        }
    } catch (e) { console.error(`Failed to watch ${dir}:`, e); }
};
setupWatcher('./src');
setupWatcher('./server');

// --- Helper Functions ---

const readDocContent = (projectPath, docPath) => {
    try {
        const fullPath = path.isAbsolute(docPath) ? docPath : path.join(projectPath, docPath);
        if (fs.existsSync(fullPath)) {
            return fs.readFileSync(fullPath, 'utf-8');
        }
    } catch (err) {
        console.error(`Error reading doc at ${docPath}:`, err);
    }
    return null;
};

// --- Endpoints ---

// GET /api/projects - Returns projects with live data
app.get('/api/projects', (req, res) => {
    const liveProjects = projects.map(p => {
        const liveP = { ...p };

        // Live Doc Sync for Cosmos Clip (ID 1)
        if (p.id === 1 && p.path) {
            liveP.docs = [
                {
                    name: "Backups & Restore Fix",
                    path: "BACKUP_RESTORE_FIX.md",
                    type: "fix",
                    content: readDocContent(p.path, "BACKUP_RESTORE_FIX.md")
                },
                {
                    name: "API Reference",
                    path: "docs/API.md",
                    type: "api",
                    content: readDocContent(p.path, "docs/API.md")
                },
                {
                    name: "Widget Reference",
                    path: "docs/WIDGET_REFERENCE.md",
                    type: "guide",
                    content: readDocContent(p.path, "docs/WIDGET_REFERENCE.md")
                },
                {
                    name: "Hotkey Recording",
                    path: "docs/HOTKEY_RECORDING_REFERENCE.md",
                    type: "guide",
                    content: readDocContent(p.path, "docs/HOTKEY_RECORDING_REFERENCE.md")
                }
            ].filter(d => d.content !== null); // Only return docs we actually found
        }

        return liveP;
    });
    res.json(liveProjects);
});

// POST /api/launch - Launches VS Code
app.post('/api/launch', (req, res) => {
    const { path: projectPath } = req.body;

    if (!projectPath) {
        return res.status(400).json({ error: "No path provided" });
    }

    console.log(`Launching VS Code for: ${projectPath}`);

    // Windows command to open VS Code
    exec(`code "${projectPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: "Failed to launch editor" });
        }
        res.json({ success: true, message: "Launched successfully" });
    });
});

// POST /api/optimize - AI-powered project optimization using Groq
app.post('/api/optimize', async (req, res) => {
    const { project, contextLines } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "GROQ_API_KEY not configured in server environment" });
    }

    if (!project) {
        return res.status(400).json({ error: "No project data provided" });
    }

    try {
        // Build the AI prompt
        const prompt = `You are an expert software project strategist. Analyze the following project and provide actionable optimization recommendations.

Project: ${project.title}
Description: ${project.description}
Status: ${project.status}
${project.version ? `Version: ${project.version}` : ''}
Tags: ${project.tags?.join(', ') || 'None'}

${project.departments?.length ? `Code Structure:
${project.departments.map(dept => `- ${dept.name}: ${dept.description}`).join('\n')}` : ''}

${project.issues?.length ? `Known Issues:
${project.issues.map(issue => `- ${issue.problem}: ${issue.description}`).join('\n')}` : ''}

${contextLines ? `User Focus: ${contextLines}` : ''}

Provide a strategic analysis with:
1. **Next Priority Actions** - Specific tasks to tackle immediately
2. **Architecture Recommendations** - Structural improvements
3. **Risk Assessment** - Potential issues to watch for
4. **Optimization Opportunities** - Performance or workflow enhancements

Format your response in markdown with clear sections.`;

        console.log('Calling Groq API for project optimization...');

        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert software architect and project strategist. Provide clear, actionable recommendations in markdown format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Groq API request failed');
        }

        const data = await response.json();
        const aiResult = data.choices?.[0]?.message?.content;

        if (!aiResult) {
            throw new Error('No response from AI model');
        }

        console.log('AI optimization generated successfully');
        res.json({ result: aiResult });

    } catch (error) {
        console.error('Optimization error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate optimization strategy' });
    }
});

// GET /api/artifacts - Get Antigravity artifacts (task.md, walkthrough.md)
app.get('/api/artifacts', (req, res) => {
    const artifactsPath = 'C:/Users/elois/.gemini/antigravity/brain/cf75381a-f79a-4ab6-b8cf-5eb968070cbb';
    const artifacts = {
        task: null,
        walkthrough: null
    };

    try {
        const taskPath = path.join(artifactsPath, 'task.md');
        if (fs.existsSync(taskPath)) {
            artifacts.task = fs.readFileSync(taskPath, 'utf-8');
        }
    } catch (err) {
        console.error('Error reading task.md:', err);
    }

    try {
        const walkthroughPath = path.join(artifactsPath, 'walkthrough.md');
        if (fs.existsSync(walkthroughPath)) {
            artifacts.walkthrough = fs.readFileSync(walkthroughPath, 'utf-8');
        }
    } catch (err) {
        console.error('Error reading walkthrough.md:', err);
    }

    res.json(artifacts);
});

// POST /api/projects - Add a new project
app.post('/api/projects', (req, res) => {
    const { title, description, status, tags, path, version } = req.body;

    if (!title || !description || !path) {
        return res.status(400).json({ error: "Title, description, and path are required" });
    }

    const newProject = {
        id: projects.length + 1,
        title,
        description,
        status: status || 'Active',
        version: version || '1.0.0',
        tags: tags || [],
        path,
        departments: [],
        docs: [],
        issues: []
    };

    projects.push(newProject);
    saveProjects(); // Save to file
    console.log(`Added new project: ${title}`);
    res.json({ success: true, project: newProject });
});

const startAutopilotSession = () => {
    autopilotSessionActive = true;
    saveAutoState();
    if (sessionTimeout) clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        autopilotSessionActive = false;
        const flagPath = path.join(__dirname, '..', 'scripts', 'AUTOPILOT_ACTIVE.tmp');
        if (fs.existsSync(flagPath)) fs.unlinkSync(flagPath);
    }, 600000);

    try {
        const flagPath = path.join(__dirname, '..', 'scripts', 'AUTOPILOT_ACTIVE.tmp');
        fs.writeFileSync(flagPath, 'ACTIVE');
    } catch (err) { }
};

const stopAutopilotSession = () => {
    autopilotSessionActive = false;
    saveAutoState();
    if (sessionTimeout) clearTimeout(sessionTimeout);
    try {
        const flagPath = path.join(__dirname, '..', 'scripts', 'AUTOPILOT_ACTIVE.tmp');
        if (fs.existsSync(flagPath)) fs.unlinkSync(flagPath);
    } catch (err) { }
};

// GET /api/auto-mode - Check if auto-continue is enabled
app.get('/api/auto-mode', (req, res) => {
    res.json({
        enabled: autoModeEnabled && autopilotSessionActive,
        globalEnabled: autoModeEnabled,
        sessionActive: autopilotSessionActive
    });
});

// POST /api/auto-mode - Update auto-continue state
app.post('/api/auto-mode', (req, res) => {
    const { enabled } = req.body;
    autoModeEnabled = enabled === true;

    if (autoModeEnabled) {
        startAutopilotSession();
    } else {
        stopAutopilotSession();
    }
    saveAutoState();

    const statusMsg = `Auto-mode ${autoModeEnabled ? 'ENABLED' : 'DISABLED'}`;
    console.log(statusMsg);
    broadcastActivity(`SYSTEM: ${statusMsg}`, 'system');
    res.json({ success: true, enabled: autoModeEnabled });
});

app.post('/api/autopilot-session/start', (req, res) => {
    startAutopilotSession();
    res.json({ success: true });
});

app.post('/api/autopilot-session/stop', (req, res) => {
    stopAutopilotSession();
    res.json({ success: true });
});

// POST /api/sync-instructions - Broadcoast instructions to all project roots
app.post('/api/sync-instructions', (req, res) => {
    let { instructions } = req.body;
    const projectId = req.body.projectId || 2; // Default to DevControl

    if (instructions === "LATEST_FROM_HISTORY") {
        try {
            const historyPath = path.join(__dirname, `manager_history_${projectId}.json`);
            if (fs.existsSync(historyPath)) {
                const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
                const lastAssistantMsg = [...history].reverse().find(m => m.role === 'assistant');
                if (lastAssistantMsg) {
                    instructions = lastAssistantMsg.content;
                } else {
                    return res.status(404).json({ error: "No assistant history found" });
                }
            } else {
                return res.status(404).json({ error: "No history file found" });
            }
        } catch (e) {
            return res.status(500).json({ error: "Failed to read history" });
        }
    }

    if (!instructions) {
        return res.status(400).json({ error: "No instructions provided" });
    }

    console.log(`📡 Broadcasting Instructions to ${projects.length} projects...`);
    let successCount = 0;
    let failCount = 0;

    projects.forEach(project => {
        try {
            if (project.path && fs.existsSync(project.path)) {
                const instructionFile = path.join(project.path, '.antigravity-instructions.md');
                const content = `### MANAGER INSTRUCTIONS [${new Date().toLocaleString()}]\n\n${instructions}\n\n--- \n*Sent via DevControl Sync Bridge*`;
                fs.writeFileSync(instructionFile, content);
                successCount++;
            } else {
                failCount++;
            }
        } catch (err) {
            console.error(`Failed to sync to ${project.title}:`, err);
            failCount++;
        }
    });

    broadcastActivity(`SYNC: Instructions pushed to ${successCount} projects (${failCount} failed)`, 'system');
    res.json({ success: true, synced: successCount, failed: failCount });
});

// --- Master Backup Endpoints ---
app.get('/api/master-backups', (req, res) => {
    try {
        const backups = listMasterBackups();
        res.json(backups);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/master-backup', (req, res) => {
    try {
        const result = createMasterBackup();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/restore-master-backup', (req, res) => {
    const { backupName } = req.body;
    try {
        const result = restoreMasterBackup(backupName);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// SSE Endpoint for frontend to subscribe to
app.get('/api/activity-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send history to new client immediately
    history.forEach(eventData => {
        res.write(`data: ${eventData}\n\n`);
    });

    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    clients.push(newClient);

    // Remove client on disconnect
    req.on('close', () => {
        const index = clients.indexOf(newClient);
        if (index !== -1) clients.splice(index, 1);
    });
});

// Endpoint to manually log a message (e.g. from the AI Agent)
app.post('/api/log-message', (req, res) => {
    const { message, type } = req.body;
    if (message) {
        broadcastActivity(message, type || 'agent');
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Message required' });
    }
});

// POST /api/projects/create - Create and initialize a new project
app.post('/api/projects/create', (req, res) => {
    const { title, subfolder, description, tags, status, version } = req.body;

    // User requested specifically to use their GitHub folder
    const baseDir = 'C:\\Users\\elois\\OneDrive\\Documents\\GitHub';
    const projectPath = path.join(baseDir, subfolder);

    // 1. Create Directory
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
        console.log(`Created project folder: ${projectPath}`);
    } else {
        // If it exists, we just proceed to register it, or maybe error? 
        // User said "create a new folder", but maybe they mean "register this folder".
        // Let's assume safely we use it.
        console.log(`Project folder already exists: ${projectPath}`);
    }

    // 2. Add to Projects config
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    const newProject = {
        id: newId,
        title,
        description,
        status: status || 'Active',
        version: version || '0.1.0',
        tags: tags || [],
        path: projectPath,
        monitorUrl: '', // Can be filled later
        departments: [],
        docs: [],
        issues: []
    };

    projects.push(newProject);
    saveProjects(); // Persist to disk

    // 3. Launch Antigravity
    const antigravityPath = path.join(process.env.LOCALAPPDATA, 'Programs', 'Antigravity', 'Antigravity.exe');
    exec(`"${antigravityPath}" "${projectPath}"`, (error) => {
        if (error) console.error(`Failed to open Antigravity: ${error}`);
    });

    // 4. Optionally Init Git? (User said "with GitHub on my local machine")
    // Let's run a quick git init to be helpful
    exec('git init', { cwd: projectPath }, (err) => {
        if (!err) console.log('Initialized git repository.');
    });

    broadcastActivity(`Initialized new project: ${title}`, 'system');
    res.json({ success: true, project: newProject });
});
app.post('/api/launch-console', (req, res) => {
    const { projectId } = req.body;
    const project = projects.find(p => p.id === projectId);

    if (!project) return res.status(404).json({ error: 'Project not found' });

    console.log(`Launching project: ${project.title} at ${project.path}`);

    // Action 1: Open Antigravity
    const antigravityPath = path.join(process.env.LOCALAPPDATA, 'Programs', 'Antigravity', 'Antigravity.exe');
    exec(`"${antigravityPath}" "${project.path}"`, (error) => {
        if (error) console.error(`Failed to open Antigravity: ${error}`);
    });

    // Action 2: Launch Terminal & Run Dev Server
    // We assume 'npm run dev' is the standard. If 'loadCmd' exists, we could use that,
    // but the user specifically asked to "open project AND run".
    const startScript = "npm run dev";
    const command = `start powershell.exe -NoExit -Command "Set-Location '${project.path}'; Write-Host '🚀 Starting ${project.title}...' -ForegroundColor Cyan; ${startScript}"`;

    exec(command, (error) => {
        if (error) {
            console.error(`Error launching terminal: ${error}`);
            return res.status(500).json({ error: 'Failed to launch terminal' });
        }
        res.json({ success: true });
    });
});

// GET /api/project-status - Read the status file
app.get('/api/project-status', (req, res) => {
    const { projectId } = req.query;
    const targetId = parseInt(projectId) || 2; // Default to DevControl

    const project = projects.find(p => p.id === targetId);

    if (!project || !project.path) {
        return res.status(404).send("Project or path not found.");
    }

    try {
        const statusPath = path.join(project.path, 'PROJECT_STATUS.md');
        if (fs.existsSync(statusPath)) {
            const content = fs.readFileSync(statusPath, 'utf-8');
            res.send(content);
        } else {
            res.send(`Status file not found at: ${statusPath}`);
        }
    } catch (e) {
        res.status(500).send("Error reading status file.");
    }
});

// POST /api/project-status - Update the strategic context (PROJECT_STATUS.md)
app.post('/api/project-status', (req, res) => {
    const { projectId, content } = req.body;
    const targetId = projectId || "2"; // Default to DevControl if not specified
    const project = projects.find(p => String(p.id) === String(targetId));

    if (!project || !project.path) {
        return res.status(404).json({ error: "Project or path not found." });
    }

    try {
        const statusPath = path.join(project.path, 'PROJECT_STATUS.md');
        fs.writeFileSync(statusPath, content, 'utf-8');
        console.log(`[ProtocolUpdate] Updated status for project: ${project.title}`);
        res.json({ success: true });
    } catch (e) {
        console.error("Failed to update status file:", e);
        res.status(500).json({ error: e.message });
    }
});

// POST /api/send-instruction - Bridge from Manager to Agent
app.post('/api/send-instruction', (req, res) => {
    const { instruction, projectId } = req.body;
    const targetId = parseInt(projectId) || 2;
    const project = projects.find(p => p.id === targetId);

    if (!project || !project.path) {
        return res.status(404).json({ error: "Project or path not found." });
    }

    try {
        const instructionPath = path.join(project.path, 'AGENT_INSTRUCTIONS.md');
        // Prepend new instruction with timestamp
        const content = `### INSTRUCTION [${new Date().toLocaleTimeString()}]\n${instruction}\n\n`;
        fs.writeFileSync(instructionPath, content);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/trigger-continue - Automate the "Continue" (Ctrl+Enter) in Antigravity
app.post('/api/trigger-continue', (req, res) => {
    console.log("[Automation] Triggering Antigravity Continue via VBScript...");
    const scriptPath = path.join(__dirname, '..', 'scripts', 'trigger_continue.vbs');

    exec(`cscript //NoLogo "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Automation error: ${error}`);
            return res.status(500).json({ error: "Failed to trigger continue" });
        }
        console.log(`Automation Result: ${stdout.trim()}`);
        res.json({ success: true, message: stdout.trim() });
    });
});

// Persistent Manager History
const getManagerHistoryPath = (projectId) => {
    const id = parseInt(projectId) || 2;
    return path.join(__dirname, `manager_history_${id}.json`);
};

app.get('/api/manager-history', (req, res) => {
    const { projectId } = req.query;
    const historyPath = getManagerHistoryPath(projectId);
    try {
        if (fs.existsSync(historyPath)) {
            const data = fs.readFileSync(historyPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (e) {
        console.error("History load error:", e);
        res.status(500).json({ error: "Failed to load history" });
    }
});

app.delete('/api/manager-history', (req, res) => {
    const { projectId } = req.query;
    const historyPath = getManagerHistoryPath(projectId);
    try {
        if (fs.existsSync(historyPath)) {
            fs.unlinkSync(historyPath);
        }
        res.json({ success: true });
    } catch (e) {
        res.status(501).json({ error: "Failed to clear history" });
    }
});

// POST /api/manager-chat - Chat with Groq Manager
app.post('/api/manager-chat', async (req, res) => {
    const { messages, context, projectId } = req.body;
    console.log(`[ManagerChat] Request for project: ${projectId}, Messages: ${messages?.length}`);

    const apiKey = process.env.GROQ_API_KEY;
    const targetId = parseInt(projectId) || 2;
    const historyPath = getManagerHistoryPath(targetId);

    if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY missing" });
    if (!Array.isArray(messages)) return res.status(400).json({ error: "Messages array required" });

    try {
        const systemMsg = {
            role: 'system',
            content: `You are the Strategic Manager for an autonomous coding agent (Antigravity). 
Your role is to analyze the project status and guide the user/agent on the best next steps.
Be concise, strategic, and directive.

[CURRENT PROJECT STATUS]
${context || 'No context available'}
`
        };

        const conversationHistory = messages.filter(m => m && m.role !== 'system').map(m => ({
            role: m.role,
            content: m.content
        }));

        if (conversationHistory.length === 0) {
            return res.status(400).json({ error: "Conversation history empty" });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [systemMsg, ...conversationHistory],
                temperature: 0.7,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("[ManagerChat] Groq Error:", err);
            throw new Error(err.error?.message || 'Groq API failed');
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        const botMsg = { id: `bot-${Date.now()}`, role: 'assistant', content: reply };
        const updatedHistory = [...messages, botMsg];

        fs.writeFileSync(historyPath, JSON.stringify(updatedHistory, null, 2));

        res.json({ reply, id: botMsg.id });

    } catch (error) {
        console.error("Manager Chat Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/manager-appraisal - Direct Agent appraisal injection
app.post('/api/manager-appraisal', async (req, res) => {
    const { projectId, appraisal } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    const targetId = parseInt(projectId) || 2;
    const historyPath = getManagerHistoryPath(targetId);

    if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY missing" });
    if (!appraisal) return res.status(400).json({ error: "Appraisal content required" });

    try {
        let history = [];
        if (fs.existsSync(historyPath)) {
            history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        }

        const appraisalMsg = {
            id: `agent-appraisal-${Date.now()}`,
            role: 'user',
            content: `[INTERNAL AGENT BRAIN INJECTION]\n\n${appraisal}`
        };

        const systemMsg = {
            role: 'system',
            content: `You are the Strategic Manager for an autonomous coding agent (Antigravity). 
You have just received an internal appraisal from the Agent itself. 
Analyze this appraisal, respond to the Agent/User directly, and provide your strategic assessment.
Be concise, professional, and directive.`
        };

        const messagesForAI = [
            systemMsg,
            ...history.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: appraisalMsg.content }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messagesForAI,
                temperature: 0.7,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Groq API failed');
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        const botMsg = { id: `bot-${Date.now()}`, role: 'assistant', content: reply };

        const updatedHistory = [...history, appraisalMsg, botMsg];
        fs.writeFileSync(historyPath, JSON.stringify(updatedHistory, null, 2));

        res.json({ success: true, reply, id: botMsg.id });

    } catch (error) {
        console.error("Appraisal Injection Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/stt - Speech to Text using Groq Whisper
app.post('/api/stt', upload.single('audio'), async (req, res) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY missing" });
    if (!req.file) return res.status(400).json({ error: "No audio file provided" });

    try {
        console.log(`[STT] Processing audio file: ${req.file.originalname}, Size: ${req.file.size} bytes`);

        const audioBlob = new Blob([req.file.buffer], { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-large-v3');
        formData.append('response_format', 'json');

        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("[STT] Groq Error:", err);
            throw new Error(err.error?.message || 'Groq Transcription failed');
        }

        const data = await response.json();
        console.log(`[STT] Transcription complete: "${data.text.substring(0, 50)}..."`);
        res.json({ text: data.text });

    } catch (error) {
        console.error("STT Critical Error:", error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

app.post('/api/tts', async (req, res) => {
    const { text, voice = 'alloy' } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "OPENAI_API_KEY missing in .env. Please add it to enable AI Voice." });
    }

    try {
        console.log(`[TTS] Generating voice for: "${text.substring(0, 50)}..." using ${voice}`);

        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: text,
                voice: voice
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const buffer = await response.arrayBuffer();
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.byteLength
        });
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("TTS Bridge Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/azure-tts', async (req, res) => {
    const { text, voice = 'en-US-JennyNeural' } = req.body;
    const apiKey = process.env.AZURE_TTS_KEY;
    const region = process.env.AZURE_TTS_REGION || 'eastus';

    if (!apiKey) {
        return res.status(500).json({ error: "AZURE_TTS_KEY missing in .env. Please add it to enable Azure Neural Voice." });
    }

    try {
        console.log(`[Azure TTS] Generating voice for: "${text.substring(0, 50)}..." using ${voice}`);

        const ssml = `<speak version='1.0' xml:lang='en-US'>
            <voice name='${voice}'>${text}</voice>
        </speak>`;

        const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
            },
            body: ssml
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Azure API error: ${response.status} - ${errorText}`);
        }

        const buffer = await response.arrayBuffer();
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.byteLength
        });
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("Azure TTS Bridge Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- Backup & Restore System ---

app.get('/api/backups', (req, res) => {
    try {
        const backups = listBackups();
        res.json(backups);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/backup-now', (req, res) => {
    try {
        const result = createBackup();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/restore-backup', (req, res) => {
    const { backupName } = req.body;
    if (!backupName) return res.status(400).json({ error: "Backup name required" });

    try {
        const result = restoreBackup(backupName);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/documentation', async (req, res) => {
    try {
        const docFiles = [
            'IMPLEMENTATION_MASTER_PLAN.md',
            'PROJECT_STATUS.md',
            'AUTOPILOT_DOCUMENTATION.md',
            'THEME_GUIDE.md'
        ];

        const docs = await Promise.all(docFiles.map(async file => {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                return {
                    name: file,
                    content: fs.readFileSync(filePath, 'utf8'),
                    path: file
                };
            }
            return null;
        }));

        res.json(docs.filter(d => d !== null));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`DevControl Server running on http://localhost:${PORT}`);
});
