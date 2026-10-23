"use client";
import { useState } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  TextStyle,
  Color,
  FontFamily,
  FontSize,
} from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { MediaPicker } from "./MediaLibrary";
import {
  editorFonts,
  mediaUrl,
  safeLink,
  mediaIdFromUrl,
  type RichNode,
} from "@/lib/cms/content";

const ManagedImage = Image.extend({
  parseHTML() {
    return [
      {
        tag: "img[data-asset-id]",
        getAttrs: (element) => {
          const id = element.getAttribute("data-asset-id");
          return id && mediaIdFromUrl(element.getAttribute("src")) === id
            ? null
            : false;
        },
      },
    ];
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      assetId: {
        default: null,
        parseHTML: (e) => e.getAttribute("data-asset-id"),
        renderHTML: (attrs) => ({ "data-asset-id": attrs.assetId }),
      },
      caption: { default: "" },
    };
  },
});
const ManagedFont = FontFamily.extend({
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-font-family"),
            renderHTML: (attrs) =>
              attrs.fontFamily in editorFonts
                ? {
                    "data-font-family": attrs.fontFamily,
                    style: `font-family: ${editorFonts[attrs.fontFamily as keyof typeof editorFonts]}`,
                  }
                : {},
          },
        },
      },
    ];
  },
});
export function RichEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: RichNode;
  onChange: (document: RichNode, text: string) => void;
  disabled?: boolean;
}) {
  const [picker, setPicker] = useState(false),
    [file, setFile] = useState<File | undefined>(),
    [notice, setNotice] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          defaultProtocol: "https",
          protocols: ["https", "mailto"],
          isAllowedUri: (url) => safeLink(url),
        },
      }),
      TextStyle,
      Color,
      ManagedFont,
      FontSize,
      ManagedImage.configure({ allowBase64: false }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Article content",
        "aria-multiline": "true",
        class: "prose prose-stone max-w-none min-h-96 p-6 focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const image = Array.from(event.clipboardData?.files || []).find(
          (file) => file.type.startsWith("image/"),
        );
        if (image) {
          event.preventDefault();
          setFile(image);
          setPicker(true);
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const image = Array.from(event.dataTransfer?.files || []).find((file) =>
          file.type.startsWith("image/"),
        );
        if (image) {
          event.preventDefault();
          setFile(image);
          setPicker(true);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) =>
      onChange(editor.getJSON() as RichNode, editor.getText()),
  });
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold"),
      italic: editor?.isActive("italic"),
      underline: editor?.isActive("underline"),
      strike: editor?.isActive("strike"),
      h2: editor?.isActive("heading", { level: 2 }),
      h3: editor?.isActive("heading", { level: 3 }),
      bullet: editor?.isActive("bulletList"),
      ordered: editor?.isActive("orderedList"),
      quote: editor?.isActive("blockquote"),
      code: editor?.isActive("codeBlock"),
      left: editor?.isActive({ textAlign: "left" }),
      center: editor?.isActive({ textAlign: "center" }),
      right: editor?.isActive({ textAlign: "right" }),
    }),
  });
  if (!editor)
    return (
      <div className="min-h-96 rounded-xl border bg-white p-6 text-sm">
        Loading editor…
      </div>
    );
  const button = (label: string, action: () => void, active = false) => (
    <button
      type="button"
      key={label}
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={action}
      className={`editor-tool ${active ? "is-active" : ""}`}
    >
      {label}
    </button>
  );
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div
        role="group"
        aria-label="Article formatting"
        className="flex flex-wrap items-center gap-1 border-b bg-surface-container-low p-2"
      >
        {button(
          "Bold",
          () => editor.chain().focus().toggleBold().run(),
          state?.bold,
        )}
        {button(
          "Italic",
          () => editor.chain().focus().toggleItalic().run(),
          state?.italic,
        )}
        {button(
          "Underline",
          () => editor.chain().focus().toggleUnderline().run(),
          state?.underline,
        )}
        {button(
          "Strikethrough",
          () => editor.chain().focus().toggleStrike().run(),
          state?.strike,
        )}
        {button(
          "Heading 2",
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          state?.h2,
        )}
        {button(
          "Heading 3",
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          state?.h3,
        )}
        {button(
          "Bullet list",
          () => editor.chain().focus().toggleBulletList().run(),
          state?.bullet,
        )}
        {button(
          "Numbered list",
          () => editor.chain().focus().toggleOrderedList().run(),
          state?.ordered,
        )}
        {button(
          "Quote",
          () => editor.chain().focus().toggleBlockquote().run(),
          state?.quote,
        )}
        {button(
          "Code block",
          () => editor.chain().focus().toggleCodeBlock().run(),
          state?.code,
        )}
        {button(
          "Align left",
          () => editor.chain().focus().setTextAlign("left").run(),
          state?.left,
        )}
        {button(
          "Align center",
          () => editor.chain().focus().setTextAlign("center").run(),
          state?.center,
        )}
        {button(
          "Align right",
          () => editor.chain().focus().setTextAlign("right").run(),
          state?.right,
        )}
        <label className="editor-tool">
          Font
          <select
            aria-label="Text font"
            onChange={(e) =>
              editor.chain().focus().setFontFamily(e.target.value).run()
            }
            defaultValue=""
          >
            <option value="" disabled>
              Choose
            </option>
            {Object.keys(editorFonts).map((font) => (
              <option key={font}>{font}</option>
            ))}
          </select>
        </label>
        <label className="editor-tool">
          Size
          <select
            aria-label="Text size"
            onChange={(e) =>
              editor.chain().focus().setFontSize(e.target.value).run()
            }
            defaultValue=""
          >
            <option value="" disabled>
              Choose
            </option>
            {[14, 16, 18, 20, 24, 32].map((size) => (
              <option key={size} value={`${size}px`}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label className="editor-tool">
          Text color
          <input
            aria-label="Text color"
            type="color"
            defaultValue="#202b25"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </label>
        <label className="editor-tool">
          Highlight
          <input
            aria-label="Highlight color"
            type="color"
            defaultValue="#f5e7a5"
            onChange={(e) =>
              editor
                .chain()
                .focus()
                .setHighlight({ color: e.target.value })
                .run()
            }
          />
        </label>
        {button("Link", () => {
          const href = window.prompt(
            "Link URL (HTTPS, email, or local path)",
            editor.getAttributes("link").href || "https://",
          );
          if (href === null) return;
          if (!href) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          if (!safeLink(href)) {
            setNotice("Use HTTPS, mailto, or a local path.");
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href })
            .run();
        })}
        {button("Insert image", () => {
          setFile(undefined);
          setPicker(true);
        })}
        {button("Clear formatting", () =>
          editor.chain().focus().unsetAllMarks().clearNodes().run(),
        )}
        {button("Undo", () => editor.chain().focus().undo().run())}
        {button("Redo", () => editor.chain().focus().redo().run())}
      </div>
      <EditorContent editor={editor} />
      <p role="status" className="px-6 text-sm text-error">
        {notice}
      </p>
      <p className="border-t px-6 py-3 text-xs text-secondary">
        Select text to format it. Paste or drop an image to upload it. All
        images need a description. Custom colors should remain readable against
        the page background.
      </p>
      {picker && (
        <MediaPicker
          initialFile={file}
          onClose={() => setPicker(false)}
          onChoose={(asset) => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "image",
                attrs: {
                  assetId: asset.id,
                  src: mediaUrl(asset.id),
                  alt: asset.alt,
                  caption: asset.caption,
                },
              })
              .run();
            setPicker(false);
          }}
        />
      )}
    </div>
  );
}
