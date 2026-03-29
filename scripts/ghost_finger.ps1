Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Collections.Generic;

public class Win32 {
    [StructLayout(LayoutKind.Sequential)]
    public struct LASTINPUTINFO {
        public uint cbSize;
        public uint dwTime;
    }

    [DllImport("user32.dll")]
    public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    private const byte VK_MENU = 0x12; // Alt
    private const uint KEYEVENTF_KEYUP = 0x0002;

    public static void ForceForegroundWindow(IntPtr hWnd) {
        // The famous 'Alt Hack' to bypass Windows Foreground Locking
        keybd_event(VK_MENU, 0, 0, UIntPtr.Zero);
        SetForegroundWindow(hWnd);
        keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }

    public static List<IntPtr> FindWindows(string[] targets) {
        List<IntPtr> handles = new List<IntPtr>();
        EnumWindows((hWnd, lParam) => {
            if (!IsWindowVisible(hWnd)) return true;
            
            StringBuilder sb = new StringBuilder(256);
            GetWindowText(hWnd, sb, 256);
            string title = sb.ToString();
            
            if (string.IsNullOrWhiteSpace(title) || title == "Program Manager") return true;

            foreach(string t in targets) {
                if (title.Contains(t)) {
                    handles.Add(hWnd);
                    break;
                }
            }
            return true;
        }, IntPtr.Zero);
        return handles;
    }
}

public class HardwareKey {
    [DllImport("user32.dll", SetLastError = true)]
    private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    
    private const byte VK_MENU = 0x12; // Alt
    private const byte VK_RETURN = 0x0D; // Enter
    private const byte VK_CONTROL = 0x11; // Ctrl
    private const uint KEYEVENTF_KEYUP = 0x0002;

    public static void PressAltEnter() {
        keybd_event(VK_MENU, 0, 0, UIntPtr.Zero);
        System.Threading.Thread.Sleep(50);
        keybd_event(VK_RETURN, 0, 0, UIntPtr.Zero);
        System.Threading.Thread.Sleep(50);
        keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        System.Threading.Thread.Sleep(50);
        keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }
    
    public static void PressCtrlEnter() {
        keybd_event(VK_CONTROL, 0, 0, UIntPtr.Zero);
        System.Threading.Thread.Sleep(50);
        keybd_event(VK_RETURN, 0, 0, UIntPtr.Zero);
        System.Threading.Thread.Sleep(50);
        keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        System.Threading.Thread.Sleep(50);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }
    
    public static void PressEnter() {
        keybd_event(VK_RETURN, 0, 0, UIntPtr.Zero);
        System.Threading.Thread.Sleep(50);
        keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }
}
"@

function Get-IdleTime {
    $lastInput = New-Object Win32+LASTINPUTINFO
    $lastInput.cbSize = [System.Runtime.InteropServices.Marshal]::SizeOf($lastInput)
    if ([Win32]::GetLastInputInfo([ref]$lastInput)) {
        return [Environment]::TickCount - $lastInput.dwTime
    }
    return 0
}

function Get-WindowTitle($hwnd) {
    if ($hwnd -eq [IntPtr]::Zero) { return "" }
    $sb = New-Object -TypeName System.Text.StringBuilder -ArgumentList 256
    [Win32]::GetWindowText($hwnd, $sb, $sb.Capacity) | Out-Null
    return $sb.ToString().Trim()
}

# --- CONFIGURATION ---
$IdleThresholdMs = 0 # ZERO-TOUCH INSTANT MODE
$flagPath = Join-Path $PSScriptRoot "AUTOPILOT_ACTIVE.tmp"

Write-Host "GhostFinger (Safety Aware): Checking state..."

if (-not (Test-Path $flagPath)) {
    Write-Host "GhostFinger: Flag NOT found. Exiting."
    exit
}

$idleTime = Get-IdleTime

if ($idleTime -lt $IdleThresholdMs) {
    Write-Host "GhostFinger: USER ACTIVE. Safety-Lock Engaged."
    exit
}

$targets = @("DevControl - Task", "Antigravity - Task", "Walkthrough", "Antigravity", "Visual Studio Code")

$matchingWindows = [Win32]::FindWindows($targets)
$activeHwnd = [Win32]::GetForegroundWindow()

$pulsedWindowsCount = 0
$wshell = New-Object -ComObject WScript.Shell

foreach ($hwnd in $matchingWindows) {
    $title = Get-WindowTitle $hwnd
    
    if ($hwnd -ne $activeHwnd) {
        Write-Host "GhostFinger: MATCH FOUND (Multi-Window) [$title]. Forcing hack..."
        [Win32]::ForceForegroundWindow($hwnd)
        Start-Sleep -Milliseconds 250 
    } else {
        Write-Host "GhostFinger: MATCH FOUND (Active) [$title]"
        Start-Sleep -Milliseconds 150 
    }

    # Auditory confirmation that the script is alive and matched the window
    [System.Console]::Beep(880, 50)

    # Use native hardware key events instead of SendKeys to completely bypass Electron's filtering
    [HardwareKey]::PressAltEnter()
    Start-Sleep -Milliseconds 100
    [HardwareKey]::PressCtrlEnter()
    Start-Sleep -Milliseconds 50
    [HardwareKey]::PressEnter()
    
    Write-Host "Pulsed: NATIVE hardware keys sent to Window [$title]"
    $pulsedWindowsCount++
}

if ($pulsedWindowsCount -eq 0) {
    Write-Host "GhostFinger: Standby (No Match Found in any window)"
}


