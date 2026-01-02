Set WshShell = WScript.CreateObject("WScript.Shell")
Set objShell = CreateObject("Shell.Application")

' Try multiple window title variations
Dim titles(3)
titles(0) = "DevControl - Antigravity - Walkthrough"
titles(1) = "Antigravity"
titles(2) = "DevControl - Antigravity"
titles(3) = "Walkthrough"

Dim found
found = False

For Each title In titles
    WScript.Echo "Trying: " & title
    On Error Resume Next
    activated = WshShell.AppActivate(title)
    On Error Goto 0
    
    If activated Then
        WScript.Echo "✅ SUCCESS with: " & title
        WScript.Sleep 500
        WshShell.SendKeys "%{ENTER}"
        WScript.Echo "Sent Alt+Enter"
        found = True
        Exit For
    End If
Next

If Not found Then
    WScript.Echo "❌ FAILED: Tried all variations"
    WScript.Echo "Window might be minimized or requires elevation"
End If
