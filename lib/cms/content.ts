import { validId } from "../posts/validation";

export type RichMark = { type: string; attrs?: Record<string, string> };
export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, string | number | null>;
  marks?: RichMark[];
  content?: RichNode[];
};
export const editorFonts = {
  Inter: "var(--font-inter), sans-serif",
  Newsreader: "var(--font-newsreader), Georgia, serif",
  "JetBrains Mono": "var(--font-jetbrains), monospace",
} as const;
export const emptyDocument: RichNode = {
  type: "doc",
  content: [{ type: "paragraph" }],
};
export function safeLink(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (/^\/(?!\/)[^\\]*$/.test(value)) return true;
  try {
    const url = new URL(value);
    return (
      ["https:", "mailto:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export function mediaIdFromUrl(url: string | null) {
  const match = url?.match(/^\/media\/([0-9a-f-]{36})\/master\.webp$/i);
  return match && validId(match[1]) ? match[1] : null;
}
export function mediaUrl(id: string, variant = "master.webp") {
  return `/media/${id}/${variant}`;
}

// Rebuild the document from an explicit allowlist. Never render arbitrary HTML or CSS.
export function validateDocument(value: unknown): {
  document: RichNode;
  text: string;
  mediaIds: string[];
} {
  if (new TextEncoder().encode(JSON.stringify(value)).length > 200000)
    throw new Error("The article must be under 200 KB.");
  let count = 0;
  const media = new Set<string>();
  const text: string[] = [];
  const visit = (input: unknown, depth: number): RichNode => {
    if (++count > 5000 || depth > 20 || !input || typeof input !== "object")
      throw new Error("This document is too complex.");
    const node = input as RichNode;
    if (
      ![
        "doc",
        "paragraph",
        "text",
        "heading",
        "bulletList",
        "orderedList",
        "listItem",
        "blockquote",
        "codeBlock",
        "hardBreak",
        "horizontalRule",
        "image",
      ].includes(node.type)
    )
      throw new Error("Unsupported content block.");
    const result: RichNode = { type: node.type };
    if (node.type === "text") {
      if (typeof node.text !== "string") throw new Error("Invalid text.");
      result.text = node.text;
      text.push(node.text);
    }
    const attrs = node.attrs || {};
    const cleaned: NonNullable<RichNode["attrs"]> = {};
    if (node.type === "heading") {
      if (![2, 3].includes(Number(attrs.level)))
        throw new Error("Use heading level 2 or 3.");
      cleaned.level = Number(attrs.level);
    }
    if (["paragraph", "heading"].includes(node.type) && attrs.textAlign) {
      if (!["left", "center", "right"].includes(String(attrs.textAlign)))
        throw new Error("Invalid alignment.");
      cleaned.textAlign = attrs.textAlign;
    }
    if (node.type === "orderedList")
      cleaned.start = Math.max(1, Math.min(9999, Number(attrs.start) || 1));
    if (node.type === "image") {
      if (
        !validId(attrs.assetId) ||
        typeof attrs.alt !== "string" ||
        !attrs.alt.trim() ||
        attrs.alt.length > 300
      )
        throw new Error("Choose an uploaded image and describe it.");
      cleaned.assetId = attrs.assetId;
      cleaned.src = mediaUrl(attrs.assetId);
      cleaned.alt = attrs.alt;
      cleaned.caption =
        typeof attrs.caption === "string" ? attrs.caption.slice(0, 500) : "";
      media.add(attrs.assetId);
      text.push(`[Image: ${attrs.alt}]`);
    }
    if (Object.keys(cleaned).length) result.attrs = cleaned;
    if (node.marks) {
      if (!Array.isArray(node.marks) || node.marks.length > 10)
        throw new Error("Invalid text formatting.");
      result.marks = node.marks.map((mark) => {
        if (
          ["bold", "italic", "underline", "strike", "code"].includes(mark.type)
        )
          return { type: mark.type };
        if (mark.type === "link" && safeLink(mark.attrs?.href))
          return { type: "link", attrs: { href: mark.attrs!.href } };
        if (
          mark.type === "highlight" &&
          /^#[0-9a-f]{6}$/i.test(mark.attrs?.color || "")
        )
          return { type: "highlight", attrs: { color: mark.attrs!.color } };
        if (mark.type === "textStyle") {
          const style: Record<string, string> = {};
          if (mark.attrs?.color && /^#[0-9a-f]{6}$/i.test(mark.attrs.color))
            style.color = mark.attrs.color;
          if (mark.attrs?.fontFamily && mark.attrs.fontFamily in editorFonts)
            style.fontFamily = mark.attrs.fontFamily;
          if (
            mark.attrs?.fontSize &&
            ["14px", "16px", "18px", "20px", "24px", "32px"].includes(
              mark.attrs.fontSize,
            )
          )
            style.fontSize = mark.attrs.fontSize;
          return { type: "textStyle", attrs: style };
        }
        throw new Error("Unsupported or unsafe text formatting.");
      });
    }
    if (node.content) {
      if (
        !Array.isArray(node.content) ||
        ["text", "image", "hardBreak", "horizontalRule"].includes(node.type)
      )
        throw new Error("Invalid content structure.");
      result.content = node.content.map((child) => visit(child, depth + 1));
      if (["paragraph", "heading", "listItem", "codeBlock"].includes(node.type))
        text.push("\n");
    }
    return result;
  };
  const document = visit(value, 0);
  if (document.type !== "doc") throw new Error("Invalid document.");
  return {
    document,
    text: text.join("").replace(/ +\n/g, "\n").trim(),
    mediaIds: [...media],
  };
}
