import type { Metadata } from "next";
import { getSiteUrl } from "@/sanity/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Portfolio", template: "%s | Portfolio" },
  description: "Example portfolio built with Next.js and Sanity, hosted on Hetzner with Coolify.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
