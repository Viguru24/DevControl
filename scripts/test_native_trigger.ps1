$Host.UI.RawUI.WindowTitle = "DevControl - Native Trigger Tester"

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class HardwareTestKey {
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

Clear-Host
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "     NATIVE HARDWARE KEY SIMULATOR TEST           " -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "GOAL: Test if Chromium accepts 'Ghost' OS-level inputs." -ForegroundColor Yellow
Write-Host ""
Write-Host "INSTRUCTIONS:"
Write-Host "1. Have your Antigravity window open and ready."
Write-Host "2. Make sure the 'Run Alt+Enter' prompt is visible."
Write-Host "3. You have 5 seconds to click on the Antigravity window to focus it."
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

for ($i = 5; $i -gt 0; $i--) {
    Write-Host "FIRING IN $i..." -ForegroundColor Red
    [System.Console]::Beep(440, 100)
    Start-Sleep -Seconds 1
}

Write-Host ">>> PENETRATING BROWSER SECURITY <<<" -ForegroundColor Green
[System.Console]::Beep(880, 200)

Write-Host "Sending Native Alt+Enter..." -ForegroundColor Gray
[HardwareTestKey]::PressAltEnter()
Start-Sleep -Milliseconds 150

Write-Host "Sending Native Ctrl+Enter..." -ForegroundColor Gray
[HardwareTestKey]::PressCtrlEnter()
Start-Sleep -Milliseconds 150

Write-Host "Sending Native Enter..." -ForegroundColor Gray
[HardwareTestKey]::PressEnter()

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "SEQUENCE COMPLETE. Did the button click?" -ForegroundColor White
Start-Sleep -Seconds 5
