# Bird Brain Installation Guide

Complete setup instructions for all operating systems.

## Quick Start (macOS/Linux)

```bash
# Clone the repository
git clone https://github.com/JaxLabs/bird-brain.git
cd bird-brain

# Run setup script
chmod +x setup.sh
./setup.sh
```

## Quick Start (Windows)

```batch
# Open Command Prompt or PowerShell
# Navigate to the bird-brain directory
cd bird-brain

# Run setup script
setup.bat
```

## Manual Setup

### 1. System Requirements

- **Python**: 3.9 - 3.13
- **Node.js**: 16+ (for frontend)
- **Ollama**: For AI models
- **RAM**: 4GB minimum (8GB+ recommended)
- **Disk Space**: 5GB+ for models

### 2. Install Prerequisites

#### macOS
```bash
# Using Homebrew
brew install python@3.11 node ollama

# Or visit https://ollama.ai for manual installation
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv nodejs npm
# Download Ollama from https://ollama.ai
```

#### Windows
- Download Python 3.11 from https://www.python.org/downloads/
- Download Node.js from https://nodejs.org/
- Download Ollama from https://ollama.ai/

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate        # macOS/Linux
# OR
venv\Scripts\activate.bat        # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Verify installation
npm run build
```

### 5. Download AI Models

```bash
# Ensure Ollama is running
ollama serve

# In another terminal, download models:
ollama pull mistral
ollama pull nomic-embed-text
ollama pull qwen2:7b

# Total download: ~15-20GB
```

### 6. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate    # macOS/Linux
# OR
venv\Scripts\activate.bat    # Windows

python main.py
# Server runs at http://localhost:8000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# App runs at http://localhost:3000
```

## Troubleshooting

### Python Version Issues
```bash
# Check installed versions
python3 --version
python3.11 --version  # If you have multiple versions

# Use specific version
python3.11 -m venv venv
```

### Pip Installation Fails
```bash
# Clear pip cache
pip cache purge

# Upgrade pip first
pip install --upgrade pip setuptools wheel

# Try again
pip install -r requirements.txt
```

### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Ollama Models Not Found
```bash
# Ensure Ollama daemon is running
ollama serve  # Run in separate terminal

# Verify connection
curl http://localhost:11434/api/tags

# If failed, install/reinstall Ollama
# Visit https://ollama.ai/
```

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:8000/health

# Verify CORS is enabled
# Check backend logs for errors
# Ensure port 8000 is not in use
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows
```

## Environment Variables (Optional)

Create `backend/.env`:
```
PYTHONUNBUFFERED=1
OLLAMA_HOST=http://localhost:11434
```

## Verifying Installation

```bash
# Backend health check
curl http://localhost:8000/health
# Expected: {"status":"ok"}

# Frontend health check
# Visit http://localhost:3000 in browser
```

## Next Steps

1. **Add Research Data**
   - Place CSV files in `backend/` directory
   - Use the import functionality

2. **Configure Settings**
   - Adjust AI models in backend/main.py
   - Customize frontend appearance

3. **Deploy**
   - See DEPLOYMENT.md for production setup

## Support

- Issues? Check `.gitignore` to see protected data directories
- Security docs: See SECURITY.md
- Python 3.13 issues? See PYTHON_313_ROADMAP.md
