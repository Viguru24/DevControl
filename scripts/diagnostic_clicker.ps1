Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

function Get-PixelColor($x, $y) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, 1, 1)
    $bmp = New-Object System.Drawing.Bitmap(1, 1)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.CopyFromScreen($rect.Location, [System.Drawing.Point]::Empty, $rect.Size)
    $color = $bmp.GetPixel(0, 0)
    $graphics.Dispose()
    $bmp.Dispose()
    return $color
}

function Send-Click($x, $y) {
    $setCursor = @'
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")]
    public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);
'@
    $win32 = Add-Type -MemberDefinition $setCursor -Name "Win32Mouse" -PassThru
    $win32::SetCursorPos($x, $y)
    $win32::mouse_event(0x0002, $x, $y, 0, 0) # Left Down
    $win32::mouse_event(0x0004, $x, $y, 0, 0) # Left Up
}

Clear-Host
Write-Host "--- GHOST FINGER: PIXEL SEEKER ---" -ForegroundColor Cyan
Write-Host "Scanning screen for the Blue 'Accept' Button..." -ForegroundColor White

# Target Color: The specific blue from the prompt (approx #007bff)
$targetR = 0
$targetG = 120
$targetB = 215 # Typical Windows/VSCode Blue
$tolerance = 30

$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$width = $screen.Width
$height = $screen.Height

# We scan the right half of the screen where the prompt usually lives
$startX = [int]($width / 2)
$startY = 0
$endX = $width
$endY = $height

Write-Host "Scanning region: $startX, $startY to $endX, $endY" -ForegroundColor Gray

$found = $false
for ($y = $startY; $y -lt $endY; $y += 20) {
    for ($x = $startX; $x -lt $endX; $x += 20) {
        $color = Get-PixelColor $x $y
        
        # Check if it matches our Blue
        if ([Math]::Abs($color.R - $targetR) -lt $tolerance -and 
            [Math]::Abs($color.G - $targetG) -lt $tolerance -and 
            [Math]::Abs($color.B - $targetB) -lt $tolerance) {
            
            Write-Host "POTENTIAL MATCH at $x, $y (Color: $($color.R),$($color.G),$($color.B))" -ForegroundColor Green
            
            # Micro-scan for the cluster (Confirm it's a button, not just a random pixel)
            $hitCount = 0
            for ($iy = -5; $iy -le 5; $iy += 2) {
                for ($ix = -5; $ix -le 5; $ix += 2) {
                    $c2 = Get-PixelColor ($x + $ix) ($y + $iy)
                    if ([Math]::Abs($c2.R - $targetR) -lt $tolerance -and 
                        [Math]::Abs($c2.G - $targetG) -lt $tolerance -and 
                        [Math]::Abs($c2.B - $targetB) -lt $tolerance) {
                        $hitCount++
                    }
                }
            }
            
            if ($hitCount -gt 15) {
                Write-Host "BUTTON CONFIRMED! Clicking..." -ForegroundColor Cyan
                Send-Click $x $y
                $found = $true
                break
            }
        }
    }
    if ($found) { break }
}

if (-not $found) {
    Write-Host "FAILED: Could not find the blue button color on screen." -ForegroundColor Red
    Write-Host "PRO TIP: Make sure the 'Accept' button is visible when you run this!" -ForegroundColor Yellow
}
