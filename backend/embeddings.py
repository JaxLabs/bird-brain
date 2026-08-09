import ollama
import lancedb
from models import Study

db = lancedb.connect("./lancedb")

def build_embedding_text(study: Study) -> str:
    """Combine the fields worth searching on into one block of text."""
    parts = [study.title, study.summary, study.topic]
    parts += study.tags
    parts += study.features
    parts += [q.text for q in study.directQuotes]
    return " ".join(parts)

def embed_and_store(study: Study):
    text = build_embedding_text(study)

    response = ollama.embed(model="nomic-embed-text", input=text)
    vector = response["embeddings"][0]

    record = {
        "study_id": study.id,
        "vector": vector,
        "text": text,
    }

    if "studies" in db.table_names():
        table = db.open_table("studies")
        table.delete(f"study_id = '{study.id}'")
        table.add([record])
    else:
        table = db.create_table("studies", data=[record])