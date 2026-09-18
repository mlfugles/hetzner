import Link from "next/link";
import { sanityFetch } from "@/sanity/live";
import { PROJECTS_QUERY, SETTINGS_QUERY } from "@/sanity/queries";
import type { ProjectCard, SiteSettings } from "@/sanity/types";
import { SanityImage } from "@/components/SanityImage";

export default async function HomePage() {
  const [{ data: settingsData }, { data: projectsData }] = await Promise.all([
    sanityFetch({ query: SETTINGS_QUERY }),
    sanityFetch({ query: PROJECTS_QUERY }),
  ]);
  const settings = settingsData as SiteSettings;
  const projects = projectsData as ProjectCard[];

  return (
    <>
      <section className="intro">
        <h1>{settings?.title ?? "Portfolio"}</h1>
        {settings?.tagline && <p>{settings.tagline}</p>}
      </section>

      {projects.length === 0 ? (
        <p className="empty">
          No projects yet. Add one in the <a href="/studio">Studio</a> or run <code>npm run seed</code>.
        </p>
      ) : (
        <ul className="grid">
          {projects.map((project) => (
            <li key={project._id} className="card">
              <Link href={`/projects/${project.slug}`}>
                <SanityImage image={project.coverImage} width={800} height={600} sizes="(max-width: 640px) 100vw, 33vw" />
                <h2>{project.title}</h2>
                <p className="meta">{[project.year, project.summary].filter(Boolean).join(" · ")}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
