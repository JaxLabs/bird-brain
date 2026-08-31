"use client";

import { useState } from "react";

type MatchedStudy = {
  id: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  quotes: { text: string; participant: string | null }[];
};

export default function Ask() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [studies, setStudies] = useState<MatchedStudy[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setStudies([]);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer);
      setStudies(data.studies);
    } catch (e) {
      setAnswer("Something went wrong reaching the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "700px" }}>
      <h1>Ask</h1>
      <p>Ask about past studies at Merlin. I'll pull up the most relevant research from our archive.</p>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask about Merlin research..."
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={handleAsk} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {answer && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>{answer}</p>

          {studies.map((s) => (
            <div
              key={s.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                marginTop: "1rem",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                {s.tags.map((tag) => (
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
              <h4 style={{ margin: "0 0 0.25rem" }}>{s.title}</h4>
              <p style={{ margin: "0 0 0.5rem", color: "#555" }}>{s.summary}</p>
              {s.quotes[0] && (
                <p style={{ fontStyle: "italic", color: "#777" }}>
                  "{s.quotes[0].text}" {s.quotes[0].participant && `- ${s.quotes[0].participant}`}
                </p>
              )}
              <small style={{ color: "#888" }}>{s.date}</small>
            </div>
          ))}

          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#999" }}>
            AI isn't always right — verify findings in the source study.
          </p>
        </div>
      )}
    </main>
  );
}