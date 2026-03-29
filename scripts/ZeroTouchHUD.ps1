Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Automation;

public class HardwareKey {
    [DllImport("user32.dll")]
    private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    private const byte VK_MENU = 0x12;    // ALT
    private const byte VK_RETURN = 0x0D;  // ENTER
    private const byte VK_CONTROL = 0x11; // CTRL
    private const uint KEYEVENTF_KEYUP = 0x0002;

    public static void AltHack() {
        keybd_event(VK_MENU, 0, 0, UIntPtr.Zero);
        Thread.Sleep(50);
        keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }

    public static void PressAltEnter() {
        // Alt Down
        keybd_event(VK_MENU, 0, 0, UIntPtr.Zero);
        Thread.Sleep(150);
        // Enter Down
        keybd_event(VK_RETURN, 0, 0, UIntPtr.Zero);
        Thread.Sleep(150);
        // Enter Up
        keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        Thread.Sleep(150);
        // Alt Up
        keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }

    public static void PressCtrlEnter() {
        // Ctrl Down
        keybd_event(VK_CONTROL, 0, 0, UIntPtr.Zero);
        Thread.Sleep(150);
        // Enter Down
        keybd_event(VK_RETURN, 0, 0, UIntPtr.Zero);
        Thread.Sleep(150);
        // Enter Up
        keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        Thread.Sleep(150);
        // Ctrl Up
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }

    public static bool TryGhostClick(string windowTitle) {
        try {
            // 1. Get Root
            AutomationElement root = AutomationElement.RootElement;
            
            // 2. Find the window
            PropertyCondition condName = new PropertyCondition(AutomationElement.NameProperty, windowTitle);
            AutomationElement win = root.FindFirst(TreeScope.Children, condName);
            
            if (win == null) return false;

            // 3. Search for names common in Antigravity/DevControl
            string[] buttons = { "Accept", "Confirm", "Approve", "Continue", "Procede", "Yes" };
            
            foreach (string bName in buttons) {
                PropertyCondition condBtn = new PropertyCondition(AutomationElement.NameProperty, bName);
                AutomationElement btn = win.FindFirst(TreeScope.Descendants, condBtn);
                
                if (btn != null) {
                    object pattern;
                    if (btn.TryGetCurrentPattern(InvokePattern.Pattern, out pattern)) {
                        ((InvokePattern)pattern).Invoke();
                        return true;
                    }
                }
            }
            return false;
        } catch {
            return false;
        }
    }
}
"@ -ReferencedAssemblies "UIAutomationClient", "UIAutomationTypes", "System.Windows.Forms"

# --- HUD VIEW CONFIG ---
$hudWidth = 240
$hudHeight = 120
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$posX = $screen.Width - $hudWidth - 20
$posY = 20

# UI State
$global:isPulsing = $false
$global:foundTarget = ""
$global:triggerCount = 0
$global:lastMethod = "NONE"

# Assembly Load Check
[void][System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")
[void][System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")

$form = New-Object Windows.Forms.Form
$form.Text = "Zero-Touch HUD"
$form.Size = New-Object Drawing.Size($hudWidth, $hudHeight)
$form.StartPosition = "Manual"
$form.Location = New-Object Drawing.Point($posX, $posY)
$form.FormBorderStyle = "None"
$form.TopMost = $true
$form.BackColor = [Drawing.Color]::FromArgb(15, 15, 20) # Deep Dark
$form.Opacity = 0.95

# Round Corners
$path = New-Object Drawing.Drawing2D.GraphicsPath
$rect = New-Object Drawing.Rectangle(0, 0, $hudWidth, $hudHeight)
$radius = 20
$path.AddArc($rect.X, $rect.Y, $radius, $radius, 180, 90)
$path.AddArc($rect.Right - $radius, $rect.Y, $radius, $radius, 270, 90)
$path.AddArc($rect.Right - $radius, $rect.Bottom - $radius, $radius, $radius, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $radius, $radius, $radius, 90, 90)
$form.Region = New-Object Drawing.Region($path)

# UI Elements
$lblTitle = New-Object Windows.Forms.Label
$lblTitle.Text = "ZERO-TOUCH AUTOPILOT"
$lblTitle.ForeColor = [Drawing.Color]::White
$lblTitle.Font = New-Object Drawing.Font("Segoe UI Semibold", 9)
$lblTitle.Size = New-Object Drawing.Size($hudWidth, 30)
$lblTitle.TextAlign = "MiddleCenter"
$lblTitle.Location = New-Object Drawing.Point(0, 10)
$form.Controls.Add($lblTitle)

$orb = New-Object Windows.Forms.Panel
$orb.Size = New-Object Drawing.Size(24, 24)
$orb.Location = New-Object Drawing.Point(108, 45)
$orb.BackColor = [Drawing.Color]::FromArgb(40, 40, 50)
$orbPath = New-Object Drawing.Drawing2D.GraphicsPath
$orbPath.AddEllipse(0, 0, 24, 24)
$orb.Region = New-Object Drawing.Region($orbPath)
$form.Controls.Add($orb)

$lblStatus = New-Object Windows.Forms.Label
$lblStatus.Text = "SEARCHING..."
$lblStatus.ForeColor = [Drawing.Color]::Gray
$lblStatus.Font = New-Object Drawing.Font("Consolas", 8)
$lblStatus.Size = New-Object Drawing.Size($hudWidth, 20)
$lblStatus.TextAlign = "MiddleCenter"
$lblStatus.Location = New-Object Drawing.Point(0, 75)
$form.Controls.Add($lblStatus)

$lblStats = New-Object Windows.Forms.Label
$lblStats.Text = "TRG: 0 | METHOD: -"
$lblStats.ForeColor = [Drawing.Color]::DarkCyan
$lblStats.Font = New-Object Drawing.Font("Segoe UI", 8)
$lblStats.Size = New-Object Drawing.Size($hudWidth, 20)
$lblStats.TextAlign = "MiddleCenter"
$lblStats.Location = New-Object Drawing.Point(0, 95)
$form.Controls.Add($lblStats)

# --- DETECTION ENGINE ---
$targets = @("DevControl - Task", "Antigravity - Task", "Walkthrough", "DevControl - Antigravity", "Antigravity", "Viguru", "Visual Studio Code")

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll", CharSet=CharSet.Auto)] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count);
}
"@

function Get-ActiveWindowTitle {
    $hwnd = [Win32]::GetForegroundWindow()
    $sb = New-Object System.Text.StringBuilder 256
    [void][Win32]::GetWindowText($hwnd, $sb, $sb.Capacity)
    return $sb.ToString()
}

$timer = New-Object Windows.Forms.Timer
$timer.Interval = 800 # High frequency
$timer.Add_Tick({
    if ($global:isPulsing) { return }

    $activeWindow = Get-ActiveWindowTitle
    $matchFound = $false
    foreach ($t in $targets) {
        if ($activeWindow -like "*$t*") {
            $matchFound = $true
            $global:foundTarget = $activeWindow
            break
        }
    }

    if ($matchFound) {
        $global:isPulsing = $true
        # Visual Update
        $orb.BackColor = [Drawing.Color]::White
        $lblStatus.Text = "TARGET ACQUIRED"
        $lblStatus.ForeColor = [Drawing.Color]::Cyan
        
        # --- ELITE TRIGGER SEQUENCE ---
        Start-ThreadJob -ScriptBlock {
            param($targetTitle)
            
            [console]::Beep(1200, 100)
            
            # Layer 1: Alt-Hack Focus
            [HardwareKey]::AltHack()
            Start-Sleep -Milliseconds 200

            # Layer 2: UIA Ghost Click (Direct Pattern Invoke)
            $success = [HardwareKey]::TryGhostClick($targetTitle)
            
            if ($success) {
                [console]::Beep(2400, 200)
                $method = "GHOST-TAP"
            } else {
                # Layer 3: Native Hardware Sequence (Alt+Enter + Ctrl+Enter)
                [HardwareKey]::PressAltEnter()
                [HardwareKey]::PressCtrlEnter()
                $method = "ALT-PULSE"
            }
            
            return $method
        } -ArgumentList $global:foundTarget | Wait-Job | Receive-Job | ForEach-Object {
            $global:lastMethod = $_
            $global:triggerCount++
        }

        # Reset Pulse State
        Start-Sleep -Seconds 1 # Safety Cooldown
        $global:isPulsing = $false
        $orb.BackColor = [Drawing.Color]::FromArgb(40, 40, 50)
        $lblStatus.Text = "WAITING FOR NEXT..."
        $lblStatus.ForeColor = [Drawing.Color]::Gray
        $lblStats.Text = "TRG: $($global:triggerCount) | METHOD: $($global:lastMethod)"
    } else {
        $orb.BackColor = [Drawing.Color]::FromArgb(40, 40, 50)
        $lblStatus.Text = "SEARCHING..."
        $lblStatus.ForeColor = [Drawing.Color]::Gray
    }
})

$form.Add_Shown({
    $timer.Start()
})

$form.ShowDialog()
