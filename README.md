# Bird Brain - Research Explorer

A simple tool to explore research studies and ask questions about them using AI.

## What You Need

Before you start, download and install these three things:

1. **Node.js** → Go to [nodejs.org](https://nodejs.org) and download the latest version
2. **Python** → Go to [python.org](https://python.org) and download Python 3.9 or newer
3. **Ollama** → Go to [ollama.ai](https://ollama.ai) and download Ollama

Once installed, just click to run them. Don't worry about what they do.

## Step 1: Open Terminal

Click the Finder, search for "Terminal" and open it.

## Step 2: Go to the Folder

Copy and paste this into Terminal:
```
cd ~/Desktop/ResearchRepositoryMerlin/bird-brain
```

Press Enter.

## Step 3: Start Ollama

This needs to run in the background. Open a **new** Terminal window and type:
```
ollama serve
```

Press Enter and leave it running.

## Step 4: Start the Backend

In your original Terminal, copy and paste:
```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn lancedb ollama
python -m uvicorn main:app --reload
```

Press Enter and wait until you see: `Uvicorn running on http://127.0.0.1:8000`

## Step 5: Start the Frontend

Open a **third** Terminal window and copy/paste:
```
cd ~/Desktop/ResearchRepositoryMerlin/bird-brain/frontend
npm install
npm run dev
```

Press Enter and wait until you see: `Local: http://localhost:3000`

## Step 6: Open Your Browser

Go to [http://localhost:3000](http://localhost:3000) in your browser.

That's it! You should see the app.

## What to Do

- **Repository Tab** - Browse all the studies, click on them to see details
- **Ask Tab** - Type a question and the AI will find relevant studies
- **Click Documents** - Opens the Google Drive links (if you have access)

## Adding Your Own Research

To use your own research data instead of the default:

1. Create a spreadsheet (Excel, Google Sheets, or CSV)
2. Follow the format from `research_studies.csv` 
3. In Terminal, run:
```
cd ~/Desktop/ResearchRepositoryMerlin/bird-brain/backend
source venv/bin/activate
python3 import_studies.py your_file.csv bird_brain.db
```

Then restart the backend (Terminal where it's running - press Ctrl+C, then run the command again).

## Having Problems?

**App won't load?**
- Make sure all 3 Terminal windows are still running
- Check Ollama is open (you should see it in your dock/menu)
- Try refreshing your browser (Cmd+R on Mac)

**Getting error about "failed to fetch"?**
- Make sure Ollama is running
- Close and reopen all 3 Terminal windows
- Start from Step 3 again

**Can't find Terminal?**
- Press Cmd+Space (Mac) or Windows key (PC)
- Type "Terminal" and press Enter

---

**Your data is private.** Everything stays on your computer. Nobody can access it unless they have your computer.
