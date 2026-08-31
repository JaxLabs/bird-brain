"use client";

import BirdImage from "./components/BirdImage";

export default function Home() {
  const prompts = [
    "What do we know about Sound ID discovery?",
    "Show me evaluative research from 2024",
    "What did users say about Bird Packs?",
    "Are there any studies on Life List motivation?",
  ];

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 2rem",
        fontFamily: "sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <BirdImage src="/images/birds/puffins.png" alt="Puffins" width={400} height={220} />

      <h1 style={{ marginTop: "1.5rem", color: "var(--color-text)" }}>Research Assistant</h1>
      <p style={{ color: "var(--color-text-muted)", textAlign: "center" }}>
        Ask about past studies at Merlin. I'll pull up the most relevant research from our archive.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
          width: "100%",
          marginTop: "1.5rem",
        }}
      >
        {prompts.map((p) => (
          <div
            key={p}
            style={{
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
    </main>
  );
}