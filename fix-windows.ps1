# One-click Windows fix for the Maruf Billah portfolio.
# Run from PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\fix-windows.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Project root: $projectRoot"
Write-Host ""
Write-Host "Removing old dependencies and build cache..." -ForegroundColor Cyan
Remove-Item -Recurse -Force "node_modules", ".next", "tsconfig.tsbuildinfo" -ErrorAction SilentlyContinue

Write-Host "Verifying npm cache..." -ForegroundColor Cyan
npm cache verify

Write-Host ""
Write-Host "Installing Windows-compatible dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "Starting Next.js with Webpack..." -ForegroundColor Green
Write-Host "Open http://localhost:3000 in your browser (do not paste the URL into PowerShell)." -ForegroundColor Yellow
Write-Host "Press Ctrl+C in this terminal to stop the server." -ForegroundColor Yellow
Write-Host ""
npm run dev
