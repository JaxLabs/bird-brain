# Bird Brain - Research Repository with AI Chat

A searchable research archive with AI-powered question answering. Store research studies, transcripts, and findings—then search them intelligently through chat.

## 📦 What You're Getting

```
bird-brain/
├── frontend/              # Next.js React app (port 3000)
├── backend/               # FastAPI server (port 8000)
├── bird_brain.db         # SQLite database (stores research)
├── research_template.csv # Template for your research
├── import_studies.py     # Script to load data
└── RESEARCH_DATA_README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` → You should see the app!

## 📚 Adding Research Studies

### Step 1: Prepare Your Data

Create a CSV file with your research. Use `research_template.csv` as a template.

**Columns:**
| Column | Description | Example |
|--------|-------------|---------|
| `id` | Unique ID | `study-001` |
| `title` | Study name | `Interviews with Birders` |
| `date` | Study date | `2024-01` |
| `methodology` | Research type | `Qualitative` |
| `description` | Brief description | `In-depth user interviews...` |
| `participants` | Participant info | `6 people (4 BLV, 2 sighted)` |
| `researcher` | Researcher name(s) | `Dr. Jane Smith` |
| `summary` | Key insight | `Users prioritize audio over visuals...` |
| `tags` | Keywords (comma-separated) | `interviews,accessibility,audio` |
| `key_findings` | Main takeaways | `Finding 1. Finding 2. Finding 3.` |
| `transcript_path` | Path to transcript | `../Research/Interviews/P1.pdf` |
| `findings_path` | Path to findings report | `../Research/Interviews/report.pdf` |
| `additional_links` | External URLs (comma-separated) | `https://example.com/study,https://docs.google.com/xyz` |

### Step 2: Example CSV Entry

```csv
study-interviews-001,Interviews with Birders,2024-01,Qualitative,"Exploring mindful birding with accessibility focus","6 participants (4 BLV, 2 sighted)","Dr. Jane Smith, Dr. Alex Lee","Users want audio-first experiences. Accessibility enables inclusive design.","interviews,qualitative,accessibility,audio","Finding 1: Audio cues are essential. Finding 2: Accessibility features enable broader participation. Finding 3: Community engagement is motivating.","../Research/Interviews/transcripts/P1_transcript.pdf","../Research/Interviews/findings_report.pdf","https://example.com/full-study,https://drive.google.com/file/d/xyz"
```

### Step 3: Add Document References

If you're providing a research folder alongside this code:

```
research/
├── Interviews/
│   ├── transcripts/
│   │   ├── P1_transcript.pdf
│   │   ├── P2_transcript.pdf
│   │   └── P3_transcript.pdf
│   ├── findings_report.pdf
│   └── interview_notes.docx
├── Co-design/
│   ├── session_notes.docx
│   └── workshop_findings.pdf
└── Field Observations/
    ├── observations_summary.docx
    └── photos/
```

In your CSV, reference these with relative paths:
```csv
../research/Interviews/transcripts/P1_transcript.pdf
../research/Co-design/workshop_findings.pdf
```

### Step 4: Import the Data

```bash
python3 import_studies.py your_research.csv
```

**Output:**
```
📥 Importing studies from: your_research.csv
📦 Database: bird_brain.db

✓ Imported: Interviews with Birders
  📄 Extracted transcript: ../research/Interviews/P1_transcript.pdf
  📄 Extracted findings: ../research/Interviews/findings_report.pdf
✓ Imported: Co-design Sessions
  📄 Extracted findings: ../research/Co-design/workshop_findings.pdf

✅ Successfully imported 8 studies!
💡 Tip: Studies are now searchable by the AI when answering questions
```

## 💬 Using the App

### Ask Page (Chat Interface)

1. Open "Ask" tab
2. Type a question: *"What did users say about accessibility?"*
3. AI searches all your research
4. Returns:
   - AI-generated answer using study data
   - Relevant studies with links to source documents
   - Quotes from participants

### Repository Page

Browse all studies with:
- Filter by methodology, tags, researchers
- View study details
- Click links to transcripts and reports

### Add Research Page

Manually add studies through the UI (same fields as CSV)

## 🔒 Privacy & Sharing

**Your research stays private:**
- ✅ Database (`bird_brain.db`) is in `.gitignore`
- ✅ CSV files are in `.gitignore`
- ✅ Nothing gets pushed to GitHub
- ✅ Only the code framework is public

**To share with team:**
1. Give them this `bird-brain/` folder (code only)
2. Give them a `research.csv` file via email/Slack
3. Optionally include `research/` folder with documents
4. They run: `python3 import_studies.py research.csv`
5. Data loads into their local database

## 📋 File Types Supported

The import script can extract text from:
- **`.pdf`** - PDF documents
- **`.docx`** - Word documents
- **`.txt`** - Plain text files

External links can be:
- **URLs** - `https://example.com/study`
- **Google Drive** - `https://drive.google.com/file/d/xyz`
- **Local paths** - `../research/report.pdf`

## 🛠️ How It Works

```
User asks a question in Chat
         ↓
Backend searches LanceDB index
         ↓
Finds 3 most relevant studies
         ↓
Extracts quotes & key points
         ↓
AI generates answer using study data
         ↓
Returns answer + links to original sources
```

## 📁 Project Structure

```
bird-brain/
├── frontend/
│   ├── app/
│   │   ├── ask/page.tsx          # Chat interface
│   │   ├── repository/page.tsx   # Study browser
│   │   ├── add-research/page.tsx # Manual entry
│   │   └── globals.css           # Styling (Radio Canada font)
│   └── public/
│       └── images/icons/         # Icons & images
│
├── backend/
│   ├── main.py                   # FastAPI server
│   ├── models.py                 # Data models
│   ├── embeddings.py             # LanceDB setup
│   └── requirements.txt
│
├── bird_brain.db                 # SQLite database (LOCAL - not in Git)
├── research_template.csv         # CSV template (LOCAL - not in Git)
├── import_studies.py             # Import script
├── RESEARCH_DATA_README.md       # Detailed data guide
└── README.md                     # This file
```

## ⚙️ Environment Setup

### Create `.env` file (if needed)
```bash
# backend/.env
OLLAMA_BASE_URL=http://localhost:11434
DATABASE_URL=sqlite:///./bird_brain.db
```

### Dependencies

**Backend:**
- FastAPI - Web framework
- SQLite - Database
- LanceDB - Vector search
- Ollama - Local embeddings

**Frontend:**
- Next.js - React framework
- TypeScript - Type safety

## 🔄 Workflow: Team Collaboration

### Researcher A (You)
```bash
# 1. Create research CSV with documents
# research_data.csv + ../research/ folder

# 2. Send to Researcher B via email/Slack
# (both files/folder)
```

### Researcher B (Team Member)
```bash
# 1. Receive bird-brain/ folder and research_data.csv
# 2. Place research_data.csv in bird-brain/

# 3. Run import
python3 import_studies.py research_data.csv

# 4. Studies are now searchable in their local instance
# 5. Their instance stays private (not pushed to GitHub)
```

## 🧪 Testing the System

1. **Start servers** (see Quick Start)
2. **Import sample data:**
   ```bash
   python3 import_studies.py research_template.csv
   ```
3. **Ask a test question:**
   - Go to `http://localhost:3000`
   - Click "Ask"
   - Type: "What was studied?"
   - Should see results from your CSV

## 📊 Database Schema

### Studies Table
```sql
CREATE TABLE studies (
  id TEXT PRIMARY KEY,
  title TEXT,
  date TEXT,
  methodology TEXT,
  description TEXT,
  participants TEXT,
  researcher TEXT,
  summary TEXT,
  tags TEXT (JSON array),
  key_findings TEXT,
  full_content TEXT,
  transcript_path TEXT,
  findings_path TEXT,
  additional_links TEXT (JSON array),
  created_at TIMESTAMP
);
```

## ⚠️ Troubleshooting

### "CSV file not found"
```bash
# Make sure CSV is in same directory as import_studies.py
ls research_template.csv
```

### "Database not found"
```bash
# Backend must have created bird_brain.db
# Run backend once first
cd backend && uvicorn main:app --reload
```

### "No studies found when asking questions"
1. Check import worked: `python3 import_studies.py research.csv`
2. Verify documents exist at paths in CSV
3. Restart backend after import

### Document extraction failed
- Check file paths are correct (relative to bird-brain/)
- Ensure PDFs/DOCX files aren't corrupted
- Try with `.txt` files first to test

## 🚀 Deployment

To deploy:
1. Build frontend: `npm run build`
2. Deploy frontend to Vercel/Netlify
3. Deploy backend to cloud (Railway, Render, etc.)
4. Use cloud database (PostgreSQL instead of SQLite)
5. Keep research CSV/database private (never push)

## 📞 Support

**For issues:**
1. Check logs: `backend/` console output
2. Check browser console: F12 → Console tab
3. Verify CSV format matches template
4. Ensure all file paths exist

## 📝 License

Private research project. Keep all data and CSV files locally.

---

## Quick Reference

| Task | Command |
|------|---------|
| Start backend | `cd backend && uvicorn main:app --reload` |
| Start frontend | `cd frontend && npm run dev` |
| Import studies | `python3 import_studies.py your_file.csv` |
| View database | `sqlite3 bird_brain.db ".tables"` |
| Check imports | Open Ask tab and ask a question |

---

**Ready to add your research?** Start with `research_template.csv`!
