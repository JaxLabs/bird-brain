from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Study
from ingest import insert_study
from fastapi import HTTPException
from embeddings import embed_and_store

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/studies")
def list_studies(features: str = "", tags: str = ""):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    feature_list = [f for f in features.split(",") if f]
    tag_list = [t for t in tags.split(",") if t]

    query = "SELECT DISTINCT s.* FROM studies s"
    conditions = []
    params = []

    if feature_list:
        placeholders = ",".join("?" for _ in feature_list)
        query += f" JOIN study_features sf ON sf.study_id = s.id AND sf.feature IN ({placeholders})"
        params += feature_list

    if tag_list:
        placeholders = ",".join("?" for _ in tag_list)
        query += f" JOIN study_tags st ON st.study_id = s.id AND st.tag IN ({placeholders})"
        params += tag_list

    query += " ORDER BY s.date DESC"

    rows = conn.execute(query, params).fetchall()

    results = []
    for row in rows:
        study_id = row["id"]
        study_features = [f["feature"] for f in conn.execute(
            "SELECT feature FROM study_features WHERE study_id=?", (study_id,))]
        study_tags = [t["tag"] for t in conn.execute(
            "SELECT tag FROM study_tags WHERE study_id=?", (study_id,))]

        results.append({
            "id": row["id"],
            "title": row["title"],
            "date": row["date"],
            "researchType": row["research_type"],
            "methodology": row["methodology"],
            "topic": row["topic"],
            "participants": row["participants"],
            "researcher": row["researcher"],
            "summary": row["summary"],
            "features": study_features,
            "tags": study_tags,
        })

    conn.close()
    return results


@app.get("/filters")
def get_filters():
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    features = [r["feature"] for r in conn.execute(
        "SELECT DISTINCT feature FROM study_features ORDER BY feature")]
    tags = [r["tag"] for r in conn.execute(
        "SELECT DISTINCT tag FROM study_tags ORDER BY tag")]

    conn.close()
    return {"features": features, "tags": tags}