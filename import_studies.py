#!/usr/bin/env python3
"""
Import research studies from CSV into Bird Brain database + LanceDB search index
"""

import csv
import sqlite3
import json
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

def extract_docx_text(docx_path):
    """Extract text from .docx file"""
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            xml_content = zip_ref.read('word/document.xml')
            root = ET.fromstring(xml_content)
            namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            paragraphs = []
            for paragraph in root.findall('.//w:p', namespace):
                texts = []
                for text_elem in paragraph.findall('.//w:t', namespace):
                    if text_elem.text:
                        texts.append(text_elem.text)
                if texts:
                    paragraphs.append(''.join(texts))
            return '\n'.join(paragraphs)
    except:
        return ""

def extract_text_from_file(file_path):
    """Extract text from document file (docx, txt, etc.)"""
    path = Path(file_path)

    if not path.exists():
        return ""

    if path.suffix.lower() == '.docx':
        return extract_docx_text(path)
    elif path.suffix.lower() == '.txt':
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except:
            return ""

    return ""

def import_studies_from_csv(csv_path, db_path="bird_brain.db"):
    """Import studies from CSV file into SQLite database"""

    if not Path(csv_path).exists():
        print(f"❌ CSV file not found: {csv_path}")
        return False

    if not Path(db_path).exists():
        print(f"❌ Database not found: {db_path}")
        return False

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Create studies table with links
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS studies (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                date TEXT,
                methodology TEXT,
                description TEXT,
                participants TEXT,
                researcher TEXT,
                summary TEXT,
                tags TEXT,
                key_findings TEXT,
                full_content TEXT,
                transcript_path TEXT,
                findings_path TEXT,
                additional_links TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        imported_count = 0
        csv_dir = Path(csv_path).parent

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                try:
                    study_id = row.get('id')
                    title = row.get('title')

                    # Parse tags
                    tags = row.get('tags', '').split(',') if row.get('tags') else []
                    tags = [t.strip() for t in tags]

                    # Extract content from linked documents
                    full_content = row.get('summary', '')

                    transcript_path = row.get('transcript_path', '').strip()
                    if transcript_path:
                        full_path = csv_dir / transcript_path
                        if full_path.exists():
                            transcript_text = extract_text_from_file(full_path)
                            full_content += f"\n\n--- Transcript ---\n{transcript_text[:2000]}"
                            print(f"  📄 Extracted transcript: {transcript_path}")

                    findings_path = row.get('findings_path', '').strip()
                    if findings_path:
                        full_path = csv_dir / findings_path
                        if full_path.exists():
                            findings_text = extract_text_from_file(full_path)
                            full_content += f"\n\n--- Findings Report ---\n{findings_text[:2000]}"
                            print(f"  📄 Extracted findings: {findings_path}")

                    # Parse additional links (comma-separated)
                    additional_links = row.get('additional_links', '')
                    links_list = [link.strip() for link in additional_links.split(',') if link.strip()]

                    cursor.execute('''
                        INSERT OR REPLACE INTO studies
                        (id, title, date, methodology, description, participants,
                         researcher, summary, tags, key_findings, full_content,
                         transcript_path, findings_path, additional_links)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        study_id,
                        title,
                        row.get('date'),
                        row.get('methodology'),
                        row.get('description'),
                        row.get('participants'),
                        row.get('researcher'),
                        row.get('summary'),
                        json.dumps(tags),
                        row.get('key_findings'),
                        full_content,
                        transcript_path,
                        findings_path,
                        json.dumps(links_list)
                    ))

                    imported_count += 1
                    print(f"✓ Imported: {title}")

                except Exception as e:
                    print(f"⚠ Error importing row: {e}")
                    continue

        conn.commit()
        conn.close()

        print(f"\n✅ Successfully imported {imported_count} studies!")
        print("💡 Tip: Studies are now searchable by the AI when answering questions")
        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    import sys

    csv_file = sys.argv[1] if len(sys.argv) > 1 else "research_studies.csv"
    db_file = sys.argv[2] if len(sys.argv) > 2 else "bird_brain.db"

    print(f"📥 Importing studies from: {csv_file}")
    print(f"📦 Database: {db_file}\n")

    import_studies_from_csv(csv_file, db_file)
