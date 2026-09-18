import type { PortableTextBlock } from "next-sanity";

export type SanityImage = {
  _type?: "image";
  alt?: string | null;
  asset?: {
    _id?: string;
    _ref?: string;
    url?: string | null;
    metadata?: { lqip?: string | null } | null;
  } | null;
  hotspot?: unknown;
  crop?: unknown;
};

export type SiteSettings = {
  title?: string | null;
  tagline?: string | null;
  email?: string | null;
} | null;

export type ProjectCard = {
  _id: string;
  _type: "project";
  title?: string | null;
  slug: string;
  year?: number | null;
  summary?: string | null;
  coverImage?: SanityImage | null;
};

export type Project = ProjectCard & {
  client?: string | null;
  body?: PortableTextBlock[] | null;
};
