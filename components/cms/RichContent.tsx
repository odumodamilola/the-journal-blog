import {
  createElement,
  Fragment,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  validateDocument,
  editorFonts,
  type RichNode,
} from "@/lib/cms/content";
import { MediaImage } from "./MediaImage";
export async function RichContent({ document }: { document: unknown }) {
  let safe: RichNode;
  try {
    safe = validateDocument(document).document;
  } catch {
    return <p>This article’s content is temporarily unavailable.</p>;
  }
  async function node(value: RichNode, index: number): Promise<ReactNode> {
    const attrs = value.attrs || {};
    if (value.type === "text") {
      let text: ReactNode = value.text;
      for (const mark of value.marks || []) {
        if (mark.type === "link")
          text = (
            <a href={mark.attrs!.href} rel="noopener noreferrer">
              {text}
            </a>
          );
        else if (mark.type === "textStyle")
          text = (
            <span
              style={{
                color: mark.attrs?.color,
                fontFamily:
                  editorFonts[
                    mark.attrs?.fontFamily as keyof typeof editorFonts
                  ],
                fontSize: mark.attrs?.fontSize,
              }}
            >
              {text}
            </span>
          );
        else if (mark.type === "highlight")
          text = (
            <mark
              style={{ backgroundColor: mark.attrs?.color, color: "#171c19" }}
            >
              {text}
            </mark>
          );
        else
          text = createElement(
            (
              {
                bold: "strong",
                italic: "em",
                underline: "u",
                strike: "s",
                code: "code",
              } as Record<string, string>
            )[mark.type],
            null,
            text,
          );
      }
      return <Fragment key={index}>{text}</Fragment>;
    }
    if (value.type === "image")
      return (
        <figure key={index}>
          <MediaImage
            id={String(attrs.assetId)}
            alt={String(attrs.alt)}
            className="h-auto w-full rounded-lg"
            sizes="(max-width: 768px) 100vw, 768px"
          />
          {attrs.caption && <figcaption>{attrs.caption}</figcaption>}
        </figure>
      );
    if (value.type === "hardBreak") return <br key={index} />;
    if (value.type === "horizontalRule") return <hr key={index} />;
    const children = await Promise.all((value.content || []).map(node));
    if (value.type === "doc")
      return <Fragment key={index}>{children}</Fragment>;
    if (value.type === "codeBlock")
      return (
        <pre key={index}>
          <code>{children}</code>
        </pre>
      );
    const tag = (
      {
        paragraph: "p",
        heading: attrs.level === 3 ? "h3" : "h2",
        bulletList: "ul",
        orderedList: "ol",
        listItem: "li",
        blockquote: "blockquote",
      } as Record<string, string>
    )[value.type];
    return createElement(
      tag,
      {
        key: index,
        style: attrs.textAlign
          ? { textAlign: attrs.textAlign as CSSProperties["textAlign"] }
          : undefined,
        ...(value.type === "orderedList" ? { start: attrs.start } : {}),
      },
      children,
    );
  }
  return (
    <div className="prose prose-stone max-w-none text-base leading-8 sm:text-lg">
      {await node(safe, 0)}
    </div>
  );
}
