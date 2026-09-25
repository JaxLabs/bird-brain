#!/usr/bin/env python3
"""Initialize LanceDB with embeddings from existing studies in SQLite"""

import sqlite3
import lancedb
import ollama
import json

def build_embedding_text(title, summary, topic, tags, features):
    """Combine fields for embedding"""
    parts = [title, summary, topic or ""]
    parts.extend(tags or [])
    parts.extend(features or [])
    return " ".join(str(p) for p in parts if p)

# Connect to databases
sqlite_conn = sqlite3.connect("bird_brain.db")
sqlite_conn.row_factory = sqlite3.Row

lance_db = lancedb.connect("./lancedb")

# Get all studies from SQLite
studies = sqlite_conn.execute("SELECT * FROM studies").fetchall()
print(f"Found {len(studies)} studies in SQLite")

records = []
for study in studies:
    study_id = study["id"]

    # Get tags for this study
    tags = []
    for tag_row in sqlite_conn.execute("SELECT tag FROM study_tags WHERE study_id=?", (study_id,)):
        tags.append(tag_row[0])

    # Remove duplicates while preserving order
    tags = list(dict.fromkeys(tags))

    # Get features from study_features table
    features = []
    for feature_row in sqlite_conn.execute("SELECT feature FROM study_features WHERE study_id=?", (study_id,)):
        features.append(feature_row[0])

    # Build text for embedding
    text = build_embedding_text(
        study["title"],
        study["summary"],
        study["topic"],
        tags,
        features
    )

    print(f"Embedding {study_id}: {study['title'][:50]}...")

    # Generate embedding using Ollama
    try:
        response = ollama.embed(model="nomic-embed-text", input=text)
        vector = response["embeddings"][0]

        records.append({
            "study_id": study_id,
            "vector": vector,
            "text": text,
        })
    except Exception as e:
        print(f"  ERROR embedding {study_id}: {str(e)}")
        continue

print(f"\nCreating LanceDB table with {len(records)} records...")

if len(records) > 0:
    # Create table in LanceDB
    table = lance_db.create_table("studies", data=records, mode="overwrite")
    print(f"Successfully created LanceDB 'studies' table with {len(records)} records")
else:
    print("No records to create table with!")

sqlite_conn.close()
