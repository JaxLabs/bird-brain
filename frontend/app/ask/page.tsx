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
  headline?: string;
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
      {/* Full page research view */}
      {selectedStudy && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", backgroundColor: "white" }}>
          {/* Back button and header */}
          <div style={{ padding: "2rem 3rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setSelectedStudy(null)}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "var(--color-text)",
                padding: 0,
              }}
            >
              ←
            </button>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600, flex: 1 }}>Research Details</h1>
          </div>

          {/* Article content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "3rem" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
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

              {/* Title */}
              <h1 style={{ margin: "0 0 1rem 0", fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 }}>
                {selectedStudy.headline || selectedStudy.title}
              </h1>
              {selectedStudy.headline && (
                <p style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                  {selectedStudy.title}
                </p>
              )}

              {/* Metadata */}
              <div style={{ color: "var(--color-text-muted)", fontSize: "1rem", marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Date</div>
                    <div style={{ fontWeight: 500, color: "var(--color-text)" }}>{selectedStudy.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Participants</div>
                    <div style={{ fontWeight: 500, color: "var(--color-text)" }}>{selectedStudy.participants}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Researcher</div>
                    <div style={{ fontWeight: 500, color: "var(--color-text)" }}>{selectedStudy.researcher}</div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.3rem", fontWeight: 600 }}>Summary</h2>
                <p style={{ lineHeight: 1.8, fontSize: "1.05rem", color: "var(--color-text)", margin: 0 }}>
                  {selectedStudy.summary}
                </p>
              </div>

              {/* Quotes */}
              {selectedStudy.quotes.length > 0 && (
                <div style={{ marginBottom: "3rem" }}>
                  <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.3rem", fontWeight: 600 }}>Key Quotes</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {selectedStudy.quotes.map((q, i) => (
                      <div
                        key={i}
                        style={{
                          borderLeft: "4px solid #4caf50",
                          paddingLeft: "1.5rem",
                          fontStyle: "italic",
                          fontSize: "1rem",
                          lineHeight: 1.7,
                        }}
                      >
                        <p style={{ margin: "0 0 0.5rem 0", color: "var(--color-text)" }}>"{q.text}"</p>
                        {q.participant && (
                          <small style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>— {q.participant}</small>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedStudy.documents.length > 0 && (
                <div style={{ marginBottom: "3rem" }}>
                  <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.3rem", fontWeight: 600 }}>Documents</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {selectedStudy.documents.map((doc, i) => {
                      const icon = DocumentIcons[doc.doc_type as keyof typeof DocumentIcons];
                      return (
                        <a
                          key={i}
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "1.25rem",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            cursor: "pointer",
                            backgroundColor: "var(--color-bg)",
                            textDecoration: "none",
                            color: "inherit",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent-bg)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.3rem" }}>
                            {icon || "📄"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{doc.doc_type}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Click to open</div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Demographics */}
              {selectedStudy.demographics.length > 0 && (
                <div>
                  <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.3rem", fontWeight: 600 }}>Participants</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {selectedStudy.demographics.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "1.25rem",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          backgroundColor: "var(--color-bg)",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            backgroundColor: "#e8f5e9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: "1.5rem",
                          }}
                        >
                          {DemographicsIcon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "1rem" }}>{d.role}</div>
                          {d.age_range && (
                            <small style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Age {d.age_range}</small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main column (hidden when viewing study) */}
      {!selectedStudy && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {!started ? (
            // Landing state
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: "900px", margin: "3rem auto 0", padding: "0 3rem" }}>
              <div style={{ width: "100%", marginBottom: "1.5rem", borderRadius: "3px", overflow: "hidden" }}>
                <BirdImage alt="Bird photo" width={800} height={250} style={{ width: "100%", height: "auto", objectFit: "contain" }} />
              </div>
              <h1 style={{ margin: "0 0 0.75rem 0", color: "var(--color-text)", fontSize: "2rem" }}>Research Assistant</h1>
              <p style={{ color: "var(--color-text-muted)", margin: "0 0 2rem 0" }}>
                Ask about past studies at Merlin. I'll pull up the most relevant research from our archive.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", width: "100%" }}>
                {SUGGESTED_PROMPTS.map((p) => (
                  <div
                    key={p}
                    onClick={() => askQuestion(p)}
                    style={{
                      background: "var(--color-prompt-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      padding: "1rem 0.75rem",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      color: "var(--color-text)",
                      textAlign: "center",
                      lineHeight: "1.4",
                    }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Chat state
            <div style={{ padding: "3rem", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
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
        <div style={{ borderTop: "1px solid var(--color-border)", padding: "1rem 2rem 4rem 2rem", margin: "0 auto", maxWidth: "900px", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askQuestion(question)}
                placeholder="Ask about Merlin research..."
                style={{
                  flex: 1,
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  fontSize: "1rem",
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
      </div>
        )
      }
    </div>
  );
}