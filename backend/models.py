from pydantic import BaseModel
from typing import Optional, Literal

class Demographic(BaseModel):
    role: str
    age_range: Optional[str] = None

class Quote(BaseModel):
    id: Optional[int] = None
    text: str
    participant: Optional[str] = None
    timestamp: Optional[str] = None

class Document(BaseModel):
    doc_type: Literal["Research Report", "Study Plan", "Screener", "Transcript", "Stimulus"]
    file_url: str

class Artifact(BaseModel):
    artifact_type: str
    source_type: Literal["link", "upload"]
    url: str
    label: Optional[str] = None

class Note(BaseModel):
    id: Optional[int] = None
    content: str
    quoteId: Optional[int] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class Study(BaseModel):
    id: str
    title: str
    date: str
    researchType: Literal["Qual", "Quant"]
    methodology: str
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

class Collection(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class CollectionWithStudies(Collection):
    studies: list[Study] = []

class Bookmark(BaseModel):
    studyId: str
    createdAt: Optional[str] = None

class StudyWithMetadata(Study):
    isBookmarked: bool = False
    notes: list[Note] = []
    inCollections: list[str] = []

class SearchQuery(BaseModel):
    q: Optional[str] = None
    features: list[str] = []
    tags: list[str] = []
    researchType: Optional[str] = None
    methodology: Optional[str] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    participantsMin: Optional[int] = None
    participantsMax: Optional[int] = None

class Stats(BaseModel):
    totalStudies: int
    byType: dict[str, int]
    byMethodology: dict[str, int]
    byTopic: dict[str, int]
    byTag: dict[str, int]
    totalParticipants: int
    dateRange: dict[str, str]