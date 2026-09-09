"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinkStyle = (path: string): React.CSSProperties => ({
    textDecoration: "none",
    color: isActive(path) ? "var(--color-accent)" : "var(--color-text-muted)",
    fontWeight: isActive(path) ? 600 : 500,
    padding: "0.5rem 0.75rem",
    borderRadius: "var(--radius-md)",
    transition: "var(--transition)",
    position: "relative",
  });

  return (
    <html lang="en">
      <head>
        <title>Bird Brain</title>
        <meta name="description" content="Research assistant for Merlin" />
      </head>
      <body>
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "1rem 2rem",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 3px var(--color-shadow)",
          }}
        >
          <Link href="/ask" style={{ fontWeight: 700, textDecoration: "none", color: "var(--color-accent)", marginRight: "1rem", fontSize: "1.2rem" }}>
            🐦 Bird Brain
          </Link>

          <div style={{ display: "flex", gap: "0.5rem", flex: 1 }}>
            <Link href="/ask" style={navLinkStyle("/ask")}>
              💬 Ask
            </Link>
            <Link href="/repository" style={navLinkStyle("/repository")}>
              📚 Repository
            </Link>
            <Link href="/collections" style={navLinkStyle("/collections")}>
              📁 Collections
            </Link>
            <Link href="/analytics" style={navLinkStyle("/analytics")}>
              📊 Analytics
            </Link>
            <Link href="/add-research" style={navLinkStyle("/add-research")}>
              ➕ Add Research
            </Link>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => {
                const isDark = document.documentElement.getAttribute("data-theme") === "dark";
                document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
                localStorage.setItem("theme", isDark ? "light" : "dark");
              }}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Toggle dark mode"
            >
              🌙
            </button>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}