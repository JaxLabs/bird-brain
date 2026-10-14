#!/bin/bash
# Bird Brain Setup Script for macOS and Linux

set -e

echo "🐦 Bird Brain - Research Repository Setup"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
MAJOR_VERSION=$(echo $PYTHON_VERSION | cut -d. -f1)
MINOR_VERSION=$(echo $PYTHON_VERSION | cut -d. -f2)

echo "Found Python $PYTHON_VERSION"

if [ "$MAJOR_VERSION" -lt 3 ] || ([ "$MAJOR_VERSION" -eq 3 ] && [ "$MINOR_VERSION" -lt 9 ]); then
    echo "❌ Error: Python 3.9+ required (found $PYTHON_VERSION)"
    exit 1
fi

# Create virtual environment
echo ""
echo "Creating virtual environment..."
if [ -d "venv" ]; then
    echo "⚠️  Virtual environment already exists. Skipping creation."
else
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip, setuptools, wheel
echo ""
echo "Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Check for Ollama
echo ""
echo "Checking for Ollama installation..."
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is installed"
    echo "📥 Downloading required models (this may take a few minutes)..."
    ollama pull mistral
    ollama pull nomic-embed-text
    ollama pull qwen2:7b
else
    echo "⚠️  Ollama is not installed"
    echo "Install from: https://ollama.ai"
    echo "After installation, run: ollama pull mistral nomic-embed-text qwen2:7b"
fi

# Final summary
echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Ensure Ollama is running: ollama serve"
echo "2. Start backend: cd backend && source ../venv/bin/activate && python main.py"
echo "3. In another terminal: cd frontend && npm run dev"
echo ""
echo "Backend will be available at: http://localhost:8000"
echo "Frontend will be available at: http://localhost:3000"
