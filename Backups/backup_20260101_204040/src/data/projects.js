export const projects = [
    {
        id: 1,
        title: "Cosmos Clip", // Corresponds to "Copy Paste" project
        description: "Advanced clipboard manager with backup encryption and history tracking.",
        status: "Active",
        version: "1.2.2",
        tags: ["Electron", "React", "Utility", "Encryption"],
        path: "c:/Users/elois/OneDrive/Documents/GitHub/cosmos-clip",
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
        docs: [
            {
                name: "Backups & Restore Fix",
                path: "BACKUP_RESTORE_FIX.md",
                type: "fix",
                content: `# Backup Restore Fix - UPDATED

## Problem Summary
The backup restore feature had TWO issues:
1. **Encryption Detection Bug**: Auto-backup files were encrypted but missing the \`isEncrypted\` flag, causing the decryption function to fail
2. **No Password Prompt**: The restore flow didn't prompt for a password when encountering encrypted files

## Fixes Applied

### Fix 1: Improved Encryption Detection
Modified \`electron/main.cjs\` - \`decryptContent()\` function to:
- Check for BOTH the \`isEncrypted\` flag AND the presence of \`iv\`/\`content\` fields
- This allows it to properly detect and decrypt older backup files

### Fix 2: Password Prompt Flow
Implemented a proper restore workflow:
1. User clicks "Restore" → File picker opens
2. User selects a backup file
3. **If encrypted**: Password modal appears automatically
4. User enters password → File is decrypted and restored
5. **If not encrypted**: File is restored immediately`
            },
            {
                name: "API Reference",
                path: "docs/API.md",
                type: "api",
                content: `# Cosmos Clip Developer API 🌌

The Cosmos Clip Developer API allows you to integrate clipboard management and AI features into your own applications or scripts.

## Getting Started

1.  Open **Settings** in Cosmos Clip.
2.  Navigate to the **Developer API** section.
3.  Enable **Local API Server**.
4.  Note your **API Port** (default is \`5679\`).

## Endpoints

### 1. Check Status
Check if the Cosmos API is active.
- **URL**: \`http://localhost:5679/api/status\`
- **Method**: \`GET\`
`
            },
            {
                name: "Widget Reference",
                path: "docs/WIDGET_REFERENCE.md",
                type: "guide",
                content: `# Red Dot Widget: Technical Reference

## The Problem
Creating a small, draggable, transparent floating widget in Electron on Windows is surprisingly difficult due to platform limitations.

## Challenges Faced

### 1. Transparent Windows Can't Be Resized on Windows
Windows OS prevents resizing of transparent frameless windows. This breaks mouse events for dragging.

### 2. Click vs Drag Detection
The widget needs to:
- **Drag** when you grab and move it
- **Click** when you tap to expand the full app
`
            },
            {
                name: "Hotkey Recording",
                path: "docs/HOTKEY_RECORDING_REFERENCE.md",
                type: "guide",
                content: `# Hotkey Recording: Technical Reference

## The Problem
The Quick Cut Hotkey recording feature stopped working in development. Users could click "Set", press a key combination, but nothing was captured—it always reverted to the default \`Ctrl + Shift + X\`.

## Root Cause Analysis

### Why It Failed
1. **Worker Isolation Attempt**: We tried running \`uiohook-napi\` in a separate worker process (\`electron/worker.js\`) to prevent crashes from affecting the main process.
2. **Native Module Incompatibility**: The \`uiohook-napi\` native module repeatedly crashed in the worker, causing the entire hotkey system to fail silently.
`
            }
        ],
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
        title: "Quantum Engine",
        description: "Next-generation anti-gravity propulsion system for deep space exploration.",
        status: "Active",
        tags: ["Physics", "Propulsion", "Top Secret"],
        departments: [],
        docs: [],
        issues: []
    },
    {
        id: 3,
        title: "Neon Nexus",
        description: "Procedural cyberpunk city generator using wave function collapse algorithm.",
        status: "Development",
        tags: ["Generative AI", "WebGL", "Rust"],
        departments: [],
        docs: [],
        issues: []
    },
    {
        id: 4,
        title: "Void Shell",
        description: "Encrypted communication layer for off-grid operatives.",
        status: "Maintenance",
        tags: ["Security", "P2P", "Cryptography"],
        departments: [],
        docs: [],
        issues: []
    }
];
