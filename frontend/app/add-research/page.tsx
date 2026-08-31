"use client";

import { useState } from "react";

export default function AddResearch() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  async function handleUpload() {
    if (!file) return;
    setStatus("Uploading...");

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const studies = Array.isArray(data) ? data : [data];

      let successCount = 0;
      for (const study of studies) {
        const res = await fetch("http://localhost:8000/studies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(study),
        });
        if (res.ok) {
          successCount++;
        } else {
          const err = await res.json();
          setStatus(`Error on "${study.id}": ${err.detail}`);
          return;
        }
      }
      setStatus(`Successfully added ${successCount} stud${successCount === 1 ? "y" : "ies"}.`);
    } catch (e) {
      setStatus("Failed to parse file. Make sure it's valid JSON.");
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px" }}>
      <h1>Add Research</h1>
      <p>Upload a JSON file to add studies to the repository.</p>

      <input
        type="file"
        accept=".json"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{ marginTop: "1rem" }}
      />

      <br />

      <button
        onClick={handleUpload}
        disabled={!file}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "var(--color-accent)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Upload
      </button>

      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
    </main>
  );
}