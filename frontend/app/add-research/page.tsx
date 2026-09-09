"use client";

import Papa from "papaparse";
import { useState } from "react";

const REQUIRED_FIELDS = [
  { field: "title", type: "string", notes: "Descriptive study title" },
  { field: "date", type: "YYYY-MM-DD", notes: "ISO date format" },
  { field: "methodology", type: "string", notes: "e.g. Interview, Codesign Session, App Review Analysis" },
  { field: "topic", type: "string", notes: "Primary research topic" },
  { field: "interaction", type: '"Moderated" | "Unmoderated" | "Survey"', notes: "Session format" },
  { field: "participants", type: "number", notes: "Total participant count" },
  { field: "researcher", type: "string", notes: "Lead researcher name" },
  { field: "features", type: "string[]", notes: "Open tags — what the research is about" },
  { field: "summary", type: "string", notes: "1-2 sentence key finding" },
  { field: "tags", type: "string[]", notes: "Lowercase keyword tags" },
];

const SUGGESTED_METHODOLOGIES = [
  "Interview", "Field Observation", "Codesign Session", "App Review Analysis",
  "Social Media Analysis", "Support Ticket Coding", "Concept Testing", "In-the-Wild Testing",
];

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.7rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border)",
  fontSize: "0.9rem",
  width: "100%",
  fontFamily: "inherit",
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

type Artifact = { artifact_type: string; source_type: "link" | "upload"; url: string; label: string };

export default function AddResearch() {
  const [status, setStatus] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<"upload" | "form">("upload");

  const [form, setForm] = useState({
    title: "",
    date: "",
    methodology: "",
    topic: "",
    interaction: "Moderated",
    participants: "",
    researcher: "",
    featuresInput: "",
    summary: "",
    tags: "",
  });

  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [newArtifactType, setNewArtifactType] = useState("");
  const [newArtifactLabel, setNewArtifactLabel] = useState("");
  const [newArtifactLink, setNewArtifactLink] = useState("");

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addLinkArtifact() {
    if (!newArtifactType || !newArtifactLink) return;
    setArtifacts((prev) => [
      ...prev,
      { artifact_type: newArtifactType, source_type: "link", url: newArtifactLink, label: newArtifactLabel },
    ]);
    setNewArtifactType("");
    setNewArtifactLabel("");
    setNewArtifactLink("");
  }

  async function addFileArtifact(file: File) {
    if (!newArtifactType) {
      setStatus('Enter an artifact type (e.g. "PDF") before uploading a file.');
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://localhost:8000/upload-file", { method: "POST", body: formData });
    const data = await res.json();
    setArtifacts((prev) => [
      ...prev,
      { artifact_type: newArtifactType, source_type: "upload", url: data.url, label: newArtifactLabel },
    ]);
    setNewArtifactType("");
    setNewArtifactLabel("");
  }

  function removeArtifact(index: number) {
    setArtifacts((prev) => prev.filter((_, i) => i !== index));
  }

  async function submitForm() {
    const study = {
      id: `study-${Date.now()}`,
      title: form.title.trim(),
      date: form.date,
      researchType: "Qual",
      methodology: form.methodology.trim(),
      topic: form.topic.trim(),
      interaction: form.interaction,
      participants: Number(form.participants) || 0,
      researcher: form.researcher.trim(),
      features: splitList(form.featuresInput),
      summary: form.summary.trim(),
      tags: splitList(form.tags),
      demographics: [],
      startingQuestions: [],
      directQuotes: [],
      documents: [],
      transcriptLink: null,
    };

    const ok = await uploadStudies([study]);
    if (!ok) return;

    for (const artifact of artifacts) {
      await fetch(`http://localhost:8000/studies/${study.id}/artifacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artifact),
      });
    }
    setArtifacts([]);
    setForm({
      title: "",
      date: "",
      methodology: "",
      topic: "",
      interaction: "Moderated",
      participants: "",
      researcher: "",
      featuresInput: "",
      summary: "",
      tags: "",
    });
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
      id: row.id?.trim() || `study-${Date.now()}`,
      title: row.title?.trim(),
      date: row.date?.trim(),
      researchType: "Qual",
      methodology: row.methodology?.trim(),
      topic: row.topic?.trim(),
      interaction: row.interaction?.trim(),
      participants: Number(row.participants) || 0,
      researcher: row.researcher?.trim(),
      features: splitList(row.features),
      summary: row.summary?.trim(),
      tags: splitList(row.tags),
      demographics: [],
      startingQuestions: [],
      directQuotes: [],
      documents: [],
      transcriptLink: row.transcriptLink?.trim() || null,
    };
  }

  async function uploadStudies(studies: any[]): Promise<boolean> {
    let successCount = 0;
    for (const study of studies) {
      try {
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
          return false;
        }
      } catch (e) {
        setStatus(`Error uploading study: ${e}`);
        return false;
      }
    }
    setStatus(`Successfully added ${successCount} stud${successCount === 1 ? "y" : "ies"}.`);
    return true;
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <main style={{ padding: "3rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--color-text)" }}>Add Research</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Upload a JSON or CSV file, or enter a study manually.
      </p>

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
            fontFamily: "inherit",
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
            fontFamily: "inherit",
          }}
        >
          Manual entry
        </button>
      </div>

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

      {mode === "form" && (
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <Field label="Title">
            <input value={form.title} onChange={(e) => updateField("title", e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Date">
            <input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} style={inputStyle} />
          </Field>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Field label="Methodology">
              <input
                list="methodology-options"
                value={form.methodology}
                onChange={(e) => updateField("methodology", e.target.value)}
                placeholder="e.g. Interview"
                style={inputStyle}
              />
              <datalist id="methodology-options">
                {SUGGESTED_METHODOLOGIES.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
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
            <Field label="Number of Participants">
              <input
                type="number"
                value={form.participants}
                onChange={(e) => updateField("participants", e.target.value)}
                style={inputStyle}
                placeholder="0"
              />
            </Field>
            <Field label="Researcher Name(s)">
              <input value={form.researcher} onChange={(e) => updateField("researcher", e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <Field label="Features (semicolon separated)">
            <input
              value={form.featuresInput}
              onChange={(e) => updateField("featuresInput", e.target.value)}
              placeholder="Sound ID; Onboarding; Notifications"
              style={inputStyle}
            />
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

          <Field label="Artifacts">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {artifacts.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem",
                    padding: "0.4rem 0.6rem",
                    background: "var(--color-tag-bg)",
                    borderRadius: "6px",
                  }}
                >
                  <span>
                    {a.source_type === "upload" ? "📄" : "🔗"} <strong>{a.artifact_type}</strong>
                    {a.label && ` — ${a.label}`}
                  </span>
                  <span onClick={() => removeArtifact(i)} style={{ cursor: "pointer", color: "#c0392b" }}>
                    ✕
                  </span>
                </div>
              ))}

              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                <input
                  placeholder="Type (e.g. Transcript, Audio, PDF)"
                  value={newArtifactType}
                  onChange={(e) => setNewArtifactType(e.target.value)}
                  style={{ ...inputStyle, width: "auto", flex: "1 1 140px" }}
                />
                <input
                  placeholder="Label (optional)"
                  value={newArtifactLabel}
                  onChange={(e) => setNewArtifactLabel(e.target.value)}
                  style={{ ...inputStyle, width: "auto", flex: "1 1 140px" }}
                />
                <input
                  placeholder="Paste a link..."
                  value={newArtifactLink}
                  onChange={(e) => setNewArtifactLink(e.target.value)}
                  style={{ ...inputStyle, width: "auto", flex: "1 1 180px" }}
                />
                <button
                  onClick={addLinkArtifact}
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Add link
                </button>
              </div>

              <div>
                <label
                  style={{
                    display: "inline-block",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "6px",
                    border: "1px dashed var(--color-border)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  📎 Or upload a file
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) addFileArtifact(file);
                    }}
                  />
                </label>
              </div>
            </div>
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
              fontFamily: "inherit",
            }}
          >
            Add Study
          </button>

          {status && (
            <p style={{ color: status.startsWith("Error") ? "#c0392b" : "var(--color-accent)" }}>{status}</p>
          )}
        </div>
      )}
    </main>
  );
}