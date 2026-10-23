import { categories } from "./site";

export const editorialCategories = [
  ...categories.filter((name) => name !== "World News"),
  "World News",
];
export const categoryDetails: Record<
  string,
  { description: string; motif: string; note: string }
> = {
  Technology: {
    description:
      "The systems, inventions and questions shaping our digital lives.",
    motif: "technology",
    note: "Signals & systems",
  },
  "Software Engineering": {
    description:
      "The craft of building software with clarity, care and intention.",
    motif: "engineering",
    note: "Built with intention",
  },
  Tutorials: {
    description:
      "Practical explorations, useful tools and a closer look at how things work.",
    motif: "tutorials",
    note: "Learn by making",
  },
  Career: {
    description:
      "Work, growth and the human side of building a meaningful professional life.",
    motif: "career",
    note: "Room to grow",
  },
  "Personal Notes": {
    description:
      "Everyday observations, creative detours and ideas worth sitting with.",
    motif: "notes",
    note: "Life, considered",
  },
  "World News": {
    description:
      "Sourced international briefs, with context, clear dates and further reading.",
    motif: "world",
    note: "A wider perspective",
  },
};
export function articleDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}
export function readingMinutes(content: string) {
  const text = content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>]/g, " ");
  return Math.max(
    1,
    Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 220),
  );
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
export function articleHeadings(content: string) {
  let fenced = false;
  const result: { id: string; text: string }[] = [];
  content.split("\n").forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const match = !fenced && /^#{2,3}\s+(.+?)(?:\s+#+)?\s*$/.exec(line);
    if (match)
      result.push({
        id: `heading-${index + 1}`,
        text: match[1].replace(/[*_`]/g, ""),
      });
  });
  return result;
}
