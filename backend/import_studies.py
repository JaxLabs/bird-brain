#!/usr/bin/env python3
"""
Import studies from a CSV file into the Bird Brain database.

Usage:
    python import_studies.py <csv_file> [db_file]

Example:
    python import_studies.py merlin_research_data.csv bird_brain.db
"""

import sys
import csv
import json
import sqlite3
import re
from models import Study, Demographic, Quote, Document

def init_database(db_file: str):
    """Initialize database schema if it doesn't exist"""
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    schema_commands = [
        """CREATE TABLE IF NOT EXISTS studies (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            research_type TEXT NOT NULL,
            methodology TEXT NOT NULL,
            topic TEXT NOT NULL,
            interaction TEXT NOT NULL,
            participants INTEGER NOT NULL,
            researcher TEXT NOT NULL,
            summary TEXT NOT NULL,
            transcript_link TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )""",
        """CREATE TABLE IF NOT EXISTS study_features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
            feature TEXT NOT NULL,
            UNIQUE (study_id, feature)
        )""",
        """CREATE TABLE IF NOT EXISTS study_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
            tag TEXT NOT NULL,
            UNIQUE (study_id, tag)
        )""",
        """CREATE TABLE IF NOT EXISTS demographics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            age_range TEXT
        )""",
        """CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
            text TEXT NOT NULL,
            participant TEXT,
            timestamp TEXT
        )""",
        """CREATE TABLE IF NOT EXISTS starting_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
            question TEXT NOT NULL
        )""",
        """CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
            doc_type TEXT NOT NULL,
            file_url TEXT NOT NULL
        )"""
    ]

    for command in schema_commands:
        try:
            cursor.execute(command)
        except sqlite3.OperationalError:
            pass

    conn.commit()
    conn.close()

def parse_participants(value: str) -> int:
    """Extract participant count from various formats"""
    if not value or not value.strip():
        return 0

    try:
        return int(value.strip())
    except ValueError:
        pass

    match = re.search(r'(\d+)', value.replace(',', ''))
    if match:
        return int(match.group(1))

    return 0

def import_from_csv(csv_file, db_file="bird_brain.db"):
    """Import studies from CSV file into SQLite database"""

    init_database(db_file)

    studies_count = 0
    errors = []

    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row_num, row in enumerate(reader, start=2):
                try:
                    tags = json.loads(row.get('tags', '[]'))
                    features = json.loads(row.get('features', '[]'))
                    demographics_list = json.loads(row.get('demographics', '[]'))
                    quotes_list = json.loads(row.get('directQuotes', '[]'))
                    documents_list = json.loads(row.get('documents', '[]'))
                    questions_list = json.loads(row.get('startingQuestions', '[]'))

                    demographics = [
                        Demographic(role=d.get('role', ''), age_range=d.get('age_range'))
                        for d in demographics_list
                    ]

                    quotes = [
                        Quote(text=q.get('text', ''), participant=q.get('participant'), timestamp=q.get('timestamp'))
                        for q in quotes_list
                    ]

                    documents = [
                        Document(doc_type=d.get('doc_type', 'Research Report'), file_url=d.get('file_url', ''))
                        for d in documents_list
                    ]

                    study = Study(
                        id=row['id'].strip(),
                        title=row['title'].strip(),
                        date=row['date'].strip(),
                        researchType=row.get('researchType', 'Qual').strip(),
                        methodology=row['methodology'].strip(),
                        topic=row['topic'].strip(),
                        interaction=row.get('interaction', 'Moderated').strip(),
                        participants=parse_participants(row.get('participants', '0')),
                        researcher=row['researcher'].strip(),
                        summary=row['summary'].strip(),
                        tags=tags,
                        features=features,
                        demographics=demographics,
                        directQuotes=quotes,
                        documents=documents,
                        startingQuestions=questions_list,
                        transcriptLink=row.get('transcriptLink', '').strip() or None
                    )

                    insert_study(study, db_file)
                    studies_count += 1
                    print(f"✅ Imported: {study.title}")

                except Exception as e:
                    error_msg = f"Row {row_num}: {str(e)}"
                    errors.append(error_msg)
                    print(f"❌ {error_msg}")

        print(f"\n{'='*60}")
        print(f"Import complete: {studies_count} studies imported")
        if errors:
            print(f"Errors encountered: {len(errors)}")
            for err in errors:
                print(f"  - {err}")
        else:
            print("No errors!")
        print(f"{'='*60}")

    except FileNotFoundError:
        print(f"❌ Error: File '{csv_file}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error reading CSV file: {str(e)}")
        sys.exit(1)

def insert_study(study: Study, db_file: str = "bird_brain.db"):
    """Insert a single study into the database"""
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()

    try:
        cur.execute("SELECT id FROM studies WHERE id = ?", (study.id,))
        if cur.fetchone():
            print(f"⚠️  Skipping {study.id} - already exists in database")
            conn.close()
            return

        cur.execute("""
            INSERT INTO studies (id, title, date, research_type, methodology, topic,
                                  interaction, participants, researcher, summary, transcript_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (study.id, study.title, study.date, study.researchType, study.methodology,
              study.topic, study.interaction, study.participants, study.researcher,
              study.summary, study.transcriptLink))

        for feature in study.features:
            cur.execute("INSERT INTO study_features (study_id, feature) VALUES (?, ?)",
                         (study.id, feature.strip()))

        for tag in study.tags:
            cur.execute("INSERT INTO study_tags (study_id, tag) VALUES (?, ?)",
                         (study.id, tag.strip().lower()))

        for demo in study.demographics:
            cur.execute("INSERT INTO demographics (study_id, role, age_range) VALUES (?, ?, ?)",
                         (study.id, demo.role, demo.age_range))

        for q in study.directQuotes:
            cur.execute("INSERT INTO quotes (study_id, text, participant, timestamp) VALUES (?, ?, ?, ?)",
                         (study.id, q.text, q.participant, q.timestamp))

        for question in study.startingQuestions:
            cur.execute("INSERT INTO starting_questions (study_id, question) VALUES (?, ?)",
                         (study.id, question))

        for doc in study.documents:
            cur.execute("INSERT INTO documents (study_id, doc_type, file_url) VALUES (?, ?, ?)",
                         (study.id, doc.doc_type, doc.file_url))

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_studies.py <csv_file> [db_file]")
        print("Example: python import_studies.py merlin_research_data.csv bird_brain.db")
        sys.exit(1)

    csv_file = sys.argv[1]
    db_file = sys.argv[2] if len(sys.argv) > 2 else "bird_brain.db"

    import_from_csv(csv_file, db_file)
