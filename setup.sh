#!/bin/bash

echo "🚀 Setting up Superior Blog Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please ensure PostgreSQL is installed and running."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials and secrets!"
    echo "   Generate a secret with: openssl rand -base64 32"
    read -p "Press enter when you've configured .env..."
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p public/uploads
touch public/uploads/.gitkeep

# Push database schema
echo "🗄️  Setting up database..."
npm run db:push

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Default login credentials:"
echo "   Admin: admin@blog.com / admin123"
echo "   Author: author@blog.com / author123"
echo ""
echo "🚀 Start the development server with: npm run dev"
echo "🌐 Then visit: http://localhost:3000"
echo ""
