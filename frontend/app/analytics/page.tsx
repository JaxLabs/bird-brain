"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalStudies: number;
  byType: Record<string, number>;
  byMethodology: Record<string, number>;
  byTopic: Record<string, number>;
  byTag: Record<string, number>;
  totalParticipants: number;
  dateRange: { min: string; max: string };
};

type TimelineEntry = {
  date: string;
  count: number;
};

export default function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/stats").then((r) => r.json()),
      fetch("http://localhost:8000/timeline").then((r) => r.json()),
    ])
      .then(([statsData, timelineData]) => {
        setStats(statsData);
        setTimeline(timelineData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Loading analytics...</h1>
      </main>
    );
  }

  if (!stats) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Error loading analytics</h1>
      </main>
    );
  }

  const topMethodologies = Object.entries(stats.byMethodology)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topTopics = Object.entries(stats.byTopic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topTags = Object.entries(stats.byTag)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const maxCount = Math.max(
    ...topMethodologies.map((x) => x[1]),
    ...topTopics.map((x) => x[1]),
    ...topTags.map((x) => x[1]),
    1
  );

  const Stat = ({ label, value }: { label: string; value: string | number }) => (
    <div
      style={{
        padding: "1.5rem",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "0.9rem",
          margin: "0 0 0.5rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "var(--color-accent)" }}>
        {value}
      </p>
    </div>
  );

  const BarChart = ({ data, title }: { data: [string, number][]; title: string }) => (
    <div
      style={{
        padding: "1.5rem",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {data.map(([label, count]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ minWidth: "120px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {label.substring(0, 20)}
              {label.length > 20 ? "..." : ""}
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                height: "24px",
                background: "var(--color-bg)",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, var(--color-accent), var(--color-accent-dark))`,
                  width: `${(count / maxCount) * 100}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ minWidth: "30px", textAlign: "right", fontSize: "0.85rem", fontWeight: 600 }}>
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto", minHeight: "calc(100vh - 57px)" }}>
      <h1 style={{ marginBottom: "2rem" }}>📊 Analytics Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Stat label="Total Studies" value={stats.totalStudies} />
        <Stat label="Total Participants" value={stats.totalParticipants} />
        <Stat label="Qualitative Studies" value={stats.byType.Qual || 0} />
        <Stat label="Quantitative Studies" value={stats.byType.Quant || 0} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <BarChart
          data={topMethodologies}
          title="Top Research Methodologies"
        />
        <BarChart
          data={topTopics}
          title="Top Research Topics"
        />
      </div>

      <div style={{ marginTop: "2rem" }}>
        <div
          style={{
            padding: "1.5rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Top Research Tags</h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            {topTags.map(([tag, count]) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "var(--color-accent-bg)",
                  borderRadius: "999px",
                  fontSize: "0.9rem",
                }}
              >
                <strong>{tag}</strong>
                <span
                  style={{
                    display: "inline-block",
                    width: "24px",
                    height: "24px",
                    background: "var(--color-accent)",
                    color: "white",
                    borderRadius: "50%",
                    textAlign: "center",
                    lineHeight: "24px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {timeline.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div
            style={{
              padding: "1.5rem",
              background: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Studies Over Time</h3>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "0.5rem",
                height: "200px",
                overflowX: "auto",
                paddingBottom: "1rem",
              }}
            >
              {timeline.slice(-30).map((entry) => {
                const maxVal = Math.max(...timeline.map((t) => t.count));
                const height = (entry.count / Math.max(maxVal, 1)) * 180;
                return (
                  <div
                    key={entry.date}
                    style={{
                      flex: "0 0 auto",
                      width: "20px",
                      height: `${height}px`,
                      background: "var(--color-accent)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      position: "relative",
                    }}
                    title={`${entry.date}: ${entry.count} studies`}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--color-accent-dark)";
                      (e.currentTarget as HTMLDivElement).style.transform = "scaleY(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--color-accent)";
                      (e.currentTarget as HTMLDivElement).style.transform = "scaleY(1)";
                    }}
                  />
                );
              })}
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "1rem" }}>
              Showing last 30 dates with studies
            </p>
          </div>
        </div>
      )}
    </main>
  );
}