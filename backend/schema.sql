CREATE TABLE IF NOT EXISTS studies (
    id                  TEXT PRIMARY KEY,
    title               TEXT NOT NULL,
    date                TEXT NOT NULL,
    research_type       TEXT NOT NULL CHECK (research_type IN ('Qual', 'Quant')),
    methodology         TEXT NOT NULL,
    topic               TEXT NOT NULL,
    interaction         TEXT NOT NULL CHECK (interaction IN ('Moderated', 'Unmoderated', 'Survey')),
    participants        INTEGER NOT NULL,
    researcher          TEXT NOT NULL,
    summary             TEXT NOT NULL,
    transcript_link     TEXT,
    created_at          TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_features (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    feature     TEXT NOT NULL,
    UNIQUE (study_id, feature)
);

CREATE TABLE IF NOT EXISTS study_tags (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    tag         TEXT NOT NULL,
    UNIQUE (study_id, tag)
);

CREATE TABLE IF NOT EXISTS demographics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    role        TEXT NOT NULL,
    age_range   TEXT
);

CREATE TABLE IF NOT EXISTS quotes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    participant TEXT,
    timestamp   TEXT
);

CREATE TABLE IF NOT EXISTS starting_questions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    question    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    doc_type    TEXT NOT NULL,
    file_url    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS artifacts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id        TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    artifact_type   TEXT NOT NULL,
    source_type     TEXT NOT NULL CHECK (source_type IN ('link', 'upload')),
    url             TEXT NOT NULL,
    label           TEXT,
    created_at      TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collections (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_studies (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id   TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    study_id        TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    added_at        TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collection_id, study_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (study_id)
);

CREATE TABLE IF NOT EXISTS notes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    quote_id    INTEGER REFERENCES quotes(id) ON DELETE SET NULL,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_study_features_study_id ON study_features(study_id);
CREATE INDEX IF NOT EXISTS idx_study_tags_study_id ON study_tags(study_id);
CREATE INDEX IF NOT EXISTS idx_demographics_study_id ON demographics(study_id);
CREATE INDEX IF NOT EXISTS idx_quotes_study_id ON quotes(study_id);
CREATE INDEX IF NOT EXISTS idx_starting_questions_study_id ON starting_questions(study_id);
CREATE INDEX IF NOT EXISTS idx_documents_study_id ON documents(study_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_study_id ON artifacts(study_id);
CREATE INDEX IF NOT EXISTS idx_collection_studies_collection_id ON collection_studies(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_studies_study_id ON collection_studies(study_id);
CREATE INDEX IF NOT EXISTS idx_notes_study_id ON notes(study_id);