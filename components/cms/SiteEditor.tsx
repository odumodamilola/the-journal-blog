"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MediaPicker } from "./MediaLibrary";
import type { SiteConfig, SiteSection } from "@/lib/cms/site-config";
import { contrast } from "@/lib/cms/site-config";
export function SiteEditor({
  initial,
  initialVersion,
  posts,
  revisions = [],
}: {
  initial: SiteConfig;
  initialVersion: number;
  posts: { id: string; title: string }[];
  revisions: { version: number; config: SiteConfig; created_at: string }[];
}) {
  const [config, setConfig] = useState(initial),
    [version, setVersion] = useState(initialVersion),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [dirty, setDirty] = useState(false),
    [picker, setPicker] = useState<string | null>(null);
  const change = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setConfig((old) => ({ ...old, [key]: value }));
    setDirty(true);
  };
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const section = (id: string, patch: Partial<SiteSection>) =>
    change(
      "sections",
      config.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  const field = (
    key: keyof SiteConfig,
    label: string,
    max = 300,
    multiline = false,
  ) => (
    <label className="block text-sm" key={key}>
      {label}
      {multiline ? (
        <textarea
          className="field"
          rows={3}
          maxLength={max}
          value={String(config[key])}
          onChange={(e) => change(key, e.target.value as never)}
        />
      ) : (
        <input
          className="field"
          maxLength={max}
          value={String(config[key])}
          onChange={(e) => change(key, e.target.value as never)}
        />
      )}
    </label>
  );
  const save = async (publish: boolean) => {
    setBusy(true);
    setMessage(publish ? "Publishing website…" : "Saving private draft…");
    try {
      const response = await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, version, publish }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setVersion(data.version);
      setDirty(false);
      setMessage(
        publish
          ? "Website published. Readers now see these settings."
          : "Private website draft saved. Use Preview saved draft to review it.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save website.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="my-6 flex flex-wrap gap-3">
        <Link
          href="/admin/site/preview"
          target="_blank"
          rel="noopener"
          className="button-secondary"
        >
          Preview saved draft ↗
        </Link>
        <Link
          href="/"
          target="_blank"
          rel="noopener"
          className="button-secondary"
        >
          View live website ↗
        </Link>
      </div>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-secondary">
        Changes stay private until you publish. Reorder sections, add images,
        and adjust the brand without changing code. Preview shows the last saved
        draft.
      </p>
      <fieldset disabled={busy} className="space-y-8">
        <section className="cms-panel">
          <h2 className="font-editorial-headline text-3xl">
            Identity & introduction
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {field("name", "Site name", 60)}
            {field("eyebrow", "Small introductory line", 100)}
            {field("headline", "Main headline", 120)}
            {field("emphasis", "Italic headline", 120)}
            <div className="sm:col-span-2">
              {field("description", "Introduction", 600, true)}
            </div>
            <label className="block text-sm">
              Featured story
              <select
                className="field"
                value={config.featuredPostId}
                onChange={(e) => change("featuredPostId", e.target.value)}
              >
                <option value="">Latest published story</option>
                {posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <p className="mb-3 text-sm">Hero image (optional)</p>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setPicker("hero")}
              >
                {config.heroMediaId
                  ? "Replace hero image"
                  : "Choose hero image"}
              </button>
              {config.heroMediaId && (
                <button
                  type="button"
                  className="ml-3 text-sm text-primary underline"
                  onClick={() => change("heroMediaId", "")}
                >
                  Use editorial artwork
                </button>
              )}
            </div>
          </div>
        </section>
        <section id="appearance" className="cms-panel">
          <h2 className="font-editorial-headline text-3xl">
            Colors & typography
          </h2>
          <p className="mt-3 text-sm text-secondary">
            Only self-hosted fonts are used. Publishing enforces readable color
            contrast.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {(
              [
                ["background", "Page background"],
                ["text", "Body text"],
                ["accent", "Accent / buttons"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                {label}
                <input
                  type="color"
                  className="mt-3 block h-11 w-full rounded border"
                  value={config[key]}
                  onChange={(e) => change(key, e.target.value)}
                />
                <span className="mt-2 block font-mono text-xs">
                  {config[key]}
                </span>
              </label>
            ))}
            <label className="text-sm">
              Heading font
              <select
                className="field"
                value={config.headingFont}
                onChange={(e) =>
                  change(
                    "headingFont",
                    e.target.value as SiteConfig["headingFont"],
                  )
                }
              >
                <option>Newsreader</option>
                <option>Inter</option>
              </select>
            </label>
            <label className="text-sm">
              Body font
              <select
                className="field"
                value={config.bodyFont}
                onChange={(e) =>
                  change("bodyFont", e.target.value as SiteConfig["bodyFont"])
                }
              >
                <option>Inter</option>
                <option>Newsreader</option>
              </select>
            </label>
          </div>
          <div
            className="mt-6 rounded-lg border p-6"
            style={{ background: config.background, color: config.text }}
          >
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: config.accent }}
            >
              Your journal, your voice
            </p>
            <p
              className="mt-3 text-4xl"
              style={{
                fontFamily:
                  config.headingFont === "Newsreader"
                    ? "var(--font-newsreader)"
                    : "var(--font-inter)",
              }}
            >
              A considered perspective.
            </p>
            <p className="mt-3 text-sm">
              Text contrast{" "}
              {contrast(config.background, config.text).toFixed(1)}:1 · Accent
              contrast {contrast(config.background, config.accent).toFixed(1)}:1
            </p>
          </div>
        </section>
        <section className="cms-panel">
          <h2 className="font-editorial-headline text-3xl">
            Homepage sections
          </h2>
          <p className="mt-3 text-sm text-secondary">
            Image, split-story and gallery blocks can appear anywhere below the
            introduction. Use the arrow buttons to change their order.
          </p>
          <div className="mt-6 space-y-5">
            {config.sections.map((s, index) => (
              <div key={s.id} className="rounded-xl border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={s.visible}
                      onChange={(e) =>
                        section(s.id, { visible: e.target.checked })
                      }
                    />
                    {index + 1}. {s.type}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label={`Move section ${index + 1} up`}
                      className="editor-tool"
                      disabled={!index}
                      onClick={() => {
                        const next = [...config.sections];
                        [next[index - 1], next[index]] = [
                          next[index],
                          next[index - 1],
                        ];
                        change("sections", next);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move section ${index + 1} down`}
                      className="editor-tool"
                      disabled={index === config.sections.length - 1}
                      onClick={() => {
                        const next = [...config.sections];
                        [next[index + 1], next[index]] = [
                          next[index],
                          next[index + 1],
                        ];
                        change("sections", next);
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="editor-tool text-error"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Remove this section from the draft? The live site won’t change until you publish.",
                          )
                        )
                          change(
                            "sections",
                            config.sections.filter(
                              (value) => value.id !== s.id,
                            ),
                          );
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <label className="mt-4 block text-sm">
                  Section title
                  <input
                    className="field"
                    value={s.title}
                    maxLength={300}
                    onChange={(e) => section(s.id, { title: e.target.value })}
                  />
                </label>
                <label className="mt-4 block text-sm">
                  Section text
                  <textarea
                    className="field"
                    rows={3}
                    value={s.body}
                    maxLength={3000}
                    onChange={(e) => section(s.id, { body: e.target.value })}
                  />
                </label>
                {["image", "split", "gallery"].includes(s.type) && (
                  <div className="mt-4">
                    <p className="mb-3 text-xs text-secondary">
                      {s.mediaIds.length} image
                      {s.mediaIds.length === 1 ? "" : "s"} selected
                    </p>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={s.mediaIds.length >= 6}
                      onClick={() => setPicker(s.id)}
                    >
                      {s.type === "gallery"
                        ? "Add gallery image"
                        : "Choose section image"}
                    </button>
                    {s.mediaIds.map((id, n) => (
                      <button
                        type="button"
                        className="ml-3 text-xs text-primary underline"
                        key={id}
                        onClick={() =>
                          section(s.id, {
                            mediaIds: s.mediaIds.filter(
                              (value) => value !== id,
                            ),
                          })
                        }
                      >
                        Remove image {n + 1}
                      </button>
                    ))}
                  </div>
                )}
                {s.type === "cta" && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm">
                      Button label
                      <input
                        className="field"
                        value={s.label}
                        maxLength={100}
                        onChange={(e) =>
                          section(s.id, { label: e.target.value })
                        }
                      />
                    </label>
                    <label className="text-sm">
                      Button link
                      <input
                        className="field"
                        value={s.href}
                        maxLength={300}
                        placeholder="/blog"
                        onChange={(e) =>
                          section(s.id, { href: e.target.value })
                        }
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
          <label className="mt-6 block text-sm">
            Add a section
            <select
              className="field max-w-xs"
              value=""
              disabled={config.sections.length >= 16}
              onChange={(e) => {
                if (!e.target.value) return;
                change("sections", [
                  ...config.sections,
                  {
                    id: crypto.randomUUID(),
                    type: e.target.value as SiteSection["type"],
                    title: "A new perspective",
                    body: "",
                    mediaIds: [],
                    href: "/blog",
                    label: "Explore stories",
                    visible: true,
                  },
                ]);
              }}
            >
              <option value="">Choose section type</option>
              {["latest", "image", "split", "gallery", "quote", "cta"].map(
                (type) => (
                  <option key={type}>{type}</option>
                ),
              )}
            </select>
          </label>
        </section>
        <section className="cms-panel">
          <h2 className="mb-5 font-editorial-headline text-3xl">Footer</h2>
          {field("footer", "Footer note", 300, true)}
        </section>
        {revisions.length > 0 && (
          <details className="cms-panel">
            <summary className="cursor-pointer text-sm font-medium">
              Website revision history
            </summary>
            <p className="mt-4 text-xs text-secondary">
              Restore into the editor first, then save or publish. This does not
              change the live site immediately.
            </p>
            <div className="mt-4 space-y-3">
              {revisions.map((revision) => (
                <button
                  type="button"
                  key={revision.version}
                  className="block text-sm text-primary underline"
                  onClick={() => {
                    setConfig(revision.config);
                    setDirty(true);
                    setMessage(
                      `Revision ${revision.version} loaded into the editor. Review before saving.`,
                    );
                  }}
                >
                  Load revision {revision.version} ·{" "}
                  {new Date(revision.created_at).toLocaleString()}
                </button>
              ))}
            </div>
          </details>
        )}
      </fieldset>
      <div className="sticky bottom-0 mt-8 border-t bg-background/95 py-5 backdrop-blur">
        <p role="status" className="mb-3 text-sm text-primary">
          {message || (dirty ? "Unsaved changes" : "All changes saved")}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="button-secondary"
            disabled={busy}
            onClick={() => void save(false)}
          >
            Save website draft
          </button>
          <button
            type="button"
            className="button-primary"
            disabled={busy}
            onClick={() => void save(true)}
          >
            Publish website
          </button>
        </div>
      </div>
      {picker && (
        <MediaPicker
          onClose={() => setPicker(null)}
          onChoose={(asset) => {
            if (picker === "hero") change("heroMediaId", asset.id);
            else {
              const s = config.sections.find((s) => s.id === picker);
              if (s)
                section(s.id, {
                  mediaIds:
                    s.type === "gallery"
                      ? [...new Set([...s.mediaIds, asset.id])]
                      : [asset.id],
                });
            }
            setPicker(null);
          }}
        />
      )}
    </>
  );
}
