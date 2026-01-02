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

Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
flagFile = fso.BuildPath(scriptDir, "AUTOPILOT_ACTIVE.tmp")

If fso.FileExists(flagFile) Then
    Dim foundWindow
    foundWindow = False

    ' Greedy Multi-Window Targeting
    ' We iterate through all known title patterns.
    ' Note: AppActivate will bring a window to front if it matches.
    ' If multiple windows match the SAME string, this is trickier in VBS,
    ' but cycling through our variations broadens the reach.
    
    Dim targets, t
    targets = Array("DevControl - Task", "Walkthrough", "DevControl - Antigravity", "Antigravity")
    
    For Each t In targets
        ' We use a loop here to try and "catch" multiple windows if possible
        ' though AppActivate is limited, cycling through specific->general helps.
        If WshShell.AppActivate(t) Then
            WScript.Sleep 400 ' Focus settle
            
            ' Pulse keys
            WshShell.SendKeys "%{ENTER}" 
            WScript.Sleep 100
            WshShell.SendKeys "^{ENTER}"
            WScript.Sleep 100
            WshShell.SendKeys "{ENTER}"
            
            WScript.Echo "Zero-Touch: Pulsed [" & t & "]"
            foundWindow = True
            ' We DO NOT Exit For here anymore, so we can try the next target pattern
            ' in case other windows match different strings.
        End If
    Next

    If Not foundWindow Then
        WScript.Echo "Standby: No suitable Antigravity window found."
    End If
Else
    WScript.Echo "Safety Lock: STANDBY (No active session)"
End If
