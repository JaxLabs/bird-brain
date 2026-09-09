"use client";

import { useEffect, useState } from "react";
import { DocumentIcons, DemographicsIcon } from "./icons";
import { IoList, IoGrid } from "react-icons/io5";
import { IoPeople } from "react-icons/io5";
import { FiUser } from "react-icons/fi";

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
  const [docsOpen, setDocsOpen] = useState(true);
  const [demographicsOpen, setDemographicsOpen] = useState(true);

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
    padding: "6px 14px",
    borderRadius: "999px",
    border: active ? "1px solid #2e7d32" : "1px solid var(--color-border)",
    background: active ? "#e8f5e9" : "white",
    color: active ? "#2e7d32" : "var(--color-text)",
    cursor: "pointer",
    display: "inline-block",
    fontWeight: active ? 600 : 400,
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
            {filtered.length} of {studies.length}
          </span>
          <div style={{ display: "flex", border: "1px solid #e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
            <button
              onClick={() => setView("list")}
              style={{
                padding: "0.3rem 0.4rem",
                border: "none",
                background: view === "list" ? "#f0f0f0" : "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: view === "list" ? "#2e7d32" : "#999",
              }}
            >
              <IoList size={16} />
            </button>
            <button
              onClick={() => setView("grid")}
              style={{
                padding: "0.3rem 0.4rem",
                border: "none",
                borderLeft: "1px solid #e0e0e0",
                background: view === "grid" ? "#f0f0f0" : "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: view === "grid" ? "#2e7d32" : "#999",
              }}
            >
              <IoGrid size={16} />
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
            const mColor = methodologyColor(study.methodology);
            const isSelected = selectedStudy?.id === study.id;
            return (
              <div
                key={study.id}
                onClick={() => openStudy(study.id)}
                style={{
                  padding: view === "list" ? "1.25rem 0" : "1.25rem",
                  borderBottom: view === "list" ? "1px solid var(--color-border)" : "none",
                  border: view === "grid" ? "1px solid var(--color-border)" : "none",
                  borderRadius: view === "grid" ? "10px" : 0,
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#f0f7f0" : view === "grid" ? "#fafafa" : "transparent",
                  borderLeft: view === "list" && isSelected ? "4px solid #2e7d32" : "none",
                  paddingLeft: view === "list" && isSelected ? "calc(1.25rem - 4px)" : "1.25rem",
                  transition: "background-color 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", gap: "0.4rem", flex: 1 }}>
                    {study.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "0.7rem",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          background: "#e0e0e0",
                          color: "#666",
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                      {new Date(study.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.3rem" }}>
                      <IoPeople size={14} /> {study.participants}
                    </div>
                  </div>
                </div>

                <h3 style={{ margin: "0.4rem 0 0.6rem 0", fontSize: "1.05rem", fontWeight: 600 }}>{study.title}</h3>
                <p style={{ margin: "0", color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.4 }}>{study.summary}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Detail panel */}
      {selectedStudy && (
        <aside
          style={{
            width: "380px",
            flexShrink: 0,
            borderLeft: "1px solid var(--color-border)",
            padding: "1.5rem",
            height: "calc(100vh - 57px)",
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: "white",
            scrollBehavior: "smooth",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", flex: 1 }}>
              {selectedStudy.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.8rem",
                    background: "#e0e0e0",
                    color: "#666",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => setSelectedStudy(null)}
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.5rem", marginLeft: "0.5rem" }}
            >
              ✕
            </button>
          </div>

          <h2 style={{ margin: "1rem 0 0.5rem 0", fontSize: "1.3rem", fontWeight: 600 }}>{selectedStudy.title}</h2>
          <small style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            {new Date(selectedStudy.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {selectedStudy.participants} participants · {selectedStudy.researcher}
          </small>

          <p style={{ marginTop: "1.25rem", lineHeight: 1.6, fontSize: "0.95rem" }}>{selectedStudy.summary}</p>

          {selectedStudy.quotes.length > 0 && (
            <>
              {selectedStudy.quotes.map((q, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: "3px solid #4caf50",
                    paddingLeft: "1rem",
                    marginTop: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem" }}>{q.text}</p>
                  {q.participant && (
                    <small style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>- {q.participant}</small>
                  )}
                </div>
              ))}
            </>
          )}

          {selectedStudy.documents.length > 0 && (
            <>
              <h4
                onClick={() => setDocsOpen(!docsOpen)}
                style={{
                  marginTop: "1.5rem",
                  marginBottom: "1rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer"
                }}
              >
                <span>Documents</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{docsOpen ? "−" : "+"}</span>
              </h4>
              {docsOpen && <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {selectedStudy.documents.map((doc, i) => {
                  const icon = DocumentIcons[doc.doc_type as keyof typeof DocumentIcons];
                  return (
                    <a
                      key={i}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "1rem",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        fontSize: "0.95rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        cursor: "pointer",
                        backgroundColor: "#fafafa",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {icon || "📄"}
                      </div>
                      <span style={{ fontWeight: 500 }}>{doc.doc_type}</span>
                    </a>
                  );
                })}
              </div>}
            </>
          )}

          <h4
            onClick={() => setDemographicsOpen(!demographicsOpen)}
            style={{
              marginTop: "1.5rem",
              marginBottom: "1rem",
              fontSize: "1rem",
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span>Participants</span>
            <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{demographicsOpen ? "−" : "+"}</span>
          </h4>
          {demographicsOpen && (
            <div
              style={{
                padding: "1rem",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                backgroundColor: "#fafafa",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#e8f5e9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FiUser size={20} color="#2e7d32" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>{selectedStudy.participants}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>participants</div>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}