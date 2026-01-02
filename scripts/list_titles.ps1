Get-Process | Where-Object { $_.MainWindowTitle } | Select-Object -Property Name, MainWindowTitle | Format-List
