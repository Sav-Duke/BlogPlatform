@echo off
echo 🚀 Setting up Superior Blog Platform...

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js found
node --version

:: Install dependencies
echo 📦 Installing dependencies...
call npm install

:: Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your database credentials and secrets!
    pause
)

:: Create uploads directory
echo 📁 Creating uploads directory...
if not exist public\uploads mkdir public\uploads
type nul > public\uploads\.gitkeep

:: Push database schema
echo 🗄️  Setting up database...
call npm run db:push

:: Seed database
echo 🌱 Seeding database with sample data...
call npm run db:seed

echo.
echo ✨ Setup complete!
echo.
echo 📝 Default login credentials:
echo    Admin: admin@blog.com / admin123
echo    Author: author@blog.com / author123
echo.
echo 🚀 Start the development server with: npm run dev
echo 🌐 Then visit: http://localhost:3000
echo.
pause
