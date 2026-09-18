function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-09-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const studioUrl = "/studio";

/**
 * Every `sanityFetch` is tagged with this so a single Sanity webhook can
 * expire the whole data cache (see app/api/revalidate/route.ts). Fine for a
 * portfolio; a bigger site would tag per document type.
 */
export const REVALIDATE_TAG = "sanity";

/**
 * Canonical URL of the current deployment. Prefer the explicit variable;
 * fall back to COOLIFY_URL, which Coolify injects at runtime (comma-separated
 * when an app has several domains).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;
  const coolify = process.env.COOLIFY_URL?.split(",")[0]?.trim();
  return coolify || "http://localhost:3000";
}
