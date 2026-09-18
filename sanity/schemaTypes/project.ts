import { defineArrayMember, defineField, defineType } from "sanity";
import { ImagesIcon } from "@sanity/icons";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: ImagesIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      description: "Becomes /projects/<slug>",
      validation: (r) => r.required(),
    }),
    defineField({ name: "year", type: "number" }),
    defineField({ name: "client", type: "string" }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
    }),
    defineField({
      name: "body",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "publishedAt",
      title: "Sort date",
      type: "date",
      description: "Newest first in lists.",
      initialValue: () => new Date().toISOString().slice(0, 10),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "year", media: "coverImage" },
  },
});
