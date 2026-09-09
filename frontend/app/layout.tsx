import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Bird Brain",
  description: "Research assistant for Merlin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            padding: "1rem 2rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <Link href="/ask" style={{ fontWeight: 700, textDecoration: "none", color: "var(--color-text)" }}>
            🐦 Bird Brain
          </Link>
          <Link href="/ask" style={{ textDecoration: "none", color: "var(--color-accent)" }}>
            Ask
          </Link>
          <Link href="/repository" style={{ textDecoration: "none", color: "var(--color-text-muted)" }}>
            Repository
          </Link>
          <Link href="/add-research" style={{ textDecoration: "none", color: "var(--color-text-muted)" }}>
            + Add research
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}