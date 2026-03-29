Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

function Find-And-Click-Button($windowTitlePattern, $buttonNamePattern) {
    $root = [System.Windows.Automation.AutomationElement]::RootElement
    
    # Find all windows matching the pattern
    $condition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, $windowTitlePattern)
    $windows = $root.FindAll([System.Windows.Automation.TreeScope]::Children, $condition)
    
    foreach ($win in $windows) {
        Write-Host "Checking Window: $($win.Current.Name)"
        
        # Search for buttons in this window
        $btnCondition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::Button)
        $buttons = $win.FindAll([System.Windows.Automation.TreeScope]::Descendants, $btnCondition)
        
        foreach ($btn in $buttons) {
            Write-Host "  Found Button: $($btn.Current.Name)"
            if ($btn.Current.Name -match $buttonNamePattern) {
                Write-Host "  MATCH! Attempting Invoke..." -ForegroundColor Green
                try {
                    $invokePattern = $btn.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
                    $invokePattern.Invoke()
                    return $true
                } catch {
                    Write-Host "  Invoke failed: $_" -ForegroundColor Red
                }
            }
        }
    }
    return $false
}

Write-Host "--- UIA PROBE ---"
$success = Find-And-Click-Button "*Task*" ".*Accept.*|.*Confirm.*|.*Approve.*|.*Continue.*"
if ($success) {
    Write-Host "Successfully invoked button via UIA!" -ForegroundColor Green
} else {
    Write-Host "No matching button found via UIA." -ForegroundColor Yellow
}
