import { validId } from "../posts/validation";
import { safeLink } from "./content";

export type SiteSection = {
  id: string;
  type: "latest" | "image" | "split" | "gallery" | "quote" | "cta";
  title: string;
  body: string;
  mediaIds: string[];
  href: string;
  label: string;
  visible: boolean;
};
export type SiteConfig = {
  name: string;
  eyebrow: string;
  headline: string;
  emphasis: string;
  description: string;
  heroMediaId: string;
  featuredPostId: string;
  footer: string;
  background: string;
  text: string;
  accent: string;
  headingFont: "Newsreader" | "Inter";
  bodyFont: "Inter" | "Newsreader";
  sections: SiteSection[];
};
export const defaultSite: SiteConfig = {
  name: "The Journal",
  eyebrow: "An independent journal of ideas",
  headline: "A little curiosity.",
  emphasis: "A different perspective.",
  description:
    "Notes on technology, the craft of building, and making sense of the world. Written with intention. Read at your own pace.",
  heroMediaId: "",
  featuredPostId: "",
  footer:
    "A space for considered ideas. Independently written, thoughtfully shared.",
  background: "#f6f4ed",
  text: "#202b25",
  accent: "#24543d",
  headingFont: "Newsreader",
  bodyFont: "Inter",
  sections: [
    {
      id: "latest",
      type: "latest",
      title: "The reading room",
      body: "Fresh perspectives, practical discoveries, and things worth thinking about.",
      mediaIds: [],
      href: "",
      label: "",
      visible: true,
    },
    {
      id: "note",
      type: "quote",
      title: "Good ideas deserve a little room to breathe.",
      body: "A journal for the curious. A place to slow down, look closer, and connect the dots.",
      mediaIds: [],
      href: "",
      label: "",
      visible: true,
    },
    {
      id: "archive",
      type: "cta",
      title: "Follow your curiosity.",
      body: "There’s always another idea around the corner. Find your next read in the archive.",
      mediaIds: [],
      href: "/blog",
      label: "Explore all stories",
      visible: true,
    },
  ],
};
function luminance(hex: string) {
  const c = hex
    .slice(1)
    .match(/../g)!
    .map((v) => {
      const n = parseInt(v, 16) / 255;
      return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    });
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
export function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function validateSite(value: unknown): SiteConfig {
  if (
    !value ||
    typeof value !== "object" ||
    JSON.stringify(value).length > 100000
  )
    throw new Error("Invalid website settings.");
  const s = value as Record<string, unknown>;
  const text = (key: keyof SiteConfig, max: number) => {
    if (typeof s[key] !== "string" || (s[key] as string).length > max)
      throw new Error(`Check ${key}.`);
    return (s[key] as string).trim();
  };
  const result = {
    ...defaultSite,
    name: text("name", 60),
    eyebrow: text("eyebrow", 100),
    headline: text("headline", 120),
    emphasis: text("emphasis", 120),
    description: text("description", 600),
    footer: text("footer", 300),
    heroMediaId: text("heroMediaId", 36),
    featuredPostId: text("featuredPostId", 36),
    background: text("background", 7),
    text: text("text", 7),
    accent: text("accent", 7),
  };
  if (!result.name || !result.headline)
    throw new Error("A site name and headline are required.");
  for (const color of [result.background, result.text, result.accent])
    if (!/^#[0-9a-f]{6}$/i.test(color))
      throw new Error("Choose a six-digit hex color.");
  if (
    contrast(result.background, result.text) < 4.5 ||
    contrast(result.background, result.accent) < 4.5 ||
    contrast("#ffffff", result.accent) < 4.5
  )
    throw new Error(
      "Choose colors with at least 4.5:1 contrast, including white text on the accent color.",
    );
  for (const id of [result.heroMediaId, result.featuredPostId])
    if (id && !validId(id)) throw new Error("Choose a valid image or story.");
  result.headingFont = s.headingFont === "Inter" ? "Inter" : "Newsreader";
  result.bodyFont = s.bodyFont === "Newsreader" ? "Newsreader" : "Inter";
  if (!Array.isArray(s.sections) || s.sections.length > 16)
    throw new Error("Use up to 16 homepage sections.");
  const ids = new Set<string>();
  result.sections = s.sections.map((value: unknown) => {
    if (!value || typeof value !== "object")
      throw new Error("Invalid section.");
    const section = value as SiteSection;
    if (
      typeof section.id !== "string" ||
      !/^[\w-]{1,60}$/.test(section.id) ||
      ids.has(section.id)
    )
      throw new Error("Section IDs must be unique.");
    ids.add(section.id);
    if (
      !["latest", "image", "split", "gallery", "quote", "cta"].includes(
        section.type,
      )
    )
      throw new Error("Unknown section type.");
    for (const key of ["title", "body", "href", "label"] as const)
      if (
        typeof section[key] !== "string" ||
        section[key].length > (key === "body" ? 3000 : 300)
      )
        throw new Error("Section text is too long.");
    if (section.href && !safeLink(section.href))
      throw new Error("Use a local path or HTTPS link.");
    if (
      !Array.isArray(section.mediaIds) ||
      section.mediaIds.length > 6 ||
      section.mediaIds.some((id) => !validId(id))
    )
      throw new Error("Choose up to six images per section.");
    return {
      id: section.id,
      type: section.type,
      title: section.title.trim(),
      body: section.body.trim(),
      href: section.href,
      label: section.label,
      mediaIds: [...new Set(section.mediaIds)],
      visible: !!section.visible,
    };
  });
  return result;
}
export function siteMediaIds(config: SiteConfig) {
  return [
    ...new Set(
      [
        config.heroMediaId,
        ...config.sections.flatMap((s) => s.mediaIds),
      ].filter(Boolean),
    ),
  ];
}
export function readSite(value: unknown): SiteConfig {
  try {
    return validateSite(value);
  } catch {
    return structuredClone(defaultSite);
  }
}
