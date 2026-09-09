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

function researchTypeColor(type: string) {
  if (type === "Qual") return { bg: "#eaf5ea", text: "#2e7d32" };
  if (type === "Quant") return { bg: "#eaf1fb", text: "#1a5fb4" };
  return { bg: "var(--color-tag-bg)", text: "var(--color-tag-text)" };
}

function methodologyColor(m: string) {
  if (m === "Interview") return { bg: "#f5eafb", text: "#7b2d8e" };
  return { bg: "var(--color-tag-bg)", text: "var(--color-tag-text)" };
}

const BASELINE_FEATURES = [
  "Sound ID",
  "LifeList",
  "Explore",
  "Bird Packs",
  "Species Search",
  "Photo ID",
  "Song ID",
  "Notifications",
  "Offline Mode",
  "User Onboarding",
];

export default function Repository() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [filterOptions, setFilterOptions] = useState<Filters>({ features: [], tags: [] });
  const [search, setSearch] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<StudyDetail | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [topicsOpen, setTopicsOpen] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/filters")
      .then((res) => res.json())
      .then((data) => {
        const features = data.features.length > 0 ? data.features : BASELINE_FEATURES;
        setFilterOptions({ features, tags: data.tags });
      })
      .catch((e) => {
        console.error("Failed to load filters:", e);
        setFilterOptions({ features: BASELINE_FEATURES, tags: [] });
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedFeatures.length) params.set("features", selectedFeatures.join(","));
    if (selectedTags.length) params.set("tags", selectedTags.join(","));
    if (search) params.set("search", search);

    fetch(`http://localhost:8000/studies?${params.toString()}`)
      .then((res) => res.json())
      .then(setStudies)
      .catch(() => setStudies([]));
  }, [selectedFeatures, selectedTags, search]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function openStudy(id: string) {
    fetch(`http://localhost:8000/studies/${id}`)
      .then((res) => res.json())
      .then(setSelectedStudy)
      .catch(() => console.error("Failed to load study"));
  }

  const filtered = studies.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.summary.toLowerCase().includes(search.toLowerCase())
  );

  const filterPillStyle = (active: boolean): React.CSSProperties => ({
    fontSize: "0.8rem",
    padding: "5px 12px",
    borderRadius: "999px",
    border: "1px solid var(--color-border)",
    background: active ? "var(--color-accent)" : "white",
    color: active ? "white" : "var(--color-text)",
    cursor: "pointer",
    display: "inline-block",
  });

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", flexShrink: 0, padding: "1.5rem 1.25rem", borderRight: "1px solid var(--color-border)" }}>
        <h4 style={{ marginTop: 0 }}>Filters</h4>

        <div style={{ marginTop: "1.25rem" }}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.55rem 0.9rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div
          onClick={() => setFeaturesOpen(!featuresOpen)}
          style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", marginTop: "1.25rem", fontWeight: 600, fontSize: "0.9rem" }}
        >
          <span>Merlin Features</span>
          <span style={{ fontSize: "0.7rem", fontWeight: "bold" }}>{featuresOpen ? "−" : "+"}</span>
        </div>
        {featuresOpen && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.6rem" }}>
            {filterOptions.features.map((f) => (
              <span key={f} onClick={() => toggle(selectedFeatures, setSelectedFeatures, f)} style={filterPillStyle(selectedFeatures.includes(f))}>
                {f}
              </span>
            ))}
          </div>
        )}

        <div
          onClick={() => setTopicsOpen(!topicsOpen)}
          style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", marginTop: "1.75rem", fontWeight: 600, fontSize: "0.9rem" }}
        >
          <span>Research Tags</span>
          <span style={{ fontSize: "0.7rem", fontWeight: "bold" }}>{topicsOpen ? "−" : "+"}</span>
        </div>
        {topicsOpen && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.6rem" }}>
            {filterOptions.tags.map((t) => (
              <span key={t} onClick={() => toggle(selectedTags, setSelectedTags, t)} style={filterPillStyle(selectedTags.includes(t))}>
                {t}
              </span>
            ))}
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "1.5rem 2rem", maxWidth: selectedStudy ? "calc(100% - 340px)" : "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
            {filtered.length} of {studies.length}
          </span>
          <div style={{ display: "flex", border: "1px solid var(--color-border)", borderRadius: "6px", overflow: "hidden" }}>
            <button
              onClick={() => setView("list")}
              style={{
                padding: "0.4rem 0.6rem",
                border: "none",
                background: view === "list" ? "var(--color-tag-bg)" : "white",
                cursor: "pointer",
              }}
            >
              ☰
            </button>
            <button
              onClick={() => setView("grid")}
              style={{
                padding: "0.4rem 0.6rem",
                border: "none",
                borderLeft: "1px solid var(--color-border)",
                background: view === "grid" ? "var(--color-tag-bg)" : "white",
                cursor: "pointer",
              }}
            >
              ▦
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: "1.25rem",
            display: view === "grid" ? "grid" : "block",
            gridTemplateColumns: view === "grid" ? "1fr 1fr" : undefined,
            gap: view === "grid" ? "1rem" : 0,
          }}
        >
          {filtered.map((study) => {
            const rtColor = researchTypeColor(study.researchType);
            const mColor = methodologyColor(study.methodology);
            return (
              <div
                key={study.id}
                onClick={() => openStudy(study.id)}
                style={{
                  padding: "1.1rem 0",
                  borderBottom: view === "list" ? "1px solid var(--color-border)" : "none",
                  border: view === "grid" ? "1px solid var(--color-border)" : undefined,
                  borderRadius: view === "grid" ? "10px" : 0,
                  padding: view === "grid" ? "1.1rem" : "1.1rem 0",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "4px", background: rtColor.bg, color: rtColor.text, fontWeight: 600 }}>
                      {study.researchType}
                    </span>
                    <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "4px", background: mColor.bg, color: mColor.text, fontWeight: 600 }}>
                      {study.methodology}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {new Date(study.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <h3 style={{ margin: "0.6rem 0 0.4rem 0", fontSize: "1.05rem" }}>{study.title}</h3>
                <p style={{ margin: "0 0 0.5rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{study.summary}</p>
                <small style={{ color: "var(--color-text-muted)" }}>👥 {study.participants} • {study.researcher}</small>
              </div>
            );
          })}
        </div>
      </main>

      {/* Detail panel */}
      {selectedStudy && (
        <aside
          style={{
            width: "340px",
            flexShrink: 0,
            borderLeft: "1px solid var(--color-border)",
            padding: "1.5rem",
            height: "100vh",
            position: "sticky",
            top: 0,
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {selectedStudy.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.7rem",
                    background: "var(--color-tag-bg)",
                    color: "var(--color-tag-text)",
                    borderRadius: "4px",
                    padding: "2px 8px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => setSelectedStudy(null)}
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1rem" }}
            >
              ✕
            </button>
          </div>

          <h3 style={{ marginBottom: "0.25rem" }}>{selectedStudy.title}</h3>
          <small style={{ color: "var(--color-text-muted)" }}>
            {selectedStudy.date} · {selectedStudy.participants} participants · {selectedStudy.researcher}
          </small>

          <p style={{ marginTop: "1rem" }}>{selectedStudy.summary}</p>

          {selectedStudy.quotes.map((q, i) => (
            <div
              key={i}
              style={{
                borderLeft: "2px solid var(--color-accent)",
                paddingLeft: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <p style={{ fontStyle: "italic", margin: 0 }}>"{q.text}"</p>
              {q.participant && (
                <small style={{ color: "var(--color-text-muted)" }}>- {q.participant}</small>
              )}
            </div>
          ))}

          {selectedStudy.documents.length > 0 && (
            <>
              <h4 style={{ marginTop: "1.5rem" }}>Documents</h4>
              {selectedStudy.documents.map((doc, i) => (
                <div key={i} style={{ fontSize: "0.9rem", marginBottom: "6px" }}>
                  📄 {doc.doc_type}
                </div>
              ))}
            </>
          )}

          {selectedStudy.demographics.length > 0 && (
            <>
              <h4 style={{ marginTop: "1.5rem" }}>Demographics</h4>
              {selectedStudy.demographics.map((d, i) => (
                <div key={i} style={{ fontSize: "0.9rem", marginBottom: "6px" }}>
                  <strong>{d.role}</strong>
                  {d.age_range && <span style={{ color: "var(--color-text-muted)" }}> · Age {d.age_range}</span>}
                </div>
              ))}
            </>
          )}
        </aside>
      )}
    </div>
  );
}