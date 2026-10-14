# Bird Brain Backend Setup Guide

## System Requirements

- **Python**: 3.9 - 3.12 (Python 3.13+ support coming soon)
- **OS**: macOS, Linux, or Windows with WSL2
- **RAM**: Minimum 4GB (8GB+ recommended for ML models)

## Installation Steps

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Upgrade pip

```bash
pip install --upgrade pip setuptools wheel
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start Backend Server

```bash
python main.py
```

The backend will be available at `http://localhost:8000`

## Troubleshooting

### Python Version Issues

If you have multiple Python versions installed:

```bash
# Check your Python version
python3 --version

# Use specific version if available
python3.11 -m venv venv  # If Python 3.11 is installed
```

### Dependency Installation Fails

If pip install fails:

```bash
# Clear pip cache
pip cache purge

# Upgrade pip, setuptools, wheel first
pip install --upgrade pip setuptools wheel

# Try install again
pip install -r requirements.txt
```

### Ollama Model Download

The backend requires Ollama models to be running:

```bash
# Install Ollama from https://ollama.ai
# Then pull required models:
ollama pull mistral
ollama pull nomic-embed-text
ollama pull qwen2:7b
```

Ensure Ollama is running before starting the backend.

## Environment Variables

Create a `.env` file in the backend directory (optional):

```bash
# Backend configuration
PYTHONUNBUFFERED=1
```

## Database Setup

The backend creates SQLite databases automatically on first run:
- `bird_brain.db` - Main research database
- `lancedb/` - Vector search database

No manual setup needed!

## Testing Backend Connection

```bash
# Test if backend is running
curl http://localhost:8000/health

# Should return: {"status":"ok"}
```
