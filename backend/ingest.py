import sqlite3
from models import Study

VALID_FEATURES = {
    "Photo ID", "Sound ID", "Bird Packs", "Explore", "Life List",
    "ID Wizard", "Range Maps", "eBird", "Notifications", "Onboarding", "Search"
}

def insert_study(study: Study):
    invalid = [f for f in study.features if f not in VALID_FEATURES]
    if invalid:
        raise ValueError(f"Invalid feature(s): {invalid}")

    conn = sqlite3.connect("bird_brain.db")
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO studies (id, title, date, research_type, methodology, topic,
                              interaction, participants, researcher, summary, transcript_link)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (study.id, study.title, study.date, study.researchType, study.methodology,
          study.topic, study.interaction, study.participants, study.researcher,
          study.summary, study.transcriptLink))

    for feature in study.features:
        cur.execute("INSERT INTO study_features (study_id, feature) VALUES (?, ?)",
                     (study.id, feature))

    for tag in study.tags:
        cur.execute("INSERT INTO study_tags (study_id, tag) VALUES (?, ?)",
                     (study.id, tag.strip().lower()))

    for demo in study.demographics:
        cur.execute("INSERT INTO demographics (study_id, role, age_range) VALUES (?, ?, ?)",
                     (study.id, demo.role, demo.age_range))

    for q in study.directQuotes:
        cur.execute("INSERT INTO quotes (study_id, text, participant, timestamp) VALUES (?, ?, ?, ?)",
                     (study.id, q.text, q.participant, q.timestamp))

    for question in study.startingQuestions:
        cur.execute("INSERT INTO starting_questions (study_id, question) VALUES (?, ?)",
                     (study.id, question))

    for doc in study.documents:
        cur.execute("INSERT INTO documents (study_id, doc_type, file_url) VALUES (?, ?, ?)",
                     (study.id, doc.doc_type, doc.file_url))

    conn.commit()
    conn.close()