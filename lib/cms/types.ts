import type { Json } from "../types/database";
export type MediaVariant = {
  name: string;
  path: string;
  width: number;
  height: number;
  bytes: number;
  format: "webp" | "avif";
};
export type MediaAsset = {
  id: string;
  owner_id: string;
  filename: string;
  mime_type: string;
  original_bytes: number;
  status: string;
  lease_token: string | null;
  width: number | null;
  height: number | null;
  variants: Json;
  alt: string;
  caption: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
export type SiteDraft = {
  singleton: boolean;
  config: Json;
  media_ids: string[];
  version: number;
  updated_at: string;
};
export type SitePublication = {
  singleton: boolean;
  config: Json;
  media_ids: string[];
  version: number;
  published_at: string;
};
export type CmsTable<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};
export function variantsOf(value: Json): MediaVariant[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is unknown & MediaVariant =>
      !!v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      typeof v.name === "string" &&
      typeof v.path === "string" &&
      typeof v.width === "number" &&
      typeof v.height === "number" &&
      typeof v.bytes === "number" &&
      (v.format === "webp" || v.format === "avif"),
  ) as MediaVariant[];
}
