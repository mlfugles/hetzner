/**
 * Seeds the dataset with a few sample projects.
 *
 *   npm run seed              # uploads placeholder images from picsum.photos
 *   npm run seed -- --no-images
 *
 * Requires SANITY_API_WRITE_TOKEN (Editor) in .env.local. Safe to re-run:
 * documents use stable _ids and are created-or-replaced.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"], quiet: true });
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const withImages = !process.argv.includes("--no-images");

if (!projectId || !dataset || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET or SANITY_API_WRITE_TOKEN");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-09-01", useCdn: false });

const key = () => Math.random().toString(36).slice(2, 10);
const block = (text: string) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

async function image(seed: string, alt: string) {
  if (!withImages) return undefined;
  const res = await fetch(`https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/1200`);
  if (!res.ok) throw new Error(`Could not fetch placeholder image for ${seed}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buf, { filename: `${seed}.jpg`, contentType: "image/jpeg" });
  return { _type: "image", alt, asset: { _type: "reference", _ref: asset._id } };
}

const projects = [
  { slug: "harbour-house", title: "Harbour House", year: 2025, client: "Private", summary: "A timber-clad family home on the quay." },
  { slug: "north-library", title: "North Library", year: 2024, client: "Municipality", summary: "Reading rooms wrapped around a courtyard." },
  { slug: "loft-studio", title: "Loft Studio", year: 2023, client: "Studio Nord", summary: "Warehouse conversion into a daylit workspace." },
];

async function main() {
  const tx = client.transaction();

  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    title: "Studio Example",
    tagline: "Architecture and interiors. A Next.js + Sanity site, hosted on Hetzner with Coolify.",
    email: "hello@example.com",
  });

  for (const p of projects) {
    process.stdout.write(`${p.title}… `);
    tx.createOrReplace({
      _id: `project-${p.slug}`,
      _type: "project",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      year: p.year,
      client: p.client,
      summary: p.summary,
      body: [
        block(`${p.title} is placeholder content. Open the Studio, click any text on the site and change it – the change shows up live.`),
        block("Body text is Portable Text, so editors get headings, links and lists out of the box."),
      ],
      coverImage: await image(p.slug, p.title),
      publishedAt: `${p.year}-06-01`,
    });
    console.log("ok");
  }

  await tx.commit();
  console.log(`Seeded ${projects.length} projects + site settings into ${projectId}/${dataset}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
