# Bird Brain - Research Repository Setup Guide

A local research archive and AI assistant for exploring qualitative research studies about birding and accessibility.

## Prerequisites

- **Node.js** (v16+)
- **Python** (v3.9+)
- **Ollama** (for embeddings and LLM) - [Download](https://ollama.ai)

## Installation

### 1. Navigate to Project
```bash
cd bird-brain
```

### 2. Backend Setup

```bash
cd backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn lancedb ollama

# Start Ollama (in a separate terminal)
ollama serve
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 4. Load Research Data

The app comes with a CSV of research studies. To import them:

```bash
cd backend

# Activate venv if not already active
source venv/bin/activate

# Run import (requires Ollama running)
python3 import_studies.py research_studies.csv bird_brain.db
```

This creates:
- `bird_brain.db` - SQLite database with study metadata
- `lancedb/` - Vector search index for AI matching

## Running the App

1. **Start Ollama** (if not running):
   ```bash
   ollama serve
   ```

2. **Start Backend** (terminal 1):
   ```bash
   cd backend
   source venv/bin/activate
   python -m uvicorn main:app --reload
   ```

3. **Start Frontend** (terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

4. **Open in Browser**:
   ```
   http://localhost:3000
   ```

## Features

- **Repository**: Browse and filter research studies with collapsible details
- **Ask**: AI-powered search across research findings using natural language
- **Documents**: Click to open linked documents (Google Drive)
- **Participants**: View demographic information from studies

## Data Privacy & Security

⚠️ **Important**: This app is **local-only** and designed for a single user:
- ✅ No internet connectivity required
- ✅ All data stored locally on your machine
- ✅ No authentication needed (runs on your computer only)
- ✅ Backend only accepts connections from `localhost:3000`
- ✅ Google Drive links require proper access (won't load publicly)
- ✅ Database cannot be accessed remotely

**Note**: Anyone with access to your computer can view the data. This is a single-user local app.

## Customizing Research Data

To add your own studies, create a CSV with these columns:

```
id,title,date,methodology,description,participants,researcher,summary,tags,key_findings,artifact_1_label,artifact_1_type,artifact_1_url,...
```

Then run:
```bash
python3 import_studies.py your_file.csv bird_brain.db
```

## Troubleshooting

**"Failed to fetch" error in chat?**
- Ensure Ollama is running: `ollama serve`
- Check backend is running: `curl http://localhost:8000/health`

**"Table 'studies' not found"?**
- Run the import script: `python3 import_studies.py research_studies.csv bird_brain.db`

**Sidebar text cut off?**
- Restart the frontend: `npm run dev`

## Architecture

- **Frontend**: Next.js + React + TypeScript
- **Backend**: FastAPI + SQLite + LanceDB
- **AI**: Ollama (nomic-embed-text for embeddings, qwen3:8b for responses)
- **Search**: LanceDB vector database for semantic search

---

Built for local research exploration. No cloud, no sharing, no tracking. Your data stays on your machine.
