@echo off
REM Bird Brain Setup Script for Windows

echo.
echo 🐦 Bird Brain - Research Repository Setup
echo ==========================================
echo.

REM Check Python version
echo Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed or not in PATH
    echo Visit: https://www.python.org/downloads/
    exit /b 1
)

python --version

REM Create virtual environment
echo.
echo Creating virtual environment...
if exist "venv" (
    echo ⚠️  Virtual environment already exists. Skipping creation.
) else (
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        exit /b 1
    )
    echo ✅ Virtual environment created
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    exit /b 1
)

REM Upgrade pip, setuptools, wheel
echo.
echo Upgrading pip, setuptools, and wheel...
python -m pip install --upgrade pip setuptools wheel
if errorlevel 1 (
    echo ⚠️  Warning: Failed to upgrade pip packages
)

REM Install backend dependencies
echo.
echo Installing backend dependencies...
pip install -r backend\requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    exit /b 1
)
cd ..

REM Check for Node.js
where npm >nul 2>&1
if errorlevel 1 (
    echo ⚠️  npm is not installed or not in PATH
    echo Visit: https://nodejs.org/
)

REM Check for Ollama
echo.
echo Checking for Ollama installation...
where ollama >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Ollama is not installed
    echo Install from: https://ollama.ai
    echo After installation, run these commands in a terminal:
    echo   ollama pull mistral
    echo   ollama pull nomic-embed-text
    echo   ollama pull qwen2:7b
) else (
    echo ✅ Ollama is installed
    echo 📥 Downloading required models (this may take a few minutes)...
    call ollama pull mistral
    call ollama pull nomic-embed-text
    call ollama pull qwen2:7b
)

REM Final summary
echo.
echo ==========================================
echo ✅ Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Ensure Ollama is running: ollama serve
echo 2. Start backend: Open terminal, run: backend_start.bat
echo 3. Open another terminal: Run: frontend_start.bat
echo.
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
