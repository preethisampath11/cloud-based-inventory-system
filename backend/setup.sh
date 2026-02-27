#!/bin/bash
# setup.sh - Pharmacy Inventory System Setup Script
# Run this script to set up the project

echo "=========================================="
echo "Pharmacy Inventory System - Setup"
echo "=========================================="
echo ""

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 2: Create .env file
echo "Step 2: Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env file created from .env.example"
    echo "⚠️  Please update .env with your MongoDB URI and JWT_SECRET"
else
    echo "⚠️  .env file already exists, skipping..."
fi
echo ""

# Step 3: Create logs directory
echo "Step 3: Creating logs directory..."
mkdir -p logs
echo "✅ Logs directory created"
echo ""

# Step 4: Display next steps
echo "=========================================="
echo "Setup Complete! Next Steps:"
echo "=========================================="
echo ""
echo "1. Update .env file with:"
echo "   - MONGODB_URI: Your MongoDB Atlas connection string"
echo "   - JWT_SECRET: A strong random secret key"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:5000/api/health"
echo ""
echo "4. Read the documentation:"
echo "   - QUICK_REFERENCE.md - Quick API reference"
echo "   - AUTHENTICATION.md - Detailed auth guide"
echo "   - API_TESTING.md - Testing examples"
echo "   - INTEGRATION_GUIDE.md - How to use auth in your code"
echo ""
echo "=========================================="
