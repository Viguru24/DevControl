Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    public class User32 {
        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")]
        public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
    }
'@

function Get-ActiveWindowTitle {
    $hwnd = [User32]::GetForegroundWindow()
    $sb = New-Object -TypeName System.Text.StringBuilder -ArgumentList 256
    [User32]::GetWindowText($hwnd, $sb, $sb.Capacity) | Out-Null
    return $sb.ToString()
}

$flagPath = Join-Path $PSScriptRoot "AUTOPILOT_ACTIVE.tmp"
Write-Host "GhostFinger: Checking flag at [$flagPath]"
if (-not (Test-Path $flagPath)) {
    Write-Host "GhostFinger: Flag NOT found. Exiting."
    exit
}

$activeTitle = Get-ActiveWindowTitle
Write-Host "GhostFinger: Active Window is [$activeTitle]"

$targets = @("Antigravity - Task", "Walkthrough", "Antigravity", "Cosmo-Clan", "Review Changes", "Implementation Plan")
Write-Host "GhostFinger: Starting Scan for targets..."

# 1. If we are ALREADY in a target window, pulse it immediately and EXIT
# This prevents jumping between multiple open Antigravity windows.
foreach ($t in $targets) {
    if ($activeTitle -like "*$t*") {
        Write-Host "GhostFinger: MATCH FOUND (Active) [$activeTitle] via keyword [$t]"
        [System.Windows.Forms.SendKeys]::SendWait("%{ENTER}")
        Start-Sleep -Milliseconds 100
        [System.Windows.Forms.SendKeys]::SendWait("^{ENTER}")
        Start-Sleep -Milliseconds 100
        [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
        exit
    }
}

# 2. If we are NOT in a target window, try to find one to pulse
# We will only do this if the user isn't in a "Protected" app (optional)
# For now, let's find the first visible Antigravity window.

$wshell = New-Object -ComObject WScript.Shell
foreach ($t in $targets) {
    # Write-Host "Checking background target: $t"
    if ($wshell.AppActivate($t)) {
        Write-Host "GhostFinger: MATCH FOUND (Background) keyword [$t]"
        Start-Sleep -Milliseconds 400
        [System.Windows.Forms.SendKeys]::SendWait("%{ENTER}")
        Start-Sleep -Milliseconds 100
        [System.Windows.Forms.SendKeys]::SendWait("^{ENTER}")
        Start-Sleep -Milliseconds 100
        [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
        Write-Host "GhostFinger: Pulsing background window [$t]"
        break
    }
}
