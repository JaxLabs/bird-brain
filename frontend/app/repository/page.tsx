"use client";

import { useEffect, useState } from "react";

type Study = {
  id: string;
  title: string;
  date: string;
  researchType: string;
  methodology: string;
  topic: string;
  participants: number;
  researcher: string;
  summary: string;
  features: string[];
  tags: string[];
};

type StudyDetail = Study & {
  interaction: string;
  transcriptLink: string | null;
  demographics: { role: string; age_range: string | null }[];
  quotes: { text: string; participant: string | null; timestamp: string | null }[];
  documents: { doc_type: string; file_url: string }[];
  startingQuestions: string[];
};

type Filters = {
  features: string[];
  tags: string[];
};

export default function Repository() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [filterOptions, setFilterOptions] = useState<Filters>({ features: [], tags: [] });
  const [search, setSearch] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<StudyDetail | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/filters")
      .then((res) => res.json())
      .then(setFilterOptions);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedFeatures.length) params.set("features", selectedFeatures.join(","));
    if (selectedTags.length) params.set("tags", selectedTags.join(","));

    fetch(`http://localhost:8000/studies?${params.toString()}`)
      .then((res) => res.json())
      .then(setStudies)
      .catch(() => setStudies([]));
  }, [selectedFeatures, selectedTags]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function openStudy(id: string) {
    fetch(`http://localhost:8000/studies/${id}`)
      .then((res) => res.json())
      .then(setSelectedStudy);
  }

  const filtered = studies.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", fontFamily: "sans-serif", padding: "2rem", gap: "2rem" }}>
      {/* Sidebar */}
      <aside style={{ width: "200px", flexShrink: 0 }}>
        <h4>Merlin feature</h4>
        {filterOptions.features.map((f) => (
          <label key={f} style={{ display: "block", fontSize: "0.9rem", marginBottom: "4px" }}>
            <input
              type="checkbox"
              checked={selectedFeatures.includes(f)}
              onChange={() => toggle(selectedFeatures, setSelectedFeatures, f)}
            />{" "}
            {f}
          </label>
        ))}

        <h4 style={{ marginTop: "1.5rem" }}>Topic</h4>
        {filterOptions.tags.map((t) => (
          <label key={t} style={{ display: "block", fontSize: "0.9rem", marginBottom: "4px" }}>
            <input
              type="checkbox"
              checked={selectedTags.includes(t)}
              onChange={() => toggle(selectedTags, setSelectedTags, t)}
            />{" "}
            {t}
          </label>
        ))}
      </aside>

      {/* Main list */}
      <main style={{ flex: 1, maxWidth: "700px" }}>
        <h1>Repository</h1>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
        />

        <p>{filtered.length} of {studies.length}</p>

        {filtered.map((study) => (
          <div
            key={study.id}
            onClick={() => openStudy(study.id)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              cursor: "pointer",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>
              {study.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.75rem",
                    background: "#eee",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    marginRight: "4px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 style={{ margin: "0 0 0.25rem" }}>{study.title}</h3>
            <p style={{ margin: "0 0 0.5rem", color: "#555" }}>{study.summary}</p>
            <small style={{ color: "#888" }}>
              {study.date} · {study.researcher} · {study.participants} participants
            </small>
          </div>
        ))}
      </main>

      {/* Detail panel */}
      {selectedStudy && (
        <aside
          style={{
            width: "320px",
            flexShrink: 0,
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {selectedStudy.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.75rem",
                    background: "#eee",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    marginRight: "4px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <button onClick={() => setSelectedStudy(null)} style={{ border: "none", background: "none", cursor: "pointer" }}>
              ✕
            </button>
          </div>

          <h3>{selectedStudy.title}</h3>
          <small style={{ color: "#888" }}>
            {selectedStudy.date} · {selectedStudy.participants} participants · {selectedStudy.researcher}
          </small>

          <p style={{ marginTop: "1rem" }}>{selectedStudy.summary}</p>

          {selectedStudy.quotes.map((q, i) => (
            <div key={i} style={{ background: "#f5f5f5", borderRadius: "6px", padding: "0.75rem", marginBottom: "0.5rem" }}>
              <p style={{ fontStyle: "italic", margin: 0 }}>"{q.text}"</p>
              {q.participant && <small style={{ color: "#888" }}>- {q.participant}</small>}
            </div>
          ))}

          {selectedStudy.documents.length > 0 && (
            <>
              <h4 style={{ marginTop: "1.5rem" }}>Documents</h4>
              {selectedStudy.documents.map((doc, i) => (
                <div key={i} style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                  📄 {doc.doc_type}
                </div>
              ))}
            </>
          )}

          {selectedStudy.demographics.length > 0 && (
            <>
              <h4 style={{ marginTop: "1.5rem" }}>Demographics</h4>
              {selectedStudy.demographics.map((d, i) => (
                <div key={i} style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                  <strong>{d.role}</strong>
                  {d.age_range && <span style={{ color: "#888" }}> · Age {d.age_range}</span>}
                </div>
              ))}
            </>
          )}
        </aside>
      )}
    </div>
  );
}