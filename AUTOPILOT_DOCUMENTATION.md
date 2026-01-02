# Autopilot Daemon Documentation

## Overview

The Autopilot Daemon is a background service that automatically clicks "Accept" and "Continue" buttons in the Antigravity AI assistant interface, eliminating the need for manual approval of tool calls and commands.

---

## The Problem Discovered (2026-01-02)

### Root Cause
The autopilot was failing to auto-click because of a **window title mismatch**:

**Original Code:**
```vbscript
targetTitle = "DevControl - Antigravity - Task"
```

**Actual Window Titles:**
- `DevControl - Antigravity - Walkthrough`
- `DevControl - Antigravity - Task`
- `DevControl - Antigravity - Implementation Plan`
- `DevControl - Antigravity - Other`

The script was hardcoded to look for "Task" conversations only, so it failed when the user was in a "Walkthrough" or other conversation type.

### Why It Worked Yesterday
The autopilot worked yesterday because the user was likely in a "Task" conversation. Today, they switched to a "Walkthrough" conversation, causing the title mismatch.

### The Fix
Changed the target title to match ANY Antigravity window:
```vbscript
targetTitle = "Antigravity"  ' Matches any window containing "Antigravity"
```

---

## How the Autopilot Works

### Architecture

```
┌─────────────────────────────────────┐
│   autopilot_daemon.mjs              │
│   (Node.js Background Service)      │
│                                     │
│   • Runs continuously               │
│   • Executes every 3 seconds        │
│   • Spawns VBScript as child        │
└──────────────┬──────────────────────┘
               │
               │ spawns every 3s
               ▼
┌─────────────────────────────────────┐
│   trigger_continue.vbs              │
│   (Windows VBScript)                │
│                                     │
│   • Finds Antigravity window        │
│   • Checks if in foreground         │
│   • Sends Alt+Enter keypress        │
└─────────────────────────────────────┘
```

### File Locations
- **Daemon**: `scripts/autopilot_daemon.mjs`
- **VBScript**: `scripts/trigger_continue.vbs`

### Execution Flow

1. **Daemon Starts** (`autopilot_daemon.mjs`)
   - Runs as a background Node.js process
   - Sets up 3-second interval timer

2. **Every 3 Seconds**
   - Executes `trigger_continue.vbs` via `cscript`
   - Waits for VBScript to complete
   - Logs output (if not "Target window not found")

3. **VBScript Execution** (`trigger_continue.vbs`)
   - Creates Windows Shell object
   - Searches for window with "Antigravity" in title
   - Checks if window is in foreground (active)
   - If yes: Sends `Alt+Enter` keypress
   - If no: Skips to prevent focus theft

4. **Key Press Effect**
   - `Alt+Enter` triggers "Accept All" in Antigravity
   - Approves pending tool calls automatically

---

## Current Behavior (Conservative Mode)

### When It Works
✅ Antigravity window is **in focus** (active/foreground)  
✅ User is actively looking at the Antigravity interface  
✅ Prevents interrupting work in other applications  

### When It Doesn't Work
❌ Antigravity window is in background  
❌ User is working in VS Code, Chrome, etc.  
❌ Window is minimized  

### Design Philosophy
The current implementation is **"polite"** - it only acts when the user is already looking at Antigravity. This prevents:
- Stealing focus from other applications
- Interrupting typing in VS Code
- Disrupting web browsing
- Unexpected behavior when multitasking

---

## The Trade-off Problem

### Conservative Approach (Current)
**Pros:**
- ✅ Never interrupts other work
- ✅ Safe and predictable
- ✅ No accidental focus stealing

**Cons:**
- ❌ Requires Antigravity to be in focus
- ❌ Doesn't work when multitasking
- ❌ User must manually switch to window

### Aggressive Approach (Alternative)
**Pros:**
- ✅ Works even when in background
- ✅ Auto-approves while working elsewhere
- ✅ True "hands-free" operation

**Cons:**
- ❌ Steals focus from current application
- ❌ Can interrupt typing mid-sentence
- ❌ Disruptive when working in other apps

---

## Proposed Solution: Hybrid Mode

### Smart Detection Strategy

The autopilot should be **aggressive when safe, polite when risky**:

```
IF Antigravity is in foreground:
    → Auto-click immediately (current behavior)

ELSE IF user is typing in VS Code/text editor:
    → Wait, don't interrupt

ELSE IF user is idle (no keyboard/mouse for 2+ seconds):
    → Activate Antigravity window and auto-click

ELSE IF Antigravity has been waiting > 30 seconds:
    → Show notification: "Antigravity needs approval"
    → Optional: Auto-activate after 60 seconds
```

### Implementation Approaches

#### Option 1: Idle Detection (Recommended)
Monitor keyboard/mouse activity. Only steal focus if user is idle.

**Pros:**
- Won't interrupt active work
- Auto-clicks during pauses
- Balances convenience and safety

**Cons:**
- More complex implementation
- Requires Windows API calls

#### Option 2: Time-Based Escalation
Wait 30 seconds before getting aggressive.

**Pros:**
- Simple to implement
- Gives user time to notice
- Fallback for forgotten approvals

**Cons:**
- Still waits 30 seconds initially
- May still interrupt if user returns

#### Option 3: User Preference Toggle
Let user choose mode via DevControl settings.

**Modes:**
1. **Polite** (current): Only when in focus
2. **Balanced**: Idle detection + time-based
3. **Aggressive**: Always activate and click

**Pros:**
- User control
- Flexibility for different workflows
- Can switch based on task

**Cons:**
- Requires UI implementation
- More code to maintain

---

## Recommended Implementation: Balanced Mode

### Enhanced VBScript Logic

```vbscript
' Get idle time (time since last input)
Set objShell = CreateObject("WScript.Shell")
Set objWMI = GetObject("winmgmts:\\.\root\cimv2")

' Check if user is idle (no input for 3+ seconds)
Function IsUserIdle()
    ' Windows API call to get last input time
    ' Return True if idle > 3 seconds
End Function

' Main logic
If WshShell.AppActivate("Antigravity") Then
    ' Window is already in focus - click immediately
    WScript.Sleep 500
    WshShell.SendKeys "%{ENTER}"
    WScript.Echo "✅ Auto-clicked (window in focus)"
    
ElseIf IsUserIdle() Then
    ' User is idle - safe to activate and click
    WshShell.AppActivate("Antigravity")
    WScript.Sleep 500
    WshShell.SendKeys "%{ENTER}"
    WScript.Echo "✅ Auto-clicked (user idle)"
    
Else
    ' User is actively working - don't interrupt
    WScript.Echo "⏸️ Waiting (user active in other app)"
End If
```

### Enhanced Daemon with Timeout

```javascript
// Track how long Antigravity has been waiting
let waitingStartTime = null;
const MAX_WAIT_TIME = 60000; // 60 seconds

setInterval(() => {
    exec(`cscript //NoLogo "${scriptPath}"`, (error, stdout, stderr) => {
        if (stdout.includes("Auto-clicked")) {
            waitingStartTime = null; // Reset timer
            console.log(stdout.trim());
        } else if (stdout.includes("Waiting")) {
            if (!waitingStartTime) {
                waitingStartTime = Date.now();
            }
            
            const waitTime = Date.now() - waitingStartTime;
            
            if (waitTime > MAX_WAIT_TIME) {
                // Force activation after 60 seconds
                console.log("⚠️ Forcing activation after 60s wait");
                exec(`cscript //NoLogo "${forceActivateScript}"`);
                waitingStartTime = null;
            }
        }
    });
}, 3000);
```

---

## Current Status

### What's Implemented
- ✅ Basic autopilot daemon
- ✅ Window title matching (any Antigravity window)
- ✅ Polite mode (only when in focus)
- ✅ 3-second pulse interval
- ✅ Auto-starts with DevControl

### What's Not Implemented Yet
- ❌ Idle detection
- ❌ Time-based escalation
- ❌ User preference toggle
- ❌ Notification system
- ❌ Logging/statistics

---

## Usage

### Starting Manually
```powershell
node scripts/autopilot_daemon.mjs
```

### Auto-Start (Integrated)
The autopilot automatically starts when DevControl launches (via `electron/main.cjs`).

### Stopping
```powershell
# Find the process
Get-Process node | Where-Object { $_.CommandLine -like "*autopilot*" }

# Kill it
Stop-Process -Id <PID>
```

### Checking Status
```powershell
# See if it's running
Get-Process node | Where-Object { $_.CommandLine -like "*autopilot*" }

# View live output
node scripts/autopilot_daemon.mjs
```

---

## Configuration

### Pulse Interval
Edit `scripts/autopilot_daemon.mjs`:
```javascript
}, 3000); // Change to 5000 for 5 seconds, 1000 for 1 second, etc.
```

### Key Combination
Edit `scripts/trigger_continue.vbs`:
```vbscript
WshShell.SendKeys "%{ENTER}"  ' Alt+Enter
' Change to:
' WshShell.SendKeys "^{ENTER}"  ' Ctrl+Enter
' WshShell.SendKeys "{ENTER}"   ' Just Enter
```

### Target Window
Edit `scripts/trigger_continue.vbs`:
```vbscript
targetTitle = "Antigravity"  ' Matches any Antigravity window
' Or be more specific:
' targetTitle = "DevControl - Antigravity"
```

---

## Troubleshooting

### Autopilot Not Clicking

**Check 1: Is it running?**
```powershell
Get-Process node | Where-Object { $_.CommandLine -like "*autopilot*" }
```

**Check 2: Is Antigravity window in focus?**
- Click on the Antigravity browser window
- Wait 3 seconds
- Should auto-click

**Check 3: Window title correct?**
```powershell
Get-Process | Where-Object { $_.MainWindowTitle -like "*Antigravity*" } | Select MainWindowTitle
```

**Check 4: VBScript working?**
```powershell
cscript //NoLogo scripts\trigger_continue.vbs
```

### Autopilot Clicking Too Much
- Increase interval in `autopilot_daemon.mjs`
- Change from 3000ms to 5000ms or higher

### Autopilot Stealing Focus
- This is the current design limitation
- Implement idle detection (see Proposed Solution above)

---

## Security Considerations

### Risks
1. **Unintended Approvals**: Could approve malicious commands if Antigravity is compromised
2. **Focus Theft**: Can interrupt work in other applications
3. **Accessibility**: May interfere with screen readers or accessibility tools

### Mitigations
1. **Window Matching**: Only targets Antigravity windows
2. **Polite Mode**: Only acts when window is in focus (current)
3. **Logging**: All actions are logged for audit
4. **Manual Override**: User can kill process anytime

### Best Practices
- Only run when actively using Antigravity
- Review logs periodically
- Disable when running untrusted code
- Keep DevControl updated

---

## Future Enhancements

### Priority 1: Idle Detection
Implement smart detection to avoid interrupting active work.

### Priority 2: User Preferences
Add UI toggle in DevControl for:
- Enable/Disable autopilot
- Choose mode (Polite/Balanced/Aggressive)
- Set pulse interval
- Configure timeout

### Priority 3: Statistics Dashboard
Track and display:
- Total auto-clicks
- Time saved
- Average wait time
- Success rate

### Priority 4: Smart Learning
Learn user patterns:
- When user typically approves
- Which commands are always approved
- Optimal pulse interval

---

## Version History

### v1.0 (2026-01-02)
- Initial implementation
- Fixed window title matching bug
- Documented behavior and trade-offs

### Planned v1.1
- Idle detection
- Time-based escalation
- User preference toggle

---

## Related Files

- `scripts/autopilot_daemon.mjs` - Main daemon process
- `scripts/trigger_continue.vbs` - VBScript for window activation
- `electron/main.cjs` - Auto-start integration
- `CODE_SIGNING_GUIDE.md` - Related Windows automation docs

---

**Last Updated**: 2026-01-02  
**Maintainer**: DevControl Development Team  
**Status**: Active Development
