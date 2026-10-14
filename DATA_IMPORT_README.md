# Importing Research Data

To populate Bird Brain with research studies, you'll need a CSV file with the research data.

## Getting the Data File

The research data is kept private and **not in the public repository** for security reasons.

**To get the data file:**
1. Download `merlin_research_data.csv` from the shared Google Drive folder
2. Place it in the root of the Bird Brain repository (same folder as this README)

## Quick Start

### Step 1: Prepare the Data File

- Download `merlin_research_data.csv` from Google Drive
- Save it in the Bird Brain repository root (same level as this file)

### Step 2: Set Up the Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# OR
venv\Scripts\activate.bat        # Windows

pip install -r requirements.txt
```

### Step 3: Import the Data

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

### Step 4: Start the Backend

```bash
python main.py
```

Wait until you see: `Uvicorn running on http://127.0.0.1:8000`

### Step 5: Start the Frontend (in a new terminal)

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

## Creating Your Own Data

To import your own research:

1. Create a CSV file with the same column structure as `merlin_research_data.csv`
2. Run: `python import_studies.py your_file.csv bird_brain.db`
3. See [INSTALLATION.md](INSTALLATION.md) for more details on the data format

## Troubleshooting

**"File not found" error**
- Make sure `merlin_research_data.csv` is in the repository root directory
- Check that you're running the import command from the `backend/` folder

**"no such table" error**
- The import script automatically creates the database schema
- If this happens, delete `bird_brain.db` and try again

**Import is slow**
- First import takes longer (AI models generating headlines)
- Subsequent imports are much faster

## Data Security

⚠️ **Important:** The research data is sensitive and should be kept private.

- ✅ Keep the CSV file in secure storage (Google Drive, encrypted drives)
- ✅ Share only with authorized team members
- ❌ Never commit the CSV to public repositories
- ❌ Never share the CSV file publicly

The import script is in the public repository, but the actual research data is shared separately via secure channels.

## Questions?

See [INSTALLATION.md](INSTALLATION.md) or [README.md](README.md) for more details.
