# Monorepo Pre-flight Check Script for Windows PowerShell
Write-Host "🚀 Starting Zerify Monorepo Pre-flight Verification..." -ForegroundColor Cyan

# 1. Validate Prisma Schema
Write-Host "1. Validating Prisma Schema..." -ForegroundColor Yellow
Push-Location apps/backend
npx prisma validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma validation failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 2. Run NestJS Build
Write-Host "2. Building NestJS Backend..." -ForegroundColor Yellow
Push-Location apps/backend
npx nest build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 3. Run Turbo Lint
Write-Host "3. Running Turbo Lint..." -ForegroundColor Yellow
npx turbo lint

Write-Host "✅ All Pre-flight checks passed successfully!" -ForegroundColor Green
