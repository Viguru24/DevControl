Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Keyboard {
    [DllImport("user32.dll", SetLastError = true)]
    private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    
    private const byte VK_MENU = 0x12; // Alt
    private const byte VK_RETURN = 0x0D; // Enter
    private const byte VK_CONTROL = 0x11; // Ctrl
    
    private const uint KEYEVENTF_KEYUP = 0x0002;

    public static void PressAltEnter() {
        // Press Alt
        keybd_event(VK_MENU, 0, 0, UIntPtr.Zero);
        System.Threading.Thread.Sleep(50);
        // Press Enter
        keybd_event(VK_RETURN, 0, 0, UIntPtr.Zero);
        System.Threading.Thread.Sleep(50);
        // Release Enter
        keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        System.Threading.Thread.Sleep(50);
        // Release Alt
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

Write-Host "Firing in 3..."
Start-Sleep -Seconds 1
Write-Host "Firing in 2..."
Start-Sleep -Seconds 1
Write-Host "Firing in 1..."
Start-Sleep -Seconds 1
Write-Host "Firing Alt+Enter natively..."
[Keyboard]::PressAltEnter()
Start-Sleep -Milliseconds 150
[Keyboard]::PressCtrlEnter()
Start-Sleep -Milliseconds 150
[Keyboard]::PressEnter()
Write-Host "Done."
