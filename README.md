# Bird Brain

A tool to explore research and ask questions about it.

## Quick Start (Recommended)

### macOS/Linux
```bash
git clone https://github.com/JaxLabs/bird-brain.git
cd bird-brain
chmod +x setup.sh
./setup.sh
```

### Windows
```batch
git clone https://github.com/JaxLabs/bird-brain.git
cd bird-brain
setup.bat
```

The script will automatically:
- ✅ Check your Python version
- ✅ Create a virtual environment
- ✅ Install all dependencies
- ✅ Download AI models
- ✅ Show you next steps

**For detailed instructions or if the script doesn't work, see [INSTALLATION.md](INSTALLATION.md)**

## Manual Setup (Alternative)

### Prerequisites

Download and install:
1. [Node.js](https://nodejs.org) (version 16+)
2. [Python](https://python.org) (version 3.9 - 3.13)
3. [Ollama](https://ollama.ai)

### Step-by-Step

Open Terminal (search for "Terminal" in Spotlight or start menu).

**Terminal Window 1 - Backend:**
```bash
cd bird-brain/backend
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# OR
venv\Scripts\activate.bat        # Windows

pip install --upgrade pip
pip install -r requirements.txt
python main.py
```

Wait until you see `Uvicorn running on http://127.0.0.1:8000`

**Terminal Window 2 - Ollama:**
```bash
ollama serve
```

Leave it running (this provides AI models).

**Terminal Window 3 - Frontend:**
```bash
cd bird-brain/frontend
npm install
npm run dev
```

Wait until you see `Local: http://localhost:3000`

**Open Browser:**
Go to http://localhost:3000 ✅

## What You Can Do

- **Repository** - Click through all the studies
- **Ask** - Type a question, find related studies
- **Click Links** - Opens documents

## Using Your Own Research

Put your research data in a CSV file (like Excel).

Then in Terminal:
```
cd ~/bird-brain/backend
source venv/bin/activate
python3 import_studies.py yourfile.csv bird_brain.db
```

Restart the backend (Terminal 1: press Ctrl+C, then run the command again).

## Your Data is Private

Everything stays on your computer. Nobody can see it unless they have access to your machine.

See [SECURITY.md](SECURITY.md) for details.

## Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Detailed setup guide with troubleshooting (12+ common issues)
- **[PYTHON_313_ROADMAP.md](PYTHON_313_ROADMAP.md)** - Python 3.13 compatibility information
- **[SECURITY.md](SECURITY.md)** - Data protection and privacy policy
- **[backend/README_SETUP.md](backend/README_SETUP.md)** - Backend-specific setup guide

## Troubleshooting

**Something's not working?**

1. Make sure all 3 Terminal windows are running (backend, Ollama, frontend)
2. Check that you have Python 3.9+ installed: `python3 --version`
3. Check that Ollama is running: `curl http://localhost:11434/api/tags`
4. Check that backend is running: `curl http://localhost:8000/health`
5. See [INSTALLATION.md](INSTALLATION.md) for 12+ common issues and fixes

**Setup script failed?**

See [INSTALLATION.md](INSTALLATION.md) for detailed manual setup instructions for your operating system.

---

Need more help? All common issues and solutions are covered in [INSTALLATION.md](INSTALLATION.md).
