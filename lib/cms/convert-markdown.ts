import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root, RootContent, PhrasingContent } from "mdast";
import {
  mediaIdFromUrl,
  validateDocument,
  type RichNode,
  type RichMark,
} from "./content";

// Conversion is opt-in. Unsupported constructs stop conversion instead of being discarded.
export function convertMarkdown(markdown: string) {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const definitions = new Map(
    tree.children
      .filter((n) => n.type === "definition")
      .map((n) => [n.identifier, n]),
  );
  function inline(node: PhrasingContent, marks: RichMark[] = []): RichNode[] {
    if (node.type === "text")
      return node.value
        ? [
            {
              type: "text",
              text: node.value,
              ...(marks.length ? { marks } : {}),
            },
          ]
        : [];
    if (node.type === "break") return [{ type: "hardBreak" }];
    if (node.type === "inlineCode")
      return [
        { type: "text", text: node.value, marks: [...marks, { type: "code" }] },
      ];
    if (
      node.type === "strong" ||
      node.type === "emphasis" ||
      node.type === "delete"
    )
      return node.children.flatMap((n) =>
        inline(n, [
          ...marks,
          {
            type:
              node.type === "strong"
                ? "bold"
                : node.type === "emphasis"
                  ? "italic"
                  : "strike",
          },
        ]),
      );
    if (node.type === "link")
      return node.children.flatMap((n) =>
        inline(n, [...marks, { type: "link", attrs: { href: node.url } }]),
      );
    if (node.type === "linkReference") {
      const definition = definitions.get(node.identifier);
      if (!definition)
        throw new Error("Resolve reference links before converting.");
      return node.children.flatMap((n) =>
        inline(n, [
          ...marks,
          { type: "link", attrs: { href: definition.url } },
        ]),
      );
    }
    if (node.type === "image" || node.type === "imageReference") {
      const url =
        node.type === "image"
          ? node.url
          : definitions.get(node.identifier)?.url;
      const id = url ? mediaIdFromUrl(url) : null;
      if (!id || !node.alt?.trim())
        throw new Error(
          "Replace inline external images with described library images before converting. Your Markdown is unchanged.",
        );
      return [
        { type: "image", attrs: { assetId: id, alt: node.alt, caption: "" } },
      ];
    }
    throw new Error(
      "This article includes HTML or advanced Markdown. Keep the Markdown editor to preserve it.",
    );
  }
  function block(node: RootContent): RichNode[] {
    if (node.type === "definition") return [];
    if (node.type === "paragraph") {
      const output: RichNode[] = [];
      let content: RichNode[] = [];
      for (const child of node.children.flatMap((n) => inline(n))) {
        if (child.type === "image") {
          if (content.length) output.push({ type: "paragraph", content });
          content = [];
          output.push(child);
        } else content.push(child);
      }
      if (content.length) output.push({ type: "paragraph", content });
      return output;
    }
    if (node.type === "heading") {
      const content = node.children.flatMap((n) => inline(n));
      if (content.some((n) => n.type === "image"))
        throw new Error(
          "Move heading images into their own paragraph before converting.",
        );
      return [
        { type: "heading", attrs: { level: node.depth <= 2 ? 2 : 3 }, content },
      ];
    }
    if (node.type === "blockquote")
      return [{ type: "blockquote", content: node.children.flatMap(block) }];
    if (node.type === "code")
      return [
        {
          type: "codeBlock",
          content: node.value ? [{ type: "text", text: node.value }] : [],
        },
      ];
    if (node.type === "thematicBreak") return [{ type: "horizontalRule" }];
    if (node.type === "list")
      return [
        {
          type: node.ordered ? "orderedList" : "bulletList",
          ...(node.ordered ? { attrs: { start: node.start || 1 } } : {}),
          content: node.children.map((item) => ({
            type: "listItem",
            content: item.children.flatMap(block),
          })),
        },
      ];
    throw new Error(
      "This article includes unsupported Markdown. Keep the Markdown editor to preserve it.",
    );
  }
  return validateDocument({
    type: "doc",
    content: tree.children.flatMap(block),
  });
}
