@echo off
echo ============================================
echo    BookMyShow Clone - Installation Script
echo ============================================
echo.

echo Step 1: Installing Node.js dependencies...
echo.
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    echo Please make sure Node.js is installed
    pause
    exit /b 1
)

echo.
echo ✅ Node.js dependencies installed successfully!
echo.

echo Step 2: Setting up environment file...
if not exist ".env" (
    copy ".env.example" ".env"
    echo.
    echo ⚠️  Please edit the .env file with your database credentials
    echo.
    echo Edit the following lines in .env file:
    echo DB_PASSWORD=your_mysql_password_here
    echo.
) else (
    echo ✅ .env file already exists
)

echo.
echo Step 3: Database Setup Instructions
echo.
echo Please follow these steps to set up the database:
echo.
echo 1. Open MySQL command line or phpMyAdmin
echo 2. Create a database named 'bookmyshow_db'
echo    SQL: CREATE DATABASE bookmyshow_db;
echo 3. Import the schema file:
echo    SQL: USE bookmyshow_db;
echo    SQL: SOURCE database/schema.sql;
echo.
echo Alternatively, run this command (replace password):
echo mysql -u root -p bookmyshow_db < database/schema.sql
echo.

echo Step 4: Starting the application...
echo.
echo To start the application:
echo 1. Make sure MySQL is running
echo 2. Open a new terminal
echo 3. Run: npm start
echo.
echo The application will be available at:
echo 🌐 http://localhost:5000
echo 📡 API: http://localhost:5000/api/movies
echo.
echo Press any key to start the application now...
pause >nul

echo.
echo Starting the server...
echo.
npm start