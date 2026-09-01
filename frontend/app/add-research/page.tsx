"use client";

import Papa from "papaparse";
import { useState } from "react";

const REQUIRED_FIELDS = [
  { field: "id", type: "string", notes: "Unique identifier, no spaces" },
  { field: "title", type: "string", notes: "Descriptive study title" },
  { field: "date", type: "YYYY-MM-DD", notes: "ISO date format" },
  { field: "researchType", type: '"Qual" | "Quant"', notes: "Qualitative or Quantitative" },
  { field: "methodology", type: '"Evaluative" | "Generative"', notes: "Study methodology" },
  { field: "topic", type: "string", notes: "Primary research topic" },
  { field: "interaction", type: '"Moderated" | "Unmoderated" | "Survey"', notes: "Session format" },
  { field: "participants", type: "number", notes: "Total participant count" },
  { field: "researcher", type: "string", notes: "Lead researcher name" },
  { field: "features", type: "string[]", notes: "Merlin features covered (see list below)" },
  { field: "summary", type: "string", notes: "1-2 sentence key finding" },
  { field: "tags", type: "string[]", notes: "Lowercase keyword tags" },
  { field: "demographics", type: "object[]", notes: "{ age, role, tenure }" },
  { field: "startingQuestions", type: "string[]", notes: "Interview questions used" },
  { field: "directQuotes", type: "object[]", notes: "{ text, participant, timestamp }" },
  { field: "transcriptLink", type: "string", notes: "URL or path to transcript" },
];

const VALID_FEATURES = [
  "Photo ID", "Sound ID", "Bird Packs", "Explore", "Life List",
  "ID Wizard", "Range Maps", "eBird", "Notifications", "Onboarding", "Search",
];

const EXAMPLE_JSON = `{
  "id": "sound-id-discovery-01",
  "title": "Sound ID First-Time Discovery",
  "date": "2024-11-14",
  "researchType": "Qual",
  "methodology": "Generative",
  "topic": "Sound ID",
  "interaction": "Moderated",
  "participants": 8,
  "researcher": "Jax Powell",
  "features": ["Sound ID", "Onboarding"],
  "summary": "Most users discovered Sound ID accidentally.",
  "tags": ["onboarding", "discoverability"],
  "demographics": [{ "role": "Casual birder", "age_range": "24-32" }],
  "startingQuestions": ["How did you first learn about Sound ID?"],
  "directQuotes": [{ "text": "I didn't realize...", "participant": "P4" }],
  "documents": [{ "doc_type": "Research Report", "file_url": "https://..." }]
}`;

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.7rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border)",
  fontSize: "0.9rem",
  width: "100%",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(";").map((v) => v.trim()).filter(Boolean);
}

export default function AddResearch() {
  const [status, setStatus] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [mode, setMode] = useState<"upload" | "form">("upload");

  const [form, setForm] = useState({
    id: "",
    title: "",
    date: "",
    researchType: "Qual",
    methodology: "Evaluative",
    topic: "",
    interaction: "Moderated",
    participants: "",
    researcher: "",
    features: [] as string[],
    summary: "",
    tags: "",
    startingQuestions: "",
  });

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleFeature(feature: string) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  }

  async function submitForm() {
    const study = {
      id: form.id.trim(),
      title: form.title.trim(),
      date: form.date,
      researchType: form.researchType,
      methodology: form.methodology,
      topic: form.topic.trim(),
      interaction: form.interaction,
      participants: Number(form.participants) || 0,
      researcher: form.researcher.trim(),
      features: form.features,
      summary: form.summary.trim(),
      tags: splitList(form.tags),
      demographics: [],
      startingQuestions: splitList(form.startingQuestions),
      directQuotes: [],
      documents: [],
      transcriptLink: null,
    };
    await uploadStudies([study]);
  }

  async function processFile(file: File) {
    setStatus("Uploading...");

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const studies = (results.data as any[]).map(csvRowToStudy);
            await uploadStudies(studies);
          } catch {
            setStatus("Failed to parse CSV. Check column names match the schema.");
          }
        },
        error: () => setStatus("Failed to read CSV file."),
      });
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const studies = Array.isArray(data) ? data : [data];
      await uploadStudies(studies);
    } catch {
      setStatus("Failed to parse file. Make sure it's valid JSON.");
    }
  }

  function csvRowToStudy(row: any) {
    return {
      id: row.id?.trim(),
      title: row.title?.trim(),
      date: row.date?.trim(),
      researchType: row.researchType?.trim(),
      methodology: row.methodology?.trim(),
      topic: row.topic?.trim(),
      interaction: row.interaction?.trim(),
      participants: Number(row.participants) || 0,
      researcher: row.researcher?.trim(),
      features: splitList(row.features),
      summary: row.summary?.trim(),
      tags: splitList(row.tags),
      demographics: [],
      startingQuestions: splitList(row.startingQuestions),
      directQuotes: [],
      documents: [],
      transcriptLink: row.transcriptLink?.trim() || null,
    };
  }

  async function uploadStudies(studies: any[]) {
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
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <main style={{ padding: "3rem 2rem", fontFamily: "sans-serif", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--color-text)" }}>Add Research</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Upload a JSON or CSV file, or enter a study manually. Each study must follow the schema below.
      </p>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
        <button
          onClick={() => setMode("upload")}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            background: mode === "upload" ? "var(--color-accent)" : "white",
            color: mode === "upload" ? "white" : "var(--color-text)",
            cursor: "pointer",
          }}
        >
          Upload file
        </button>
        <button
          onClick={() => setMode("form")}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            background: mode === "form" ? "var(--color-accent)" : "white",
            color: mode === "form" ? "white" : "var(--color-text)",
            cursor: "pointer",
          }}
        >
          Manual entry
        </button>
      </div>

      {/* Upload mode */}
      {mode === "upload" && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            style={{
              border: `2px dashed ${dragOver ? "var(--color-accent)" : "var(--color-border)"}`,
              borderRadius: "10px",
              padding: "2.5rem",
              textAlign: "center",
              cursor: "pointer",
              background: dragOver ? "var(--color-accent-bg)" : "transparent",
              marginTop: "1.5rem",
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>⬆️</div>
            <p style={{ fontWeight: 600, margin: "0.5rem 0 0.25rem" }}>Drop a file here or click to browse</p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
              Accepts .json or .csv — Single study or array of studies
            </p>
            <input
              id="file-input"
              type="file"
              accept=".json,.csv"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              style={{ display: "none" }}
            />
          </div>

          {status && (
            <p style={{ marginTop: "1rem", color: status.startsWith("Error") ? "#c0392b" : "var(--color-accent)" }}>
              {status}
            </p>
          )}
        </>
      )}

      {/* Manual entry mode */}
      {mode === "form" && (
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <Field label="ID">
            <input value={form.id} onChange={(e) => updateField("id", e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Title">
            <input value={form.title} onChange={(e) => updateField("title", e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Date">
            <input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} style={inputStyle} />
          </Field>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Field label="Research Type">
              <select value={form.researchType} onChange={(e) => updateField("researchType", e.target.value)} style={inputStyle}>
                <option value="Qual">Qual</option>
                <option value="Quant">Quant</option>
              </select>
            </Field>
            <Field label="Methodology">
              <select value={form.methodology} onChange={(e) => updateField("methodology", e.target.value)} style={inputStyle}>
                <option value="Evaluative">Evaluative</option>
                <option value="Generative">Generative</option>
              </select>
            </Field>
            <Field label="Interaction">
              <select value={form.interaction} onChange={(e) => updateField("interaction", e.target.value)} style={inputStyle}>
                <option value="Moderated">Moderated</option>
                <option value="Unmoderated">Unmoderated</option>
                <option value="Survey">Survey</option>
              </select>
            </Field>
          </div>

          <Field label="Topic">
            <input value={form.topic} onChange={(e) => updateField("topic", e.target.value)} style={inputStyle} />
          </Field>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Field label="Participants">
              <input
                type="number"
                value={form.participants}
                onChange={(e) => updateField("participants", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Researcher">
              <input value={form.researcher} onChange={(e) => updateField("researcher", e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <Field label="Merlin Features">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {VALID_FEATURES.map((f) => (
                <span
                  key={f}
                  onClick={() => toggleFeature(f)}
                  style={{
                    fontSize: "0.75rem",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    cursor: "pointer",
                    border: "1px solid var(--color-border)",
                    background: form.features.includes(f) ? "var(--color-accent)" : "white",
                    color: form.features.includes(f) ? "white" : "var(--color-text)",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </Field>

          <Field label="Summary">
            <textarea
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>

          <Field label="Tags (semicolon separated)">
            <input
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="onboarding; discoverability"
              style={inputStyle}
            />
          </Field>

          <Field label="Starting Questions (semicolon separated)">
            <input
              value={form.startingQuestions}
              onChange={(e) => updateField("startingQuestions", e.target.value)}
              placeholder="How did you first learn about...?"
              style={inputStyle}
            />
          </Field>

          <button
            onClick={submitForm}
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem 1.2rem",
              background: "var(--color-accent)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            Add Study
          </button>

          {status && (
            <p style={{ color: status.startsWith("Error") ? "#c0392b" : "var(--color-accent)" }}>{status}</p>
          )}
        </div>
      )}

      {/* Required fields table */}
      <h3 style={{ marginTop: "2.5rem" }}>Required Fields</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
            <th style={{ padding: "0.5rem 0" }}>Field</th>
            <th style={{ padding: "0.5rem 0" }}>Type</th>
            <th style={{ padding: "0.5rem 0" }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {REQUIRED_FIELDS.map((f) => (
            <tr key={f.field} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: "0.5rem 0", fontFamily: "monospace" }}>{f.field}</td>
              <td style={{ padding: "0.5rem 0", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                {f.type}
              </td>
              <td style={{ padding: "0.5rem 0", color: "var(--color-text-muted)" }}>{f.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Valid feature values */}
      <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--color-tag-bg)", borderRadius: "8px" }}>
        <p style={{ fontSize: "0.8rem", fontFamily: "monospace", margin: "0 0 0.5rem", color: "var(--color-text-muted)" }}>
          VALID VALUES FOR FEATURES
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {VALID_FEATURES.map((f) => (
            <span
              key={f}
              style={{
                fontSize: "0.75rem",
                background: "white",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                padding: "2px 8px",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Collapsible: Example JSON */}
      <div style={{ marginTop: "1rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
        <div
          onClick={() => setShowExample(!showExample)}
          style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: 600 }}
        >
          <span>📄 Example JSON</span>
          <span>{showExample ? "▲" : "▼"}</span>
        </div>
        {showExample && (
          <pre
            style={{
              background: "#f7f7f7",
              padding: "1rem",
              borderRadius: "8px",
              fontSize: "0.75rem",
              overflowX: "auto",
              marginTop: "0.75rem",
            }}
          >
            {EXAMPLE_JSON}
          </pre>
        )}
      </div>

      {/* Collapsible: CSV Column Reference */}
      <div style={{ marginTop: "0.5rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
        <div
          onClick={() => setShowCsv(!showCsv)}
          style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: 600 }}
        >
          <span>📄 CSV Column Reference</span>
          <span>{showCsv ? "▲" : "▼"}</span>
        </div>
        {showCsv && (
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.75rem" }}>
            <p>
              CSV columns should match field names exactly: <code>id, title, date, researchType, methodology,
                topic, interaction, participants, researcher, features, summary, tags, startingQuestions, transcriptLink</code>
            </p>
            <p>
              For list fields (<code>features</code>, <code>tags</code>, <code>startingQuestions</code>), separate
              multiple values within a cell using a semicolon — e.g. <code>Sound ID;Onboarding</code>
            </p>
            <p>
              Note: demographics and direct quotes aren't supported via CSV since they're nested objects — use
              JSON if a study needs those.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}