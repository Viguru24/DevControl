Set WshShell = WScript.CreateObject("WScript.Shell")

' High-Priority Title Matching for the Antigravity Chat Window
Dim targets
targets = Array("DevControl - Antigravity - Task", "DevControl - Antigravity", "Antigravity", "Visual Studio Code")

Dim found
found = False

For Each t In targets
    If WshShell.AppActivate(t) Then
        WScript.Sleep 1000 ' Give Windows time to handle switching
        
        ' Sequence to confirm "Accept All" or "Continue"
        WshShell.SendKeys "%{ENTER}"  ' Alt+Enter
        WScript.Sleep 200
        WshShell.SendKeys "^{ENTER}"  ' Ctrl+Enter
        WScript.Sleep 200
        WshShell.SendKeys "{ENTER}"   ' Plain Enter
        
        WScript.Echo "Pulsed Accept Signals to: " & t
        found = True
        Exit For
    End If
Next

If Not found Then
    WScript.Echo "Standard Chat Window not detected."
End If
