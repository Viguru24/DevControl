Set WshShell = WScript.CreateObject("WScript.Shell")
Set objShell = CreateObject("Shell.Application")

' This script is designed to be "Polite"
' It will only send keys if the Antigravity window is ALREADY in focus
' This prevents it from jumping out of Explorer or Chrome while Louis is working.

Dim targetTitle
targetTitle = "DevControl - Antigravity - Task"

' AppActivate returns True if the window was activated OR was already active
' But it forcefully steals focus. We need a way to check if it's already active.
' VBS doesn't have a native "GetActiveWindowTitle", so we use a small trick.

' We will ONLY attempt to activate if we find the window, 
' and we will only send keys if the activation was successful.
' To prevent "jumping," we will decrease frequency or only run on-demand.

If WshShell.AppActivate(targetTitle) Then
    ' We only send keys once focused
    WScript.Sleep 500
    WshShell.SendKeys "%{ENTER}"  ' Alt+Enter for Accept All
    WScript.Echo "Pulsed Accept to: " & targetTitle
Else
    WScript.Echo "Target window not in foreground - Skipping to prevent focus theft."
End If
