from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Study
from ingest import insert_study
from fastapi import HTTPException
from embeddings import embed_and_store
import ollama as ollama_client
import lancedb

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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