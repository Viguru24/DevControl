# DevControl System Architecture & User Guide

This document provides a comprehensive overview of the DevControl ecosystem, including the Zero-Touch HUD, the Instruction Sync Bridge, and the Port-less architecture.

---

## 🛰️ 1. The Zero-Touch HUD (The Orb)
The floating Orb is the manual control point for the **Ghost Finger** automation system.

### **Port-less Architecture (IPC)**
In version 2.0, the HUD has been decoupled from the network. It no longer uses a local server port (e.g., 3001 or 42424) for its core operations.
- **Communication:** Uses Electron **Inter-Process Communication (IPC)**. The frontend (the Orb) sends messages directly to the Electron main process via memory.
- **Loading:** The HUD loads directly from local files (`dist/index.html`), ensuring 100% independence from any web server or network conflict.
- **Benefit:** 0% network footprint and immunity to port conflicts with other developer tools.

### **The "Ghost Finger" (Pulse Logic)**
When set to **READY**, the HUD initiates a 1.5-second pulse loop.
- **Mechanism:** The Electron process executes a surgical VBScript (`scripts/trigger_continue.vbs`).
- **Safety Lock:** It only fires if it detects the `AUTOPILOT_ACTIVE.tmp` flag and uniquely identifies an "Antigravity" enabled window.

---

## 📡 2. The Instruction Sync Bridge
DevControl acts as the "Mission Control" for multiple AI-powered projects.

### **Global Synchronization**
Instead of copy-pasting instructions into every individual project window, DevControl can "blast" directives globally.
- **Double-Click Orb:** Triggers a global sync of the *latest* assistant message from the DevControl manager history.
- **Manual Push:** Users can trigger a sync via the "Push to All Projects" button in the Manager Interface.
- **Execution:** DevControl writes a `.antigravity-instructions.md` file to the root of every configured project path (e.g., `cosmos-clip`, `family-basket`, etc.).

---

## 🚀 3. Launcher System
Located on the Desktop for immediate access.

### **`ZeroTouchLauncher.bat`**
- **Mode:** Starts the HUD in `Standalone (Zero-Port) Mode`.
- **Logic:** Instantly loads the production-built UI without spinning up a Node.js backend or Vite dev server. It relies on the pre-built `dist` folder.

### **`ZeroTouchShutdown.bat`**
- **Cleanup:** Surgical termination of DevControl processes.
- **Protection:** Specifically filtered to kill only DevControl-related windows and scripts, ensuring it does **not** crash third-party apps like clipboard managers or IDEs.

---

## ☁️ 4. Multi-Project Infrastructure
The system manages a suite of applications, all synchronized under the same protocol:
1. **Cosmos Clip:** Advanced clipboard management with PWA support.
2. **Family Basket:** Real-time grocery and task management.
3. **SimpleWhisper:** Private, AI-powered transcription/voice-to-text.
4. **DevControl:** The central hub for monitoring and directing all the above.

---

## 🛠️ Developer Maintenance
- **Build Command:** `npm run build` (Must be run after UI changes to update the Port-less HUD).
- **Sync Command:** The Orb's double-click handles the heavy lifting of instruction distribution.
- **Config:** Project paths and metadata are centrally managed in `server/projects.json`.

---
*Last Updated: January 2026*
