# Research Studies Data Management

This guide explains how to add research studies to the Bird Brain repository while keeping data private.

## Workflow

### 1. **Create/Edit CSV File**
Use the template provided: `research_template.csv`

**Columns:**
- `id` - Unique identifier (e.g., `study-001`, `study-interviews-2024`)
- `title` - Study name
- `date` - Study date (YYYY-MM-DD or YYYY-MM format)
- `methodology` - Type of research (Qualitative, Evaluative, Observational, Desk Research, etc.)
- `description` - Brief description of the study
- `participants` - Number/type of participants
- `researcher` - Researcher name(s)
- `summary` - 2-3 sentence summary of key findings
- `tags` - Comma-separated keywords (e.g., `interviews,accessibility,qualitative`)
- `key_findings` - Key findings (can be comma or period-separated)

### 2. **Example CSV Entry**
```csv
study-interviews-001,Interviews with Birders,2024-01,Qualitative,"In-depth interviews exploring mindful birding experiences","6 participants (4 BLV, 2 Sighted)","Dr. Jane Smith","Users want audio-focused experiences. Accessibility is critical for inclusive design.","interviews,accessibility,birding-by-ear,qualitative","Finding 1: Audio cues are essential. Finding 2: Accessibility features enable participation. Finding 3: Community engagement matters."
```

### 3. **Import into Database**
```bash
python3 import_studies.py your_research.csv
```

Or with custom database:
```bash
python3 import_studies.py your_research.csv /path/to/database.db
```

### 4. **Keep It Private**
- ✓ CSV files are in `.gitignore` → won't be committed to Git
- ✓ Only the import script is in the repo
- ✓ Share the CSV via email/Slack, not GitHub
- ✓ Anyone can import it locally without public exposure

## Sharing with Others

**For team members:**
1. Give them `research_template.csv` to fill in
2. They send you the completed CSV
3. You run `python3 import_studies.py their_file.csv`
4. Data loads into your local database
5. Never gets committed to Git

## Data Lives Locally

- All imported studies stay in `bird_brain.db` (also in `.gitignore`)
- Database is not public
- CSV files are temporary imports, not committed
- Backend serves this data to the frontend

## Questions?
The import script will:
- ✓ Create the `studies` table if it doesn't exist
- ✓ Parse tags and convert to JSON format for database
- ✓ Report how many studies were successfully imported
- ✓ Alert you to any errors during import
