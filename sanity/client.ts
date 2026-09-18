import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, studioUrl } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: {
    // Stega encodes edit-metadata into strings in draft mode so the
    // Presentation tool can show click-to-edit overlays on any text.
    studioUrl,
  },
});
