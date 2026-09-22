import Link from "next/link";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive, sanityFetch } from "@/sanity/live";
import { SETTINGS_QUERY } from "@/sanity/queries";
import type { SiteSettings } from "@/sanity/types";
import { DisableDraftMode } from "@/components/DisableDraftMode";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ data }, { isEnabled: isDraftMode }] = await Promise.all([
    sanityFetch({ query: SETTINGS_QUERY }),
    draftMode(),
  ]);
  const settings = data as SiteSettings;

  return (
    <>
      {isDraftMode && <DisableDraftMode />}
      <div className="wrap">
        <header className="site-header">
          <Link href="/" className="brand">
            {settings?.title ?? "Portfolio"}
          </Link>
          <nav>
            <Link href="/">Work</Link>
            <a href="/studio">Sanity</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          {settings?.email && (
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          )}
          <span>{settings?.title ?? "My Portfolio"}</span>
        </footer>
      </div>
      <SanityLive />
      {isDraftMode && <VisualEditing />}
    </>
  );
}
