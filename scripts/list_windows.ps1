Get-Process | Where-Object { $_.MainWindowTitle } | Select-Object MainWindowTitle, ProcessName | Format-Table -AutoSize
