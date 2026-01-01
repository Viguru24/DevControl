# Zero-Touch Autopilot Protocol

The **Zero-Touch** system is a strategic automation layer designed to eliminate the friction of manual "Accept All" or "Continue" prompts during AI-driven development.

## 🛠 How It Works

The system operates using a "Ghost Finger" mechanism that bypasses internal AI safety locks via external Windows signals.

### 1. The Trigger (VBScript)
At the core is `trigger_continue.vbs`. This script uses Windows Script Host to:
- Identify windows with titles like `"Antigravity"`, `"DevControl - Task"`, or `"Visual Studio Code"`.
- Forcefully focus the window.
- Send the `Alt + Enter` key combination (the global shortcut for "Accept All").

### 2. The Daemon (The Pulse)
A background process (`autopilot_daemon.mjs`) or an on-demand heartbeat from the DevControl Dashboard pulses the trigger script.
- **Pulse Interval**: Every 3-5 seconds.
- **Zero-Touch Philosophy**: If you see a prompt, don't click it. The "Ghost Finger" will catch it within one heartbeat.

### 3. "Polite" Logic
The current implementation is designed to be non-intrusive:
- It only fires when an active command is awaiting approval.
- It attempts to minimize focus-stealing while you are typing in other applications like Chrome or Explorer.

## 🚀 Global Implementation

To "unshackle" any project, the Zero-Touch Bridge must be active. 

### Implementation per Project:
Each project monitored by DevControl is now integrated into this loop. When DevControl is running in **Auto-Mode**, it acts as the "Master Controller" for every repository listed in your portfolio.

## 🔐 Security Note
Zero-Touch does not bypass the *need* for approval; it simply automates the *action* of clicking. You should still monitor the agent's output. To stop the automation, simply toggle **Auto-Mode: OFF** in the DevControl Dashboard.
