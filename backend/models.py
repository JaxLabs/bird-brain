from pydantic import BaseModel
from typing import Optional, Literal

class Demographic(BaseModel):
    role: str
    age_range: Optional[str] = None

class Quote(BaseModel):
    text: str
    participant: Optional[str] = None
    timestamp: Optional[str] = None

class Document(BaseModel):
    doc_type: Literal["Research Report", "Study Plan", "Screener", "Transcript", "Stimulus"]
    file_url: str

class Study(BaseModel):
    id: str
    title: str
    date: str
    researchType: Literal["Qual", "Quant"]
    methodology: Literal["Evaluative", "Generative"]
    topic: str
    interaction: Literal["Moderated", "Unmoderated", "Survey"]
    participants: int
    researcher: str
    features: list[str]
    summary: str
    tags: list[str]
    demographics: list[Demographic] = []
    startingQuestions: list[str] = []
    directQuotes: list[Quote] = []
    transcriptLink: Optional[str] = None
    documents: list[Document] = []