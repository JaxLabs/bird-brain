# Security & Data Privacy Policy

## CRITICAL: Research Data Protection

**This repository contains CODE ONLY. NO RESEARCH DATA should ever be committed to GitHub.**

### What is FORBIDDEN to commit:
- ❌ `research_data_filled.csv` or any populated research data files
- ❌ `bird_brain.db` (SQLite database with all research data)
- ❌ `lancedb/` directory (vector database)
- ❌ `.env` files with sensitive credentials
- ❌ Any files containing participant information, interviews, or findings
- ❌ API keys, tokens, or passwords

### What IS safe to commit:
- ✅ Source code (.py, .tsx, .ts files)
- ✅ Configuration files (without secrets)
- ✅ `research_template.csv` (empty template only)
- ✅ Documentation files

### Data Storage
- **Local machine**: Keep all research data (`bird_brain.db`, `lancedb/`) in local directories only
- **Backup**: Use encrypted external drives or secure cloud storage (NOT GitHub, NOT Dropbox unencrypted)
- **Access**: Only authorized researchers can access the data

### Pre-commit Hooks
A git pre-commit hook automatically prevents committing sensitive files:
```bash
.git/hooks/pre-commit
```

If you accidentally try to commit research data, the hook will block it with a clear error message.

### If Data is Accidentally Committed
1. **IMMEDIATELY** notify the team
2. Use BFG Repo-Cleaner to remove from history (see git history cleaning script)
3. Force push to update remote repository
4. Rotate any exposed credentials

### Incident Log
- **2026-10-14**: `research_data_filled.csv` found in repo, purged from all Git history using BFG

---

**Last Updated**: 2026-10-14
**Status**: FULLY SECURED - Data cleaned from GitHub
