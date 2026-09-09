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
import subprocess
import sys

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

def create_embeddings_and_index(studies, db_path="bird_brain.db"):
    """Create LanceDB embeddings for all studies"""
    try:
        import lancedb
        try:
            import ollama
        except:
            print("⚠ Ollama not available - skipping embeddings")
            print("  (Make sure Ollama server is running on localhost:11434)")
            return

        # Create embedding for each study
        embeddings_data = []

        for study in studies:
            try:
                # Create embedding text from study content
                text = f"{study['title']}. {study['summary']}. {study['full_content']}"
                text = text[:2000]  # Limit to 2000 chars for embedding

                # Get embedding from Ollama
                response = ollama.embed(model="nomic-embed-text", input=text)
                embedding = response["embeddings"][0]

                embeddings_data.append({
                    "study_id": study["id"],
                    "title": study["title"],
                    "embedding": embedding,
                    "text": text
                })

                print(f"  📊 Embedded: {study['title']}")

            except Exception as e:
                print(f"  ⚠ Failed to embed {study['id']}: {e}")
                continue

        # Store in LanceDB
        if embeddings_data:
            db = lancedb.connect("./lancedb")
            table = db.create_table("studies", data=embeddings_data, mode="overwrite")
            print(f"\n✓ Created LanceDB index with {len(embeddings_data)} studies")

    except ImportError:
        print("⚠ LanceDB not available - studies will be in database but not searchable")
        print("  Install: pip install lancedb ollama")

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

        # Create studies table with all expected columns
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
                additional_links TEXT,
                research_type TEXT,
                topic TEXT,
                interaction TEXT,
                transcript_link TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create study_tags table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS study_tags (
                study_id TEXT,
                tag TEXT,
                FOREIGN KEY (study_id) REFERENCES studies(id)
            )
        ''')

        # Create study_features table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS study_features (
                study_id TEXT,
                feature TEXT,
                FOREIGN KEY (study_id) REFERENCES studies(id)
            )
        ''')

        # Create demographics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS demographics (
                study_id TEXT,
                role TEXT,
                age_range TEXT,
                FOREIGN KEY (study_id) REFERENCES studies(id)
            )
        ''')

        # Create quotes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quotes (
                study_id TEXT,
                text TEXT,
                participant TEXT,
                timestamp TEXT,
                FOREIGN KEY (study_id) REFERENCES studies(id)
            )
        ''')

        # Create documents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                study_id TEXT,
                doc_type TEXT,
                file_url TEXT,
                FOREIGN KEY (study_id) REFERENCES studies(id)
            )
        ''')

        # Create starting_questions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS starting_questions (
                study_id TEXT,
                question TEXT,
                FOREIGN KEY (study_id) REFERENCES studies(id)
            )
        ''')

        # Create collections table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS collections (
                id TEXT PRIMARY KEY,
                name TEXT,
                description TEXT
            )
        ''')

        # Create collection_studies table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS collection_studies (
                collection_id TEXT,
                study_id TEXT,
                FOREIGN KEY (collection_id) REFERENCES collections(id),
                FOREIGN KEY (study_id) REFERENCES studies(id)
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
                    links_list = []

                    # Process up to 10 artifacts (artifact_1, artifact_2, ... artifact_10)
                    for i in range(1, 11):
                        label_raw = row.get(f'artifact_{i}_label', '')
                        type_raw = row.get(f'artifact_{i}_type', '')
                        url_raw = row.get(f'artifact_{i}_url', '')

                        # Handle None values from CSV
                        label = label_raw.strip() if label_raw else ''
                        artifact_type = type_raw.strip() if type_raw else ''
                        url = url_raw.strip() if url_raw else ''

                        if not url:
                            continue

                        # Create link object
                        link = {
                            "label": label or f"Resource {i}",
                            "type": artifact_type or "link",
                            "url": url
                        }
                        links_list.append(link)

                        # Extract text from local files
                        if not url.startswith('http'):
                            full_path = csv_dir / url
                            if full_path.exists():
                                content = extract_text_from_file(full_path)
                                if content:
                                    full_content += f"\n\n--- {link['label']} ---\n{content[:1500]}"
                                    print(f"  📄 Extracted: {link['label']} ({artifact_type})")
                        else:
                            print(f"  🔗 Linked: {link['label']}")

                    cursor.execute('''
                        INSERT OR REPLACE INTO studies
                        (id, title, date, methodology, description, participants,
                         researcher, summary, tags, key_findings, full_content,
                         additional_links, research_type, topic, interaction, transcript_link)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                        json.dumps(links_list),
                        row.get('methodology'),  # research_type from methodology
                        '',  # topic (not in CSV)
                        '',  # interaction (not in CSV)
                        ''   # transcript_link (not in CSV)
                    ))

                    # Insert tags into study_tags table
                    for tag in tags:
                        cursor.execute(
                            "INSERT INTO study_tags (study_id, tag) VALUES (?, ?)",
                            (study_id, tag)
                        )

                    # Insert documents from artifacts
                    for j in range(1, 11):
                        label = row.get(f'artifact_{j}_label', '').strip()
                        doc_type = row.get(f'artifact_{j}_type', '').strip()
                        url = row.get(f'artifact_{j}_url', '').strip()

                        if label and doc_type and url:
                            cursor.execute(
                                "INSERT INTO documents (study_id, doc_type, file_url) VALUES (?, ?, ?)",
                                (study_id, label, url)
                            )

                    # Insert sample quotes from key findings
                    key_findings = row.get('key_findings', '').strip()
                    if key_findings:
                        # Split by period to create multiple quotes
                        sentences = [s.strip() for s in key_findings.split('.') if s.strip() and len(s.strip()) > 10]
                        for sentence in sentences[:3]:  # Take first 3 findings as quotes
                            cursor.execute(
                                "INSERT INTO quotes (study_id, text, participant, timestamp) VALUES (?, ?, ?, ?)",
                                (study_id, sentence, None, None)
                            )

                    imported_count += 1
                    print(f"✓ Imported: {title}")

                except Exception as e:
                    print(f"⚠ Error importing row: {e}")
                    continue

        conn.commit()
        conn.close()

        print(f"\n✅ Successfully imported {imported_count} studies into SQLite database!")

        # Now create embeddings for search
        print("\n📊 Creating search embeddings (this may take a moment)...")
        studies_to_embed = []
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM studies")
        for row in cursor.fetchall():
            studies_to_embed.append({
                "id": row["id"],
                "title": row["title"],
                "summary": row["summary"],
                "full_content": row["full_content"] or ""
            })
        conn.close()

        create_embeddings_and_index(studies_to_embed)

        print("\n✅ Import complete! Studies are now searchable by the AI.")
        print("💡 Restart the backend to see changes")
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
