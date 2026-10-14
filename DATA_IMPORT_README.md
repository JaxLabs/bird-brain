# Importing Research Data

This directory contains `merlin_research_data.csv`, a complete export of all research studies that you can use to populate Bird Brain with the same data.

## Quick Start

### Step 1: Set Up the Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# OR
venv\Scripts\activate.bat        # Windows

pip install -r requirements.txt
```

### Step 2: Import the Data

```bash
python import_studies.py ../merlin_research_data.csv bird_brain.db
```

You'll see output like:
```
✅ Imported: Merlin Instagram Analysis
✅ Imported: Social Media Desk Ticket Analysis
...
============================================================
Import complete: 8 studies imported
No errors!
============================================================
```

### Step 3: Start the Backend

```bash
python main.py
```

Wait until you see: `Uvicorn running on http://127.0.0.1:8000`

### Step 4: Start the Frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Go to http://localhost:3000 and you'll see all the research!

## What's in the CSV?

The `merlin_research_data.csv` file contains:
- **8 studies** from the Merlin and birding research projects
- All study metadata (title, date, methodology, topic, etc.)
- All related data (demographics, quotes, documents, tags, features)
- AI-generated headlines and key findings

The CSV format is optimized for re-importing into Bird Brain:
- Complex fields (tags, features, demographics, etc.) are stored as JSON
- All participant counts and descriptions are normalized
- Document types are preserved as-is

## Advanced: Custom Data

To import your own research instead:

1. Create a CSV file with the same column structure as `merlin_research_data.csv`
2. Run: `python import_studies.py your_file.csv bird_brain.db`
3. See [INSTALLATION.md](INSTALLATION.md) for more details on the data format

## Troubleshooting

**"File not found" error**
- Make sure `merlin_research_data.csv` is in the same directory as where you're running the import command

**"no such table" error**
- The import script automatically creates the database schema, so this shouldn't happen
- If it does, delete `bird_brain.db` and try again

**Import is slow**
- The first import takes longer because AI models are generating headlines
- Subsequent imports are faster

## Questions?

See [INSTALLATION.md](INSTALLATION.md) or [README.md](README.md) for more details.
