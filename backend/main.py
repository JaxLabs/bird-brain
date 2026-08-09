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

@app.post("/studies")
def upload_study(study: Study):
    try:
        insert_study(study)
        embed_and_store(study)
        return {"status": "success", "id": study.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))