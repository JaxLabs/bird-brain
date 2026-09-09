"use client";

import { useState } from "react";
import BirdImage from "../components/BirdImage";
import { DocumentIcons, DemographicsIcon } from "../repository/icons";

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
  "What did blind and low vision birders tell us?",
  "What are the key findings from user feedback analysis?",
  "Tell me about the prototype testing results",
  "What insights do we have from social media analysis?",
];

export default function Ask() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<StudyDetail | null>(null);
  const [docsOpen, setDocsOpen] = useState(true);
  const [demographicsOpen, setDemographicsOpen] = useState(true);

  const started = messages.length > 0;

  async function askQuestion(text: string) {
    if (!text.trim() || loading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", text, timestamp }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errorData.detail || `Backend error: ${res.status}`);
      }

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong reaching the backend.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${errorMessage}`, timestamp },
      ]);
    } finally {
      setLoading(false);
    }
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
            // Landing state
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: "2rem" }}>
              <div style={{ width: "100%", marginBottom: "2rem", maxWidth: "100%" }}>
                <BirdImage alt="Bird photo" width={800} height={250} style={{ width: "100%", height: "auto", objectFit: "contain", borderRadius: "0 4px 4px 0" }} />
              </div>
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
                      background: "var(--color-prompt-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      padding: "0.75rem",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      color: "var(--color-text)",
                    }}
                  >
                    {p}
                  </div>
                ))}
              </div>
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
                    <div>
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2px" }}>
                        <div style={{ flexShrink: 0 }}>
                          <BirdImage alt="Assistant" width={24} height={24} rounded={true} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: "0 0 0.75rem" }}>{m.text}</p>
                          {m.studies?.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => openStudy(s.id)}
                              style={{
                                border: "1px solid var(--color-border)",
                                borderRadius: "8px",
                                padding: "0.75rem",
                                marginBottom: "0.75rem",
                                cursor: "pointer",
                                background: "white",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                  {s.tags.map((tag) => (
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
                                <small style={{ color: "var(--color-text-muted)" }}>{s.date}</small>
                              </div>
                              <h4 style={{ margin: "0.4rem 0 0.25rem" }}>{s.title}</h4>
                              <p style={{ margin: "0 0 0.5rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                                {s.summary}
                              </p>
                              {s.quotes[0] && (
                                <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                                  {s.quotes[0].text}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "32px" }}>
                        {m.timestamp}
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
            width: "340px",
            flexShrink: 0,
            borderLeft: "1px solid var(--color-border)",
            padding: "1.5rem",
            height: "calc(100vh - 57px)",
            overflowY: "auto",
            backgroundColor: "white",
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
            {selectedStudy.date} · {selectedStudy.participants} participants · {selectedStudy.researcher}
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

          {selectedStudy.demographics.length > 0 && (
            <>
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
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {selectedStudy.demographics.map((d, i) => (
                    <div
                      key={i}
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
                        {DemographicsIcon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{d.role}</div>
                        {d.age_range && (
                          <small style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Age {d.age_range}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      )}
    </div>
  );
}