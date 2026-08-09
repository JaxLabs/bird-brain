CREATE TABLE studies (
    id                  TEXT PRIMARY KEY,
    title               TEXT NOT NULL,
    date                TEXT NOT NULL,
    research_type       TEXT NOT NULL CHECK (research_type IN ('Qual', 'Quant')),
    methodology         TEXT NOT NULL CHECK (methodology IN ('Evaluative', 'Generative')),
    topic               TEXT NOT NULL,
    interaction         TEXT NOT NULL CHECK (interaction IN ('Moderated', 'Unmoderated', 'Survey')),
    participants        INTEGER NOT NULL,
    researcher          TEXT NOT NULL,
    summary             TEXT NOT NULL,
    transcript_link     TEXT,
    created_at          TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE study_features (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    feature     TEXT NOT NULL CHECK (feature IN (
                    'Photo ID', 'Sound ID', 'Bird Packs', 'Explore',
                    'Life List', 'ID Wizard', 'Range Maps', 'eBird',
                    'Notifications', 'Onboarding', 'Search'
                )),
    UNIQUE (study_id, feature)
);

CREATE TABLE study_tags (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    tag         TEXT NOT NULL,
    UNIQUE (study_id, tag)
);

CREATE TABLE demographics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    role        TEXT NOT NULL,
    age_range   TEXT
);

CREATE TABLE quotes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    participant TEXT,
    timestamp   TEXT
);

CREATE TABLE starting_questions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    question    TEXT NOT NULL
);

CREATE TABLE documents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id    TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    doc_type    TEXT NOT NULL CHECK (doc_type IN (
                    'Research Report', 'Study Plan', 'Screener',
                    'Transcript', 'Stimulus'
                )),
    file_url    TEXT NOT NULL
);
