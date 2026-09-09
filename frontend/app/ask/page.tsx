"use client";

import { useState } from "react";
import BirdImage from "../components/BirdImage";

type MatchedStudy = {
  id: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  quotes: { text: string; participant: string | null }[];
};

type StudyDetail = {
  id: string;
  title: string;
  date: string;
  participants: number;
  researcher: string;
  summary: string;
  tags: string[];
  quotes: { text: string; participant: string | null; timestamp: string | null }[];
  documents: { doc_type: string; file_url: string }[];
  demographics: { role: string; age_range: string | null }[];
};

type Message = {
  role: "user" | "assistant";
  text: string;
  studies?: MatchedStudy[];
  timestamp: string;
};

const SUGGESTED_PROMPTS = [
  "What do we know about Sound ID discovery?",
  "Show me evaluative research from 2024",
  "What did users say about Bird Packs?",
  "Are there any studies on Life List motivation?",
];

export default function Ask() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<StudyDetail | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const started = messages.length > 0;

  useEffect(() => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) setSearchHistory(JSON.parse(saved));

    fetch("http://localhost:8000/bookmarks")
      .then((res) => res.json())
      .then((data) => setBookmarks(new Set(data.map((s: any) => s.id))));
  }, []);

  async function askQuestion(text: string) {
    if (!text.trim() || loading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", text, timestamp }]);
    setQuestion("");
    setLoading(true);

    const newHistory = [text, ...searchHistory.filter((q) => q !== text)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `I found ${data.studies.length} relevant studies in the archive.`,
          studies: data.studies,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong reaching the backend.", timestamp },
      ]);
    } finally {
      setLoading(false);
    }
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

  function openStudy(id: string) {
    fetch(`http://localhost:8000/studies/${id}`)
      .then((res) => res.json())
      .then(setSelectedStudy);
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 57px)", fontFamily: "sans-serif" }}>
      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
          {!started ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: "2rem" }}>
              <BirdImage alt="Bird photo" width={528} height={171} />
              <h1 style={{ marginTop: "1.5rem", color: "var(--color-text)" }}>Research Assistant</h1>
              <p style={{ color: "var(--color-text-muted)" }}>
                Ask about past studies at Merlin. I'll pull up the most relevant research from our archive.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", width: "100%", marginTop: "1.5rem" }}>
                {SUGGESTED_PROMPTS.map((p) => (
                  <div
                    key={p}
                    onClick={() => askQuestion(p)}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      color: "var(--color-text)",
                      transition: "var(--transition)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--color-surface)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-accent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
                    }}
                  >
                    {p}
                  </div>
                ))}
              </div>
              {searchHistory.length > 0 && (
                <div style={{ marginTop: "2rem", width: "100%" }}>
                  <h4 style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    Recent searches
                  </h4>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                    {searchHistory.slice(0, 5).map((q) => (
                      <div
                        key={q}
                        onClick={() => askQuestion(q)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "999px",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          transition: "var(--transition)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-accent)";
                          (e.currentTarget as HTMLDivElement).style.background = "var(--color-accent-bg)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
                          (e.currentTarget as HTMLDivElement).style.background = "var(--color-surface)";
                        }}
                      >
                        {q}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Chat state
            <div>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: "1.5rem" }}>
                  {m.role === "user" ? (
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: "var(--color-accent-bg)",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "8px",
                          fontSize: "0.95rem",
                        }}
                      >
                        {m.text}
                      </span>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                        {m.timestamp}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "var(--color-accent)",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 0.75rem" }}>{m.text}</p>
                        {m.studies?.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => openStudy(s.id)}
                            style={{
                              border: "1px solid var(--color-border)",
                              borderRadius: "var(--radius-md)",
                              padding: "0.75rem",
                              marginBottom: "0.75rem",
                              cursor: "pointer",
                              transition: "var(--transition)",
                              background: "var(--color-bg)",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px var(--color-shadow-md)";
                              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-accent)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                              <div>
                                {s.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    style={{
                                      fontSize: "0.7rem",
                                      background: "var(--color-tag-bg)",
                                      color: "var(--color-tag-text)",
                                      borderRadius: "var(--radius-sm)",
                                      padding: "2px 6px",
                                      marginRight: "4px",
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <button
                                  onClick={(e) => toggleBookmark(e, s.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    padding: 0,
                                  }}
                                  title={bookmarks.has(s.id) ? "Remove bookmark" : "Add bookmark"}
                                >
                                  {bookmarks.has(s.id) ? "⭐" : "☆"}
                                </button>
                                <small style={{ color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                                  {s.date}
                                </small>
                              </div>
                            </div>
                            <h4 style={{ margin: "0.4rem 0 0.25rem" }}>{s.title}</h4>
                            <p style={{ margin: "0 0 0.5rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                              {s.summary}
                            </p>
                            {s.quotes[0] && (
                              <p style={{ fontStyle: "italic", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                                "{s.quotes[0].text}" {s.quotes[0].participant && `- ${s.quotes[0].participant}`}
                              </p>
                            )}
                          </div>
                        ))}
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{m.timestamp}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && <p style={{ color: "var(--color-text-muted)" }}>Thinking...</p>}
            </div>
          )}
        </div>

        {/* Input bar - always visible */}
        <div style={{ padding: "1rem 2rem", borderTop: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askQuestion(question)}
              placeholder="Ask about Merlin research..."
              style={{
                flex: 1,
                padding: "0.6rem 0.9rem",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
              }}
            />
            <button
              onClick={() => askQuestion(question)}
              disabled={loading}
              style={{
                padding: "0.6rem 1rem",
                background: "var(--color-accent)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
            AI isn't always right — verify findings in the source study
          </p>
        </div>
      </div>

      {/* Detail panel */}
      {selectedStudy && (
        <aside
          style={{
            width: "320px",
            flexShrink: 0,
            borderLeft: "1px solid var(--color-border)",
            padding: "1.5rem",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {selectedStudy.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.7rem",
                    background: "var(--color-tag-bg)",
                    color: "var(--color-tag-text)",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    marginRight: "4px",
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