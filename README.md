# Portfolio – Next.js + Sanity on Hetzner/Coolify

A deliberately small portfolio site for trying out the **Next.js + Sanity + Hetzner + Coolify**
stack end to end. The content is invented and the app is self-contained: it talks to nothing
but its own Sanity project. The Next.js side is still shaped like production code (Live
Content API, Presentation tool, embedded Studio), and the repo carries everything Coolify
needs to build and run it.

- **Next.js 16** (App Router, TypeScript), `output: "standalone"`, no CSS framework
- **Sanity Studio** embedded at `/studio`, with the **Presentation tool** ("Edit site") for
  click-to-edit and live preview
- **Dockerfile** multi-stage build that Coolify builds on the server
- **Webhook revalidation** at `/api/revalidate` so a publish refreshes the site even when
  nobody has it open
- **Health check** at `/api/health`; a `noindex` header on preview/dev deployments (`NOINDEX=true`)
- Hosting guide: [DEPLOYMENT.md](DEPLOYMENT.md)

## Routes

| URL | Source |
| --- | --- |
| `/` | `siteSettings` singleton + all `project` documents |
| `/projects/<slug>` | one `project` |
| `/studio` | Sanity Studio |
| `/api/health` | health check for Docker/Coolify |
| `/api/revalidate` | Sanity webhook target |
| `/api/draft-mode/enable`, `/disable` | preview plumbing for the Presentation tool |

## Content model

- **Project** – title, slug, year, client, summary, cover image (hotspot + alt), body (Portable Text), sort date
- **Site settings** – title, tagline, e-mail (singleton, pinned in the Studio sidebar)

## Local setup

1. Create a **new, empty** Sanity project (free plan is fine): https://www.sanity.io/manage

   Use a fresh project rather than an existing one. `npm run seed` writes sample documents,
   and `next build` prerenders whatever the dataset contains into `.next/`, so pointing this
   at a dataset you care about mixes real content into a throwaway app.

2. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_READ_TOKEN` – a **Viewer** token (Manage → API → Tokens)
   - `SANITY_API_WRITE_TOKEN` – an **Editor** token, only for seeding
3. In Manage → API → CORS origins, add `http://localhost:3000` with credentials allowed.
4. Install, seed and run:

   ```bash
   npm install
   npm run seed          # 3 sample projects + site settings (add --no-images to skip uploads)
   npm run dev
   ```

5. Open http://localhost:3000/studio → **Edit site**. Log in with your Sanity account.

## Try the production image locally

This is exactly what Coolify does on the server:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SANITY_PROJECT_ID=<id> \
  --build-arg NEXT_PUBLIC_SANITY_DATASET=production \
  -t portfolio .
docker run --rm -p 3000:3000 -e SANITY_API_READ_TOKEN=<viewer-token> portfolio
```

Note that `next build` prerenders the pages, so the Sanity dataset must be reachable while
building. That is fine on Coolify (it builds with the real environment variables), but it means
CI needs the project id too – see `.github/workflows/ci.yml`.

## Environment variables

| Variable | Build time | Runtime | Notes |
| --- | :-: | :-: | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✓ | ✓ | inlined into the client bundle |
| `NEXT_PUBLIC_SANITY_DATASET` | ✓ | ✓ | `production`; a second dataset for dev is optional |
| `NEXT_PUBLIC_SANITY_API_VERSION` | ✓ | ✓ | optional, defaults to `2026-09-01` |
| `NEXT_PUBLIC_SITE_URL` | ✓ | ✓ | canonical URL for metadata; falls back to Coolify's `COOLIFY_URL` |
| `SANITY_API_READ_TOKEN` | – | ✓ | Viewer token: drafts + Live Content API |
| `SANITY_REVALIDATE_SECRET` | – | ✓ | shared with the Sanity webhook |
| `NOINDEX` | – | ✓ | `true` on dev/preview deployments → `X-Robots-Tag: noindex` on every page (`proxy.ts`) |
| `SANITY_API_WRITE_TOKEN` | – | – | local only, for `npm run seed` |

## How the pieces fit

- `sanity/live.ts` – `defineLive()` gives `sanityFetch` and `<SanityLive />`. Published content is
  cached with tags; the Live API expires them for connected visitors, the webhook covers the rest.
- `sanity/presentation/resolve.ts` – maps URLs to documents for the Presentation tool.
- `sanity.config.ts` – no preview URL is configured; Presentation uses the Studio's own origin, so
  one build works on production, dev and every PR preview.
- `app/api/revalidate/route.ts` – validates the webhook signature and calls `revalidateTag`.
- `Dockerfile` – `deps` → `builder` (needs the `NEXT_PUBLIC_*` build args) → tiny `runner`
  with the standalone server, running as a non-root user with a `HEALTHCHECK`.
