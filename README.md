# Bird Brain

A tool to explore research and ask questions about it.

## Install These First

Download and install:
1. [Node.js](https://nodejs.org)
2. [Python](https://python.org) (version 3.9 or newer)
3. [Ollama](https://ollama.ai)

Just click and install like any other app.

## How to Start

Open Terminal (search for "Terminal" in Spotlight or start menu).

**Terminal Window 1:**
```
cd ~/Desktop/ResearchRepositoryMerlin/bird-brain/backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn lancedb ollama
python -m uvicorn main:app --reload
```

Wait until you see `Uvicorn running on http://127.0.0.1:8000`

**Terminal Window 2:**
```
ollama serve
```

Leave it running.

**Terminal Window 3:**
```
cd ~/Desktop/ResearchRepositoryMerlin/bird-brain/frontend
npm install
npm run dev
```

Wait until you see `Local: http://localhost:3000`

**Open Browser:**
Go to http://localhost:3000

Done! You're in.

## What You Can Do

- **Repository** - Click through all the studies
- **Ask** - Type a question, find related studies
- **Click Links** - Opens documents

## Using Your Own Research

Put your research data in a CSV file (like Excel).

Then in Terminal:
```
cd ~/Desktop/ResearchRepositoryMerlin/bird-brain/backend
source venv/bin/activate
python3 import_studies.py yourfile.csv bird_brain.db
```

Restart the backend (Terminal 1: press Ctrl+C, then run the command again).

## Your Data is Private

Everything stays on your computer. Nobody can see it unless they have access to your machine.

---

Need help? Make sure all 3 Terminal windows are still running. Restart them if something breaks.
