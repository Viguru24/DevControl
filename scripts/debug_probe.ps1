Add-Type @'
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    public class Win32 {
        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")]
        public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
    }
'@

function Get-ActiveWindowTitle {
    $hwnd = [Win32]::GetForegroundWindow()
    $sb = New-Object -TypeName System.Text.StringBuilder -ArgumentList 256
    [Win32]::GetWindowText($hwnd, $sb, $sb.Capacity) | Out-Null
    return $sb.ToString()
}

Clear-Host
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "       ZERO TOUCH DIAGNOSTIC PROBE (v1.0)         " -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Keep this window visible."
Write-Host "2. Click on your target window (Agent Manager, etc.)."
Write-Host "3. Watch the log below to see EXACTLY what detected."
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

while ($true) {
    $active = Get-ActiveWindowTitle
    $ts = Get-Date -Format "HH:mm:ss"
    
    if ($active -ne $lastActive) {
        Write-Host "[$ts] ACTIVE WINDOW: " -NoNewline -ForegroundColor Gray
        Write-Host "'$active'" -ForegroundColor Green
        $lastActive = $active
    }
    
    Start-Sleep -Milliseconds 500
}
