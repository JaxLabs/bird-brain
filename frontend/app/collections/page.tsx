"use client";

import { useEffect, useState } from "react";

type Collection = {
  id: string;
  name: string;
  description?: string;
  studyCount?: number;
};

type CollectionDetail = Collection & {
  studies: any[];
};

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<CollectionDetail | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    loadCollections();
  }, []);

  function loadCollections() {
    fetch("http://localhost:8000/collections")
      .then((res) => res.json())
      .then(setCollections);
  }

  async function createCollection() {
    if (!newName.trim()) return;

    const res = await fetch("http://localhost:8000/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDescription }),
    });

    if (res.ok) {
      setNewName("");
      setNewDescription("");
      setShowNew(false);
      loadCollections();
    }
  }

  async function openCollection(id: string) {
    const res = await fetch(`http://localhost:8000/collections/${id}`);
    const data = await res.json();
    setSelectedCollection(data);
  }

  async function deleteCollection(id: string) {
    if (!confirm("Delete this collection?")) return;

    const res = await fetch(`http://localhost:8000/collections/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSelectedCollection(null);
      loadCollections();
    }
  }

  async function removeStudyFromCollection(studyId: string) {
    if (!selectedCollection) return;

    const res = await fetch(
      `http://localhost:8000/collections/${selectedCollection.id}/studies/${studyId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      openCollection(selectedCollection.id);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 57px)" }}>
      <aside style={{ width: "300px", flexShrink: 0, padding: "1.5rem", borderRight: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", margin: 0 }}>Collections</h2>
          <button
            onClick={() => setShowNew(true)}
            style={{
              background: "var(--color-accent)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "0.5rem 0.75rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            +
          </button>
        </div>

        {showNew && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
            <input
              type="text"
              placeholder="Collection name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                marginBottom: "0.5rem",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontFamily: "inherit",
              }}
            />
            <textarea
              placeholder="Description (optional)..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                padding: "0.6rem",
                marginBottom: "0.5rem",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={createCollection}
                style={{
                  flex: 1,
                  background: "var(--color-accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  padding: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Create
              </button>
              <button
                onClick={() => setShowNew(false)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => openCollection(col.id)}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                background: selectedCollection?.id === col.id ? "var(--color-accent)" : "transparent",
                color: selectedCollection?.id === col.id ? "white" : "var(--color-text)",
                cursor: "pointer",
                transition: "var(--transition)",
                border: "1px solid " + (selectedCollection?.id === col.id ? "transparent" : "var(--color-border)"),
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>📁 {col.name}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                {col.studyCount || 0} studies
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {selectedCollection ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "2rem" }}>
              <div>
                <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem" }}>{selectedCollection.name}</h1>
                {selectedCollection.description && (
                  <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
                    {selectedCollection.description}
                  </p>
                )}
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  {selectedCollection.studies.length} studies
                </p>
              </div>
              <button
                onClick={() => deleteCollection(selectedCollection.id)}
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  padding: "0.6rem 1rem",
                  cursor: "pointer",
                }}
              >
                Delete Collection
              </button>
            </div>

            {selectedCollection.studies.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                <p>No studies in this collection yet.</p>
                <p style={{ fontSize: "0.9rem" }}>
                  Add studies from the Repository page.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {selectedCollection.studies.map((study) => (
                  <div
                    key={study.id}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-lg)",
                      padding: "1.25rem",
                      background: "var(--color-bg)",
                      transition: "var(--transition)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 4px 12px var(--color-shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          background:
                            study.researchType === "Qual"
                              ? "#d1fae5"
                              : "#bfdbfe",
                          color:
                            study.researchType === "Qual"
                              ? "#065f46"
                              : "#1e40af",
                          fontWeight: 600,
                        }}
                      >
                        {study.researchType}
                      </span>
                      <button
                        onClick={() => removeStudyFromCollection(study.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1rem",
                          color: "var(--color-text-muted)",
                        }}
                        title="Remove from collection"
                      >
                        ✕
                      </button>
                    </div>
                    <h3 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>
                      {study.title}
                    </h3>
                    <p
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: "0.9rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {study.summary}
                    </p>
                    <small style={{ color: "var(--color-text-muted)" }}>
                      👥 {study.participants} • 📅 {study.date}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              color: "var(--color-text-muted)",
            }}
          >
            <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
              📁 No collection selected
            </p>
            <p>Select or create a collection to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}