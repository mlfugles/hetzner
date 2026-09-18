import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", type: "text", rows: 2 }),
    defineField({ name: "email", type: "string" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
