from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Study
from ingest import insert_study
from fastapi import HTTPException
from embeddings import embed_and_store
import ollama as ollama_client
import lancedb
from fastapi import UploadFile, File
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"http://localhost:8000/uploads/{file.filename}"}

@app.post("/studies/{study_id}/artifacts")
def add_artifact(study_id: str, artifact: dict):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.execute(
        "INSERT INTO artifacts (study_id, artifact_type, source_type, url, label) VALUES (?, ?, ?, ?, ?)",
        (study_id, artifact["artifact_type"], artifact["source_type"], artifact["url"], artifact.get("label"))
    )
    conn.commit()
    conn.close()
    return {"status": "success"}

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/ask")
def ask_question(payload: dict):
    question = payload.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    # 1. Embed the question
    response = ollama_client.embed(model="nomic-embed-text", input=question)
    query_vector = response["embeddings"][0]

    # 2. Search LanceDB for the most relevant studies
    db = lancedb.connect("./lancedb")
    table = db.open_table("studies")
    results = table.search(query_vector).limit(3).to_list()
    matched_ids = [r["study_id"] for r in results]

    # 3. Pull full study data for the matches
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row
    matched_studies = []
    for study_id in matched_ids:
        row = conn.execute("SELECT * FROM studies WHERE id=?", (study_id,)).fetchone()
        if not row:
            continue
        quotes = [dict(q) for q in conn.execute(
            "SELECT text, participant FROM quotes WHERE study_id=?", (study_id,))]
        tags = [t["tag"] for t in conn.execute(
            "SELECT tag FROM study_tags WHERE study_id=?", (study_id,))]
        matched_studies.append({
            "id": row["id"],
            "title": row["title"],
            "date": row["date"],
            "summary": row["summary"],
            "tags": tags,
            "quotes": quotes,
        })
    conn.close()

    # 4. Build context for the LLM
    context_text = "\n\n".join(
        f"Study: {s['title']}\nSummary: {s['summary']}"
        for s in matched_studies
    )

    prompt = f"""You are a research assistant. Answer the question using ONLY the study summaries below. Keep the answer to 2-3 sentences. If the studies don't cover the question, say so.

Studies:
{context_text}

Question: {question}

Answer:"""

    # 5. Ask the LLM
    llm_response = ollama_client.chat(
        model="qwen3:8b",
        messages=[{"role": "user", "content": prompt}],
    )
    answer = llm_response["message"]["content"]

    return {"answer": answer, "studies": matched_studies}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/studies")
def list_studies(
    features: str = "",
    tags: str = "",
    search: str = "",
    researchType: str = "",
    methodology: str = "",
    dateFrom: str = "",
    dateTo: str = "",
    participantsMin: int = None,
    participantsMax: int = None,
):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    feature_list = [f.strip() for f in features.split(",") if f.strip()]
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    query = "SELECT DISTINCT s.* FROM studies s"
    params = []

    if feature_list:
        placeholders = ",".join("?" for _ in feature_list)
        query += f" JOIN study_features sf ON sf.study_id = s.id AND sf.feature IN ({placeholders})"
        params += feature_list

    if tag_list:
        placeholders = ",".join("?" for _ in tag_list)
        query += f" JOIN study_tags st ON st.study_id = s.id AND st.tag IN ({placeholders})"
        params += tag_list

    where_conditions = []

    if search:
        search_term = f"%{search}%"
        where_conditions.append("(s.title LIKE ? OR s.summary LIKE ? OR s.topic LIKE ?)")
        params.extend([search_term, search_term, search_term])

    if researchType:
        where_conditions.append("s.research_type = ?")
        params.append(researchType)

    if methodology:
        where_conditions.append("s.methodology LIKE ?")
        params.append(f"%{methodology}%")

    if dateFrom:
        where_conditions.append("s.date >= ?")
        params.append(dateFrom)

    if dateTo:
        where_conditions.append("s.date <= ?")
        params.append(dateTo)

    if participantsMin is not None:
        where_conditions.append("s.participants >= ?")
        params.append(participantsMin)

    if participantsMax is not None:
        where_conditions.append("s.participants <= ?")
        params.append(participantsMax)

    if where_conditions:
        query += " WHERE " + " AND ".join(where_conditions)

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

@app.get("/studies/{study_id}")
def get_study_detail(study_id: str):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    row = conn.execute("SELECT * FROM studies WHERE id=?", (study_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Study not found")

    features = [f["feature"] for f in conn.execute(
        "SELECT feature FROM study_features WHERE study_id=?", (study_id,))]
    tags = [t["tag"] for t in conn.execute(
        "SELECT tag FROM study_tags WHERE study_id=?", (study_id,))]
    demographics = [dict(d) for d in conn.execute(
        "SELECT role, age_range FROM demographics WHERE study_id=?", (study_id,))]
    quotes = [dict(q) for q in conn.execute(
        "SELECT text, participant, timestamp FROM quotes WHERE study_id=?", (study_id,))]
    documents = [dict(doc) for doc in conn.execute(
        "SELECT doc_type, file_url FROM documents WHERE study_id=?", (study_id,))]
    starting_questions = [q["question"] for q in conn.execute(
        "SELECT question FROM starting_questions WHERE study_id=?", (study_id,))]

    conn.close()

    return {
        "id": row["id"],
        "title": row["title"],
        "date": row["date"],
        "researchType": row["research_type"],
        "methodology": row["methodology"],
        "topic": row["topic"],
        "interaction": row["interaction"],
        "participants": row["participants"],
        "researcher": row["researcher"],
        "summary": row["summary"],
        "transcriptLink": row["transcript_link"],
        "features": features,
        "tags": tags,
        "demographics": demographics,
        "quotes": quotes,
        "documents": documents,
        "startingQuestions": starting_questions,
    }

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

@app.get("/collections")
def list_collections():
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    rows = conn.execute("SELECT * FROM collections ORDER BY name").fetchall()
    collections = [dict(r) for r in rows]

    for col in collections:
        study_count = conn.execute(
            "SELECT COUNT(*) FROM collection_studies WHERE collection_id=?",
            (col["id"],)
        ).fetchone()[0]
        col["studyCount"] = study_count

    conn.close()
    return collections

@app.post("/collections")
def create_collection(payload: dict):
    import sqlite3
    import uuid
    conn = sqlite3.connect("bird_brain.db")

    col_id = str(uuid.uuid4())[:8]
    name = payload.get("name", "Untitled Collection")
    description = payload.get("description", "")

    conn.execute(
        "INSERT INTO collections (id, name, description) VALUES (?, ?, ?)",
        (col_id, name, description)
    )
    conn.commit()
    conn.close()

    return {"id": col_id, "name": name, "description": description}

@app.get("/collections/{collection_id}")
def get_collection(collection_id: str):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    col = conn.execute("SELECT * FROM collections WHERE id=?", (collection_id,)).fetchone()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")

    study_ids = [r["study_id"] for r in conn.execute(
        "SELECT study_id FROM collection_studies WHERE collection_id=? ORDER BY added_at DESC",
        (collection_id,)
    )]

    studies = []
    for study_id in study_ids:
        row = conn.execute("SELECT * FROM studies WHERE id=?", (study_id,)).fetchone()
        if row:
            studies.append(dict(row))

    conn.close()
    return {**dict(col), "studies": studies}

@app.put("/collections/{collection_id}")
def update_collection(collection_id: str, payload: dict):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")

    name = payload.get("name")
    description = payload.get("description")

    conn.execute(
        "UPDATE collections SET name=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        (name, description, collection_id)
    )
    conn.commit()
    conn.close()

    return {"status": "success"}

@app.delete("/collections/{collection_id}")
def delete_collection(collection_id: str):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.execute("DELETE FROM collections WHERE id=?", (collection_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/collections/{collection_id}/studies")
def add_study_to_collection(collection_id: str, payload: dict):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")

    study_id = payload.get("study_id")

    try:
        conn.execute(
            "INSERT INTO collection_studies (collection_id, study_id) VALUES (?, ?)",
            (collection_id, study_id)
        )
        conn.commit()
    except:
        pass
    finally:
        conn.close()

    return {"status": "success"}

@app.delete("/collections/{collection_id}/studies/{study_id}")
def remove_study_from_collection(collection_id: str, study_id: str):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.execute(
        "DELETE FROM collection_studies WHERE collection_id=? AND study_id=?",
        (collection_id, study_id)
    )
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.get("/bookmarks")
def get_bookmarks():
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    study_ids = [r["study_id"] for r in conn.execute(
        "SELECT study_id FROM bookmarks ORDER BY created_at DESC"
    )]

    studies = []
    for study_id in study_ids:
        row = conn.execute("SELECT * FROM studies WHERE id=?", (study_id,)).fetchone()
        if row:
            studies.append(dict(row))

    conn.close()
    return studies

@app.post("/studies/{study_id}/bookmark")
def bookmark_study(study_id: str):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")

    try:
        conn.execute("INSERT INTO bookmarks (study_id) VALUES (?)", (study_id,))
        conn.commit()
        return {"status": "bookmarked"}
    except:
        return {"status": "already_bookmarked"}
    finally:
        conn.close()

@app.delete("/studies/{study_id}/bookmark")
def unbookmark_study(study_id: str):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.execute("DELETE FROM bookmarks WHERE study_id=?", (study_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/studies/{study_id}/notes")
def add_note(study_id: str, payload: dict):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")

    content = payload.get("content", "")
    quote_id = payload.get("quoteId")

    cursor = conn.execute(
        "INSERT INTO notes (study_id, content, quote_id) VALUES (?, ?, ?)",
        (study_id, content, quote_id)
    )
    conn.commit()
    note_id = cursor.lastrowid
    conn.close()

    return {"id": note_id, "studyId": study_id, "content": content}

@app.get("/studies/{study_id}/notes")
def get_notes(study_id: str):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    notes = [dict(n) for n in conn.execute(
        "SELECT id, content, quote_id as quoteId, created_at as createdAt, updated_at as updatedAt FROM notes WHERE study_id=? ORDER BY created_at DESC",
        (study_id,)
    )]

    conn.close()
    return notes

@app.put("/notes/{note_id}")
def update_note(note_id: str, payload: dict):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")

    content = payload.get("content", "")

    conn.execute(
        "UPDATE notes SET content=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        (content, note_id)
    )
    conn.commit()
    conn.close()

    return {"status": "success"}

@app.delete("/notes/{note_id}")
def delete_note(note_id: str):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.execute("DELETE FROM notes WHERE id=?", (note_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.get("/stats")
def get_statistics():
    import sqlite3
    from collections import defaultdict
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    total_studies = conn.execute("SELECT COUNT(*) FROM studies").fetchone()[0]

    by_type = defaultdict(int)
    for row in conn.execute("SELECT research_type, COUNT(*) as count FROM studies GROUP BY research_type"):
        by_type[row["research_type"]] = row["count"]

    by_methodology = defaultdict(int)
    for row in conn.execute("SELECT methodology, COUNT(*) as count FROM studies GROUP BY methodology"):
        by_methodology[row["methodology"]] = row["count"]

    by_topic = defaultdict(int)
    for row in conn.execute("SELECT topic, COUNT(*) as count FROM studies GROUP BY topic"):
        by_topic[row["topic"]] = row["count"]

    by_tag = defaultdict(int)
    for row in conn.execute("SELECT tag, COUNT(*) as count FROM study_tags GROUP BY tag"):
        by_tag[row["tag"]] = row["count"]

    total_participants = conn.execute("SELECT SUM(participants) FROM studies").fetchone()[0] or 0

    dates = conn.execute("SELECT MIN(date) as min_date, MAX(date) as max_date FROM studies").fetchone()
    date_range = {"min": dates["min_date"] or "", "max": dates["max_date"] or ""}

    conn.close()

    return {
        "totalStudies": total_studies,
        "byType": dict(by_type),
        "byMethodology": dict(by_methodology),
        "byTopic": dict(by_topic),
        "byTag": dict(by_tag),
        "totalParticipants": total_participants,
        "dateRange": date_range
    }

@app.get("/timeline")
def get_timeline():
    import sqlite3
    from collections import defaultdict
    conn = sqlite3.connect("bird_brain.db")

    timeline = defaultdict(int)
    for row in conn.execute("SELECT DATE(date) as day, COUNT(*) as count FROM studies GROUP BY DATE(date) ORDER BY day"):
        timeline[row[0]] = row[1]

    conn.close()
    return [{"date": k, "count": v} for k, v in sorted(timeline.items())]

@app.get("/studies/{study_id}/related")
def get_related_studies(study_id: str, limit: int = 5):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    study = conn.execute("SELECT * FROM studies WHERE id=?", (study_id,)).fetchone()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    study_tags = [r["tag"] for r in conn.execute(
        "SELECT tag FROM study_tags WHERE study_id=?", (study_id,)
    )]
    study_features = [r["feature"] for r in conn.execute(
        "SELECT feature FROM study_features WHERE study_id=?", (study_id,)
    )]

    if not study_tags and not study_features:
        conn.close()
        return []

    placeholders_tags = ",".join("?" for _ in study_tags) if study_tags else "NULL"
    placeholders_features = ",".join("?" for _ in study_features) if study_features else "NULL"

    params = study_tags + study_features + [study_id]

    query = f"""
        SELECT DISTINCT s.*, COUNT(*) as match_count
        FROM studies s
        LEFT JOIN study_tags st ON st.study_id = s.id AND st.tag IN ({placeholders_tags if study_tags else "NULL"})
        LEFT JOIN study_features sf ON sf.study_id = s.id AND sf.feature IN ({placeholders_features if study_features else "NULL"})
        WHERE s.id != ?
        GROUP BY s.id
        ORDER BY match_count DESC, s.date DESC
        LIMIT ?
    """

    params.append(limit)
    related = [dict(r) for r in conn.execute(query, params[:len(params)-1])]

    conn.close()
    return related

@app.post("/studies/export/csv")
def export_studies_csv(payload: dict):
    import sqlite3
    import csv
    import io
    from datetime import datetime

    study_ids = payload.get("study_ids", [])
    if not study_ids:
        raise HTTPException(status_code=400, detail="No studies selected for export")

    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    studies = []
    for study_id in study_ids:
        row = conn.execute("SELECT * FROM studies WHERE id=?", (study_id,)).fetchone()
        if row:
            features = [f["feature"] for f in conn.execute(
                "SELECT feature FROM study_features WHERE study_id=?", (study_id,)
            )]
            tags = [t["tag"] for t in conn.execute(
                "SELECT tag FROM study_tags WHERE study_id=?", (study_id,)
            )]
            studies.append({**dict(row), "features": ";".join(features), "tags": ";".join(tags)})

    conn.close()

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "id", "title", "date", "research_type", "methodology", "topic", "interaction",
        "participants", "researcher", "summary", "features", "tags", "transcript_link"
    ])
    writer.writeheader()
    writer.writerows(studies)

    return {
        "filename": f"research-export-{datetime.now().strftime('%Y%m%d-%H%M%S')}.csv",
        "data": output.getvalue()
    }

@app.get("/studies/{study_id}/export/json")
def export_study_json(study_id: str):
    import sqlite3
    conn = sqlite3.connect("bird_brain.db")
    conn.row_factory = sqlite3.Row

    row = conn.execute("SELECT * FROM studies WHERE id=?", (study_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Study not found")

    study = dict(row)
    study["features"] = [f["feature"] for f in conn.execute(
        "SELECT feature FROM study_features WHERE study_id=?", (study_id,)
    )]
    study["tags"] = [t["tag"] for t in conn.execute(
        "SELECT tag FROM study_tags WHERE study_id=?", (study_id,)
    )]
    study["demographics"] = [dict(d) for d in conn.execute(
        "SELECT role, age_range FROM demographics WHERE study_id=?", (study_id,)
    )]
    study["quotes"] = [dict(q) for q in conn.execute(
        "SELECT text, participant, timestamp FROM quotes WHERE study_id=?", (study_id,)
    )]
    study["startingQuestions"] = [q["question"] for q in conn.execute(
        "SELECT question FROM starting_questions WHERE study_id=?", (study_id,)
    )]
    study["documents"] = [dict(d) for d in conn.execute(
        "SELECT doc_type, file_url FROM documents WHERE study_id=?", (study_id,)
    )]

    conn.close()
    return study