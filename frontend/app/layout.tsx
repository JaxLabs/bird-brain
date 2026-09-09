"use client";

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getLinkStyle = (href: string) => ({
    textDecoration: "none",
    color: pathname === href ? "var(--color-accent)" : "var(--color-text-muted)",
    background: pathname === href ? "var(--color-accent-bg)" : "transparent",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    fontSize: "13.13px",
    fontWeight: 400,
    transition: "all 0.2s ease",
  });

  return (
    <html lang="en">
      <head>
        <title>Bird Brain</title>
        <meta name="description" content="Research assistant for Merlin" />
      </head>
      <body style={{ margin: 0 }}>
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            padding: "1rem 2rem",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          <Link href="/ask" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, textDecoration: "none", color: "var(--color-text)", fontSize: "1rem" }}>
            <Image src="/images/icons/Container.png" alt="Bird Brain" width={28} height={28} />
            Bird Brain
          </Link>
          <Link href="/ask" style={getLinkStyle("/ask")}>
            Ask
          </Link>
          <Link href="/repository" style={getLinkStyle("/repository")}>
            Repository
          </Link>
          <Link href="/add-research" style={getLinkStyle("/add-research")}>
            + Add research
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}