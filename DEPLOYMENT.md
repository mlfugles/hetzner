# Hosting on Hetzner + Coolify

What you end up with:

| Environment | Git trigger | URL | Coolify resource |
| --- | --- | --- | --- |
| Production | push to `main` | `https://example.com` | app *portfolio*, environment **production** |
| Development | push to `develop` | `https://dev.example.com` | app *portfolio-dev*, environment **development** |
| Preview | pull request opened/updated | `https://<pr>.preview.example.com` | created and removed automatically by Coolify |

One Hetzner VPS runs Coolify, its Traefik proxy (Let's Encrypt certificates included) and
all three kinds of containers. Sanity hosts the content; the Studio ships inside the app at `/studio`.

## Costs

- **Hetzner Cloud**: no free tier. The smallest servers (CX23 x86 or CAX11 ARM, 2 vCPU / 4 GB / 40 GB)
  cost roughly €4–6 per month and are billed **hourly**, so a few days of testing is well under
  €1. Delete the server when done and billing stops. Traffic (20 TB) is included.
- **Coolify** self-hosted: free, all features. (Coolify Cloud, a hosted control plane, is $5/month – not needed.)
- **Sanity** Free plan: 20 seats, 2 datasets, 1M CDN requests/month, 100 GB bandwidth and assets.
- **GitHub**: free, including Actions minutes for the optional CI workflow.

## 1. Hetzner

1. Create an account at https://console.hetzner.cloud (needs a payment method; new accounts are sometimes asked for ID).
2. **New project** → **Add server**:
   - Location: **Falkenstein**, **Nuremberg** or **Helsinki** (all EU).
   - Image: **Ubuntu 24.04**.
   - Type: *Shared vCPU* → **CX23** (x86) or **CAX11** (ARM). Both work; 4 GB RAM is the
     comfortable minimum because `next build` runs on this server. Coolify's stated minimum is 2 cores / 2 GB.
   - Networking: public IPv4 + IPv6.
   - SSH key: add yours.
   - Firewall (create one): allow inbound **22**, **80**, **443**, and **8000** (Coolify UI; you will close it again in step 2).
   - Backups: off (paid). Content lives in Sanity, and the server is recreatable from this guide.
3. Note the server's IPv4 address.

## 2. Coolify

1. SSH in and run the installer (from https://coolify.io/docs/get-started/installation):

   ```bash
   ssh root@<server-ip>
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```

2. Open `http://<server-ip>:8000` and **register immediately** – the first account becomes the
   admin, and registration stays open until then.
3. Give Coolify its own domain so port 8000 can be closed: point `coolify.example.com` at the server
   (step 3), then in Coolify **Settings → Instance's Domain** set `https://coolify.example.com` and save.
   Afterwards remove 8000 from the Hetzner firewall. The GitHub webhook endpoint will use this domain.
4. **Servers → localhost** should already be validated (Coolify deploys to the machine it runs on).

## 3. DNS

Add A (and AAAA) records pointing at the server:

| Name | Purpose |
| --- | --- |
| `example.com` | production |
| `dev.example.com` | development |
| `*.preview.example.com` | PR previews (wildcard; Traefik gets a certificate per subdomain) |
| `coolify.example.com` | Coolify dashboard + webhooks |

For testing without a domain, Coolify also hands out `sslip.io` addresses (`<ip>.sslip.io`), so
everything except the wildcard previews can be tried before buying a domain.

## 4. GitHub

1. Push this folder to a new repository (private is fine) with a `main` and a `develop` branch.
2. In Coolify: **Sources → + Add → GitHub App**. Give it a name, choose your account or organisation,
   click **Register Now**, then **Install** it on that repository only. This one-time step gives Coolify
   push webhooks, pull-request events, commit statuses and PR comments with the preview link.

## 5. Coolify project and applications

1. **Projects → + Add**: `Portfolio`. It comes with a **production** environment; add a second one
   named **development**.
2. In **production** → **+ New resource → Private Repository (with GitHub App)**:
   - Repository: the repo, branch **`main`**.
   - Build pack: **Dockerfile**. Port: **3000**.
   - Domain: `https://example.com`.
3. **Environment Variables** – add these, ticking **Build Variable** only where marked:

   | Variable | Build Variable | Runtime Variable |
   | --- | :-: | :-: |
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✓ | ✓ |
   | `NEXT_PUBLIC_SANITY_DATASET` = `production` | ✓ | ✓ |
   | `NEXT_PUBLIC_SITE_URL` = `https://example.com` | ✓ | ✓ |
   | `SANITY_API_READ_TOKEN` (Viewer token) | – | ✓ |
   | `SANITY_REVALIDATE_SECRET` (any long random string) | – | ✓ |

   Both toggles are on by default for new variables; untick **Build Variable** for the two secrets.
   Coolify passes build variables as `--build-arg`, which the Dockerfile declares as `ARG`s.
4. **Configuration → Advanced → Deployment & Git**:
   - **Auto Deploy**: on (push to `main` redeploys).
   - **Preview Deployments**: on. URL template: `{{pr_id}}.preview.{{domain}}`
     → `42.preview.example.com`. Leave **Allow Public PR Deployments** off unless the repo is public
     and you accept running strangers' PRs.
   - Preview deployments get their own variable set: open the **Preview Deployments** tab of
     Environment Variables and add `NOINDEX=true` (the rest is copied from production).
5. **Configuration → Healthcheck**: enable, method GET, path `/api/health`, port `3000`.
   (The Dockerfile also has a `HEALTHCHECK`; either is enough.)
6. Click **Deploy**. The first build takes a few minutes (npm install + `next build` on the server);
   later builds reuse the Docker layer cache. Watch it under **Deployments**.
7. Repeat steps 2–6 in the **development** environment with branch **`develop`**, domain
   `https://dev.example.com`, plus `NOINDEX=true`. Point it at the same dataset, or create a second
   dataset in Sanity so editors can experiment without touching production content.

## 6. Sanity

In https://www.sanity.io/manage → your project → **API**:

1. **CORS origins** (allow credentials): `https://example.com`, `https://dev.example.com`,
   `https://*.preview.example.com`, and `http://localhost:3000`. Without this the Studio at
   `/studio` cannot log in.
2. **Tokens**: create a **Viewer** token → `SANITY_API_READ_TOKEN` in Coolify.
3. **Webhooks → + Create**: name `Revalidate production`, URL `https://example.com/api/revalidate`,
   dataset `production`, trigger on **Create, Update, Delete**, HTTP method POST, secret = the
   value of `SANITY_REVALIDATE_SECRET`. Add a second webhook for `https://dev.example.com` if the
   dev app uses the same dataset. (Previews do fine without one: the Live API refreshes open pages,
   and each push rebuilds them.)

## 7. Day-to-day workflow

1. Branch from `develop`, push, open a PR against `develop` → Coolify builds it and comments the
   preview URL on the PR; the preview is deleted when the PR closes.
2. Merge to `develop` → `dev.example.com` redeploys.
3. Merge/PR `develop` → `main` → `example.com` redeploys. Coolify does a rolling swap: the new
   container must pass the health check before the old one is stopped.
4. Editors never notice any of this; they use `/studio` on the production domain.

## Things to know

- **Builds run on the VPS.** A 4 GB server handles `next build` fine; 2 GB may need swap.
  Each running Next.js container uses roughly 100–200 MB, so several open PRs are fine.
- **The build talks to Sanity.** Pages are prerendered, so the dataset must be readable when
  building. It is public on the Free plan, so this just works.
- **Secrets stay out of the image.** Only `NEXT_PUBLIC_*` values are build args. Coolify warns that
  build args end up in image metadata, which is fine for these public ids.
- **Coolify updates itself** (Settings → Update). Keep Ubuntu patched with `unattended-upgrades`,
  which the Hetzner image enables by default.
- **Recovery**: everything is reproducible from this guide; no server backups are needed for the
  site itself. Sanity keeps document history.
- **GDPR**: Hetzner is German with EU data centres, Coolify runs entirely on your server, Sanity's
  API/CDN region is chosen per project (EU is available). No third party sits in the request path.

## Free alternatives while evaluating

There is no free Hetzner tier. For a zero-cost dry run of Coolify itself you can install it in a
local Linux VM (UTM/OrbStack/Multipass) with the same installer, but GitHub webhooks and Let's
Encrypt will not reach it, so previews and TLS cannot be tested that way. A Hetzner server for a
weekend costs about the price of a coffee and tests the real thing.
