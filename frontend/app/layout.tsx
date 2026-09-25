"use client";

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IoHelp, IoLibrary } from "react-icons/io5";

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
      <body style={{ margin: 0 }} suppressHydrationWarning>
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            padding: "1rem 2rem",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg)",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link href="/ask" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, textDecoration: "none", color: "var(--color-text)", fontSize: "1rem" }}>
              <Image src="/images/icons/Container.png" alt="Bird Brain" width={28} height={28} />
              Bird Brain
            </Link>
            <Link href="/ask" style={{ ...getLinkStyle("/ask"), display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IoHelp size={16} />
              Ask
            </Link>
            <Link href="/repository" style={{ ...getLinkStyle("/repository"), display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IoLibrary size={16} />
              Repository
            </Link>
          </div>

          {/* Circular FAB Button in Navbar */}
          <Link
            href="/add-research"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--color-accent)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            +
          </Link>
        </nav>

        {children}
      </body>
    </html>
  );
}