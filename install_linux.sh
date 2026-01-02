#!/bin/bash

echo "============================================"
echo "   BookMyShow Clone - Installation Script"
echo "============================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"

echo
echo "Step 1: Installing Node.js dependencies..."
echo
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

echo
echo "✅ Node.js dependencies installed successfully!"
echo

echo "Step 2: Setting up environment file..."
if [ ! -f ".env" ]; then
    cp ".env.example" ".env"
    echo
    echo "⚠️  Please edit the .env file with your database credentials"
    echo
    echo "Edit the following lines in .env file:"
    echo "DB_PASSWORD=your_mysql_password_here"
    echo
else
    echo "✅ .env file already exists"
fi

echo
echo "Step 3: Database Setup Instructions"
echo
echo "Please follow these steps to set up the database:"
echo
echo "1. Open MySQL command line:"
echo "   mysql -u root -p"
echo
echo "2. Create and use the database:"
echo "   CREATE DATABASE bookmyshow_db;"
echo "   USE bookmyshow_db;"
echo
echo "3. Import the schema:"
echo "   SOURCE database/schema.sql;"
echo
echo "Or run this single command:"
echo "mysql -u root -p bookmyshow_db < database/schema.sql"
echo

echo "Step 4: Starting the application..."
echo
echo "To start the application:"
echo "1. Make sure MySQL is running"
echo "2. Open a new terminal"
echo "3. Run: npm start"
echo
echo "The application will be available at:"
echo "🌐 http://localhost:5000"
echo "📡 API: http://localhost:5000/api/movies"
echo

read -p "Do you want to start the application now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo
    echo "Starting the server..."
    echo
    npm start
fi