import type { SchemaTypeDefinition } from "sanity";
import { project } from "./project";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [project, siteSettings];

/** Documents that only exist once. */
export const singletonTypes = new Set(["siteSettings"]);
