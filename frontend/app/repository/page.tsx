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
  if (type === "Qual") return { bg: "#d1fae5", text: "#065f46" };
  if (type === "Quant") return { bg: "#bfdbfe", text: "#1e40af" };
  return { bg: "var(--color-tag-bg)", text: "var(--color-tag-text)" };
}

export default function Repository() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [filterOptions, setFilterOptions] = useState<Filters>({ features: [], tags: [] });
  const [search, setSearch] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<StudyDetail | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");
  const [selectedStudyIds, setSelectedStudyIds] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showCollections, setShowCollections] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "title" | "participants">("date");

  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: "",
    dateTo: "",
    participantsMin: "",
    participantsMax: "",
    methodology: "",
  });

  useEffect(() => {
    fetch("http://localhost:8000/filters")
      .then((res) => res.json())
      .then(setFilterOptions);

    fetch("http://localhost:8000/bookmarks")
      .then((res) => res.json())
      .then((data) => setBookmarks(new Set(data.map((s: Study) => s.id))));

    fetch("http://localhost:8000/collections")
      .then((res) => res.json())
      .then(setCollections);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedFeatures.length) params.set("features", selectedFeatures.join(","));
    if (selectedTags.length) params.set("tags", selectedTags.join(","));
    if (search) params.set("search", search);
    if (advancedFilters.dateFrom) params.set("dateFrom", advancedFilters.dateFrom);
    if (advancedFilters.dateTo) params.set("dateTo", advancedFilters.dateTo);
    if (advancedFilters.participantsMin) params.set("participantsMin", advancedFilters.participantsMin);
    if (advancedFilters.participantsMax) params.set("participantsMax", advancedFilters.participantsMax);
    if (advancedFilters.methodology) params.set("methodology", advancedFilters.methodology);

    fetch(`http://localhost:8000/studies?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        let sorted = [...data];
        if (sortBy === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortBy === "participants") sorted.sort((a, b) => b.participants - a.participants);
        else sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setStudies(sorted);
      })
      .catch(() => setStudies([]))
      .finally(() => setLoading(false));
  }, [selectedFeatures, selectedTags, search, advancedFilters, sortBy]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function toggleStudySelect(id: string) {
    const newSet = new Set(selectedStudyIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStudyIds(newSet);
  }

  function toggleBookmark(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const isBookmarked = bookmarks.has(id);
    const url = `http://localhost:8000/studies/${id}/bookmark`;
    const method = isBookmarked ? "DELETE" : "POST";

    fetch(url, { method }).then(() => {
      const newSet = new Set(bookmarks);
      if (isBookmarked) newSet.delete(id);
      else newSet.add(id);
      setBookmarks(newSet);
    });
  }

  async function openStudy(id: string) {
    const res = await fetch(`http://localhost:8000/studies/${id}`);
    const data = await res.json();
    setSelectedStudy(data);
  }

  const filterPillStyle = (active: boolean): React.CSSProperties => ({
    fontSize: "0.8rem",
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid var(--color-border)",
    background: active ? "var(--color-accent)" : "transparent",
    color: active ? "white" : "var(--color-text)",
    cursor: "pointer",
    display: "inline-block",
    transition: "var(--transition)",
  });

  const inputStyle: React.CSSProperties = {
    padding: "0.5rem 0.7rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--color-border)",
    fontSize: "0.85rem",
    fontFamily: "inherit",
    width: "100%",
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 57px)" }}>
      <aside
        style={{
          width: "260px",
          flexShrink: 0,
          padding: "1.5rem 1.25rem",
          borderRight: "1px solid var(--color-border)",
          overflowY: "auto",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <h4 style={{ marginTop: 0, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Filters
        </h4>

        <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            Search
          </label>
          <input
            type="text"
            placeholder="Title, summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
        </div>

        <details style={{ marginTop: "1.5rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
          <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
            Advanced Filters
          </summary>
          <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>From Date</label>
              <input
                type="date"
                value={advancedFilters.dateFrom}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>To Date</label>
              <input
                type="date"
                value={advancedFilters.dateTo}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Participants (Min)</label>
              <input
                type="number"
                value={advancedFilters.participantsMin}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, participantsMin: e.target.value })}
                style={inputStyle}
                placeholder="0"
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Participants (Max)</label>
              <input
                type="number"
                value={advancedFilters.participantsMax}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, participantsMax: e.target.value })}
                style={inputStyle}
                placeholder="999"
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Methodology</label>
              <input
                type="text"
                value={advancedFilters.methodology}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, methodology: e.target.value })}
                style={inputStyle}
                placeholder="e.g. Interview"
              />
            </div>
          </div>
        </details>

        <div style={{ marginTop: "1.5rem" }}>
          <h5 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.6rem" }}>Merlin Features</h5>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {filterOptions.features.map((f) => (
              <span
                key={f}
                onClick={() => toggle(selectedFeatures, setSelectedFeatures, f)}
                style={filterPillStyle(selectedFeatures.includes(f))}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "1.75rem" }}>
          <h5 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.6rem" }}>Topics</h5>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {filterOptions.tags.map((t) => (
              <span
                key={t}
                onClick={() => toggle(selectedTags, setSelectedTags, t)}
                style={filterPillStyle(selectedTags.includes(t))}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "1.5rem 2rem", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: "0.55rem 0.9rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontFamily: "inherit",
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="participants">Sort by Participants</option>
          </select>

          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {studies.length} studies {selectedStudyIds.size > 0 && `(${selectedStudyIds.size} selected)`}
            </span>
            <div style={{ display: "flex", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <button
                onClick={() => setView("list")}
                style={{
                  padding: "0.4rem 0.6rem",
                  border: "none",
                  background: view === "list" ? "var(--color-accent)" : "transparent",
                  color: view === "list" ? "white" : "var(--color-text)",
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
                  background: view === "grid" ? "var(--color-accent)" : "transparent",
                  color: view === "grid" ? "white" : "var(--color-text)",
                  cursor: "pointer",
                }}
              >
                ▦
              </button>
            </div>
          </div>
        </div>

        {selectedStudyIds.size > 0 && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", backgroundColor: "var(--color-accent-bg)", borderRadius: "var(--radius-md)", display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setShowCollections(true)}
              style={{ padding: "0.4rem 0.8rem", borderRadius: "var(--radius-md)", background: "var(--color-accent)", color: "white", border: "none", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Add to Collection
            </button>
            <button
              onClick={() => {
                const ids = Array.from(selectedStudyIds);
                fetch("http://localhost:8000/studies/export/csv", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ study_ids: ids }),
                }).then((res) => res.json()).then((data) => {
                  const blob = new Blob([data.data], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = data.filename;
                  a.click();
                });
              }}
              style={{ padding: "0.4rem 0.8rem", borderRadius: "var(--radius-md)", background: "var(--color-accent)", color: "white", border: "none", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Export CSV
            </button>
            <button
              onClick={() => setSelectedStudyIds(new Set())}
              style={{ marginLeft: "auto", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-md)", background: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Clear Selection
            </button>
          </div>
        )}

        <div
          style={{
            flex: 1,
            display: view === "grid" ? "grid" : "block",
            gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(350px, 1fr))" : undefined,
            gap: view === "grid" ? "1rem" : 0,
            overflowY: "auto",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", gridColumn: "1 / -1" }}>
              <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
            </div>
          ) : studies.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", gridColumn: "1 / -1" }}>
              <p style={{ color: "var(--color-text-muted)" }}>No studies found</p>
            </div>
          ) : (
            studies.map((study) => {
              const rtColor = researchTypeColor(study.researchType);
              const isSelected = selectedStudyIds.has(study.id);
              const isBookmarked = bookmarks.has(study.id);

              return (
                <div
                  key={study.id}
                  onClick={() => openStudy(study.id)}
                  style={{
                    padding: view === "grid" ? "1.1rem" : "1.1rem 0",
                    borderBottom: view === "list" ? "1px solid var(--color-border)" : "none",
                    border: view === "grid" ? "1px solid var(--color-border)" : undefined,
                    borderRadius: view === "grid" ? "var(--radius-lg)" : 0,
                    cursor: "pointer",
                    background: isSelected ? "var(--color-accent-bg)" : "transparent",
                    transition: "var(--transition)",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (view === "grid") (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px var(--color-shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleStudySelect(study.id);
                      }}
                      style={{ marginTop: "2px", cursor: "pointer" }}
                    />
                    <div style={{ display: "flex", gap: "0.4rem", flex: 1 }}>
                      <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "var(--radius-sm)", background: rtColor.bg, color: rtColor.text, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {study.researchType}
                      </span>
                      {study.methodology && (
                        <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "var(--radius-sm)", background: "var(--color-tag-bg)", color: "var(--color-tag-text)", fontWeight: 600 }}>
                          {study.methodology.substring(0, 20)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => toggleBookmark(e, study.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        padding: 0,
                      }}
                      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                    >
                      {isBookmarked ? "⭐" : "☆"}
                    </button>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(study.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <h3 style={{ margin: "0.6rem 0 0.4rem", fontSize: "1.05rem" }}>{study.title}</h3>
                  <p style={{ margin: "0 0 0.5rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{study.summary}</p>

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    {study.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "0.7rem",
                          background: "var(--color-tag-bg)",
                          color: "var(--color-tag-text)",
                          borderRadius: "var(--radius-sm)",
                          padding: "2px 6px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {study.tags.length > 3 && (
                      <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                        +{study.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <small style={{ color: "var(--color-text-muted)" }}>👥 {study.participants} • 🔬 {study.researcher}</small>
                </div>
              );
            })
          )}
        </div>
      </main>

      {selectedStudy && (
        <aside
          style={{
            width: "360px",
            flexShrink: 0,
            borderLeft: "1px solid var(--color-border)",
            padding: "1.5rem",
            height: "calc(100vh - 57px)",
            position: "sticky",
            top: "57px",
            overflowY: "auto",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", flex: 1 }}>
              {selectedStudy.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.7rem",
                    background: "var(--color-tag-bg)",
                    color: "var(--color-tag-text)",
                    borderRadius: "var(--radius-sm)",
                    padding: "2px 8px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => setSelectedStudy(null)}
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.2rem", padding: 0 }}
            >
              ✕
            </button>
          </div>

          <h3 style={{ marginBottom: "0.25rem" }}>{selectedStudy.title}</h3>
          <small style={{ color: "var(--color-text-muted)" }}>
            {selectedStudy.date} · {selectedStudy.participants} participants · {selectedStudy.researcher}
          </small>

          <p style={{ marginTop: "1rem" }}>{selectedStudy.summary}</p>

          {selectedStudy.quotes.slice(0, 2).map((q, i) => (
            <div
              key={i}
              style={{
                borderLeft: "3px solid var(--color-accent)",
                paddingLeft: "0.75rem",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              <p style={{ fontStyle: "italic", margin: "0 0 0.25rem" }}>"{q.text}"</p>
              {q.participant && <small style={{ color: "var(--color-text-muted)" }}>— {q.participant}</small>}
            </div>
          ))}

          {selectedStudy.documents.length > 0 && (
            <>
              <h4 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>📄 Documents</h4>
              {selectedStudy.documents.map((doc, i) => (
                <div key={i} style={{ fontSize: "0.85rem", marginBottom: "6px", color: "var(--color-text-muted)" }}>
                  {doc.doc_type}
                </div>
              ))}
            </>
          )}
        </aside>
      )}
    </div>
  );
}