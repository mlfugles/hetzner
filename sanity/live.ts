import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { REVALIDATE_TAG } from "./env";

const token = process.env.SANITY_API_READ_TOKEN;

/**
 * `sanityFetch` + `<SanityLive />` connect the site to the Live Content API:
 * visitors who have a page open see published changes instantly, and inside
 * the Presentation tool the fetch switches to drafts with click-to-edit.
 *
 * Caching note for self-hosting: `sanityFetch` stores results in Next's data
 * cache with `revalidate: false`, and the Live API only expires them while a
 * browser is connected. So a publish made while nobody is on the site would
 * stay stale for the next visitor. The `sanity` tag added below lets the
 * Sanity webhook → /api/revalidate route cover that case.
 */
const live = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});

export const SanityLive = live.SanityLive;

export const sanityFetch: typeof live.sanityFetch = (options) =>
  live.sanityFetch({ ...options, tags: [REVALIDATE_TAG, ...(options.tags ?? [])] });
