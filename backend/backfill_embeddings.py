import sqlite3
from models import Study
from embeddings import embed_and_store

conn = sqlite3.connect("bird_brain.db")
conn.row_factory = sqlite3.Row
rows = conn.execute("SELECT * FROM studies").fetchall()

for row in rows:
    study = Study(
        id=row["id"],
        title=row["title"],
        date=row["date"],
        researchType=row["research_type"],
        methodology=row["methodology"],
        topic=row["topic"],
        interaction=row["interaction"],
        participants=row["participants"],
        researcher=row["researcher"],
        features=[f["feature"] for f in conn.execute(
            "SELECT feature FROM study_features WHERE study_id=?", (row["id"],))],
        summary=row["summary"],
        tags=[t["tag"] for t in conn.execute(
            "SELECT tag FROM study_tags WHERE study_id=?", (row["id"],))],
        directQuotes=[],
        documents=[],
    )
    embed_and_store(study)
    print(f"Embedded: {study.id}")

conn.close()