$wshell = New-Object -ComObject WScript.Shell
Add-Type -AssemblyName System.Windows.Forms

Clear-Host
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "       ZERO TOUCH 'SUPER PULSE' TEST              " -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "GOAL: Force that 'Accept' button to click." -ForegroundColor Yellow
Write-Host ""
Write-Host "1. You have 5 seconds."
Write-Host "2. Click on the Agent Manager window."
Write-Host "3. Watch the 'Accept' button."
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

for ($i = 5; $i -gt 0; $i--) {
    Write-Host "FIRING IN $i..." -ForegroundColor Red
    [System.Console]::Beep(440, 100)
    Start-Sleep -Seconds 1
}

Write-Host ">>> FIRING SUPER SEQUENCE <<<" -ForegroundColor Green
[System.Console]::Beep(880, 200)

# Try Method 1: Alt+Enter (The standard)
Write-Host "Trying: Alt+Enter..." -ForegroundColor Gray
[System.Windows.Forms.SendKeys]::SendWait("%{ENTER}")
Start-Sleep -Milliseconds 200

# Try Method 2: Just Enter (The submit)
Write-Host "Trying: Enter..." -ForegroundColor Gray
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Milliseconds 200

# Try Method 3: 'A' key (Accept shortcut)
Write-Host "Trying: 'A' Key..." -ForegroundColor Gray
[System.Windows.Forms.SendKeys]::SendWait("a")
Start-Sleep -Milliseconds 200

# Try Method 4: 'Y' key (Yes shortcut)
Write-Host "Trying: 'Y' Key..." -ForegroundColor Gray
[System.Windows.Forms.SendKeys]::SendWait("y")

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "SEQUENCE COMPLETE." -ForegroundColor White
Write-Host "Did the button click?"
