import { defineQuery } from "next-sanity";

const IMAGE = /* groq */ `{
  ...,
  asset->{ _id, url, metadata { lqip } }
}`;

export const SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]{ title, tagline, email }`);

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)] | order(publishedAt desc, _createdAt desc) {
    _id, _type, title, "slug": slug.current, year, summary,
    coverImage ${IMAGE}
  }
`);

export const PROJECT_QUERY = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id, _type, title, "slug": slug.current, year, client, summary, body,
    coverImage ${IMAGE}
  }
`);

export const PROJECT_SLUGS_QUERY = defineQuery(`*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`);
