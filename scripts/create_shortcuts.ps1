$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = "C:\Users\louis\OneDrive\Desktop"
$IconPath = "C:\Users\louis\OneDrive\Documents\GitHub\DevControl\public\icon.ico"

# Launcher Shortcut
$LauncherShortcut = $WshShell.CreateShortcut("$DesktopPath\Launch Zero HUD.lnk")
$LauncherShortcut.TargetPath = "C:\Users\louis\OneDrive\Documents\GitHub\DevControl\ZeroTouchLauncher.bat"
$LauncherShortcut.WorkingDirectory = "C:\Users\louis\OneDrive\Documents\GitHub\DevControl"
$LauncherShortcut.IconLocation = $IconPath
$LauncherShortcut.Save()

# Shutdown Shortcut
$ShutdownShortcut = $WshShell.CreateShortcut("$DesktopPath\Shutdown Zero HUD.lnk")
$ShutdownShortcut.TargetPath = "C:\Users\louis\OneDrive\Documents\GitHub\DevControl\ZeroTouchShutdown.bat"
$ShutdownShortcut.WorkingDirectory = "C:\Users\louis\OneDrive\Documents\GitHub\DevControl"
$ShutdownShortcut.IconLocation = $IconPath
$ShutdownShortcut.Save()

Write-Host "Shortcuts created successfully on your OneDrive Desktop!"
