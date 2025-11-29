# PowerShell script to create .env files
# Run this script: .\setup-env.ps1

Write-Host "Setting up environment files..." -ForegroundColor Green

# Create backend .env if it doesn't exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend/.env..." -ForegroundColor Yellow
    @"
# Server Configuration
NODE_ENV=development
PORT=5000
SERVER_URL=http://localhost:5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_system_db
DB_USER=postgres
DB_PASSWORD=Pass_1234

# JWT Configuration
JWT_SECRET=25e4f6a9-d04b-4972-8784-369e67171889
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-change-in-production

# Rate Limiting
LOGIN_ATTEMPT_LIMIT=5
LOGIN_WINDOW_MS=600000

# 2FA (Optional)
TWO_FACTOR_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@authsystem.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
    Write-Host "✓ Created backend/.env" -ForegroundColor Green
    Write-Host "⚠ Please update DB_PASSWORD and JWT_SECRET in backend/.env" -ForegroundColor Yellow
} else {
    Write-Host "✓ backend/.env already exists" -ForegroundColor Green
}

# Create frontend .env if it doesn't exist
if (-not (Test-Path "frontend\.env")) {
    Write-Host "Creating frontend/.env..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath "frontend\.env" -Encoding utf8
    Write-Host "✓ Created frontend/.env" -ForegroundColor Green
} else {
    Write-Host "✓ frontend/.env already exists" -ForegroundColor Green
}

Write-Host "`nEnvironment files setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/.env with your PostgreSQL password" -ForegroundColor White
Write-Host "2. Create database: Use pgAdmin or run create_db.sql" -ForegroundColor White
Write-Host "3. Run: npm run seed" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White

