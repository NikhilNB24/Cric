param(
  [switch]$Web,
  [int]$FrontendPort = 19006
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $root "backend"
$mobilePath = Join-Path $root "mobile"
$mobileCommand = if ($Web) {
  "npm.cmd run web -- --port $FrontendPort --clear"
} else {
  "npm.cmd run start"
}

Write-Host "Starting CRIC backend and mobile dev servers in this terminal..."
Write-Host "Backend: http://localhost:3000"
if ($Web) {
  Write-Host "Frontend web: http://localhost:$FrontendPort"
} else {
  Write-Host "Mobile: Expo dev server"
}
Write-Host "Press Ctrl+C to stop both processes."

$jobs = @()

function Write-JobLine {
  param(
    [string]$JobName,
    [string]$Line
  )

  if ($JobName -eq "mobile" -and $Line -match "^Web .+% \(.+\)$") {
    return
  }

  Write-Host "[$JobName] $Line"
}

try {
  $jobs += Start-Job -Name "backend" -ScriptBlock {
    param($Path)
    Set-Location $Path
    cmd.exe /c "npm.cmd run start:dev 2>&1"
  } -ArgumentList $backendPath

  $jobs += Start-Job -Name "mobile" -ScriptBlock {
    param($Path, $Command)
    Set-Location $Path
    $env:NO_COLOR = "1"
    $env:FORCE_COLOR = "0"
    cmd.exe /c "$Command 2>&1"
  } -ArgumentList $mobilePath, $mobileCommand

  while ($true) {
    foreach ($job in $jobs) {
      Receive-Job -Job $job | ForEach-Object {
        Write-JobLine -JobName $job.Name -Line $_
      }

      if ($job.State -notin @("Running", "NotStarted")) {
        Receive-Job -Job $job | ForEach-Object {
          Write-JobLine -JobName $job.Name -Line $_
        }

        throw "$($job.Name) dev server stopped with state $($job.State)."
      }
    }

    Start-Sleep -Milliseconds 250
  }
}
finally {
  Write-Host "Stopping CRIC dev servers..."
  $jobs | Stop-Job -ErrorAction SilentlyContinue
  $jobs | Remove-Job -Force -ErrorAction SilentlyContinue
}
