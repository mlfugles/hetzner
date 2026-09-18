import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { sanityFetch } from "@/sanity/live";
import { PROJECT_QUERY, PROJECT_SLUGS_QUERY } from "@/sanity/queries";
import type { Project } from "@/sanity/types";
import { SanityImage } from "@/components/SanityImage";

type Params = { params: Promise<{ slug: string }> };

/**
 * Prerender every published project at build time. Unknown slugs are still
 * rendered on demand on first request, then cached until the Sanity webhook
 * or the Live API expires them.
 */
export async function generateStaticParams() {
  const { data } = await sanityFetch({ query: PROJECT_SLUGS_QUERY, perspective: "published", stega: false });
  return (data as { slug: string }[]).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await sanityFetch({ query: PROJECT_QUERY, params: { slug }, stega: false });
  const project = data as Project | null;
  return project ? { title: project.title ?? undefined, description: project.summary ?? undefined } : {};
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const { data } = await sanityFetch({ query: PROJECT_QUERY, params: { slug } });
  const project = data as Project | null;
  if (!project) notFound();

  return (
    <article>
      <header className="project-head">
        <h1>{project.title}</h1>
        <p className="meta">{[project.client, project.year].filter(Boolean).join(" · ")}</p>
      </header>
      <div className="project-cover">
        <SanityImage image={project.coverImage} width={1800} height={1013} sizes="100vw" priority />
      </div>
      <div className="prose">
        {project.summary && <p>{project.summary}</p>}
        {project.body && <PortableText value={project.body} />}
      </div>
      <Link className="back" href="/">
        ← All work
      </Link>
    </article>
  );
}
