# Research Studies Data Management

This guide explains how to add searchable research studies that integrate with the AI chat.

## How It Works

```
CSV File → Import Script → SQLite Database + Indexed Content
                                ↓
                        AI Search (when user asks questions)
                                ↓
                    Relevant Studies + Links in Chat Response
```

## Setup

### 1. **Create Research CSV File**

Use the template: `research_template.csv`

**Columns:**
- `id` - Unique identifier (e.g., `study-001`)
- `title` - Study name
- `date` - Study date (YYYY-MM-DD format)
- `methodology` - Research type (Qualitative, Evaluative, Observational, etc.)
- `description` - Brief description
- `participants` - Participant count/type
- `researcher` - Researcher name(s)
- `summary` - 2-3 sentence key insight
- `tags` - Comma-separated keywords (e.g., `interviews,accessibility`)
- `key_findings` - Key takeaways
- `transcript_path` - Path to transcript file (e.g., `../Research/Interviews/P1.pdf`)
- `findings_path` - Path to findings report (e.g., `../Research/Interviews/report.pdf`)
- `additional_links` - Comma-separated URLs or file paths

### 2. **Example CSV Entry**

```csv
study-001,Interviews with Birders,2024-01,Qualitative,"Exploring mindful birding","6 participants","Dr. Jane Smith","Users prioritize audio accessibility over visual features. Inclusive design enables broader participation.","interviews,accessibility,qualitative","Key finding 1. Key finding 2.","../Research/Interviews/transcripts.pdf","../Research/Interviews/findings.pdf","https://example.com/full-report"
```

### 3. **Import into Database**

```bash
python3 import_studies.py research_data.csv
```

**What the import script does:**
- ✓ Reads your CSV file
- ✓ Extracts text from linked PDF/DOCX files (transcripts & findings)
- ✓ Stores everything in `bird_brain.db`
- ✓ Creates searchable index of content
- ✓ Preserves links for reference

### 4. **How the AI Uses It**

When someone asks a question in the Chat:
1. Question gets embedded
2. Backend searches indexed content across all studies
3. Finds 3 most relevant studies
4. Returns those studies + their links
5. AI uses study content to answer the question
6. User sees answer + clickable links to original sources

## Privacy & Sharing

**Keep data private:**
- ✓ CSV files in `.gitignore` (won't commit to Git)
- ✓ Database in `.gitignore` (won't push to GitHub)
- ✓ Only import script is version controlled

**Share with team:**
1. Send them a CSV file (via email, Slack, etc.)
2. They run: `python3 import_studies.py their_file.csv`
3. Their local database gets the studies
4. No data ever reaches GitHub

## Example Workflow

**For research team:**
```bash
# Create your research CSV with links to documents
research_data.csv

# Import it
python3 import_studies.py research_data.csv

# Ask AI a question in the Chat
# → AI finds relevant studies automatically
# → Shows links to original transcripts/reports
```

## File Path Examples

**Relative paths (from bird-brain folder):**
```csv
../Research/Interviews/transcripts/P1.pdf
../Research/Co-design/findings_report.docx
../Shared Merlin MHCID capstone/Research/Interviews/report.pdf
```

**External URLs:**
```csv
https://example.com/study-report
https://drive.google.com/file/d/xyz
```

**Mixed (comma-separated):**
```csv
../Research/report.pdf,https://example.com/data,https://docs.google.com/xyz
```
