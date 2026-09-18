import { defineDocuments, defineLocations, type PresentationPluginOptions } from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    { route: "/", filter: `_type == "siteSettings"` },
    { route: "/projects/:slug", filter: `_type == "project" && slug.current == $slug` },
  ]),
  locations: {
    siteSettings: defineLocations({
      message: "Shown on every page",
      tone: "positive",
      locations: [{ title: "Home", href: "/" }],
    }),
    project: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "Untitled project", href: `/projects/${doc?.slug}` },
          { title: "Home", href: "/" },
        ],
      }),
    }),
  },
};
