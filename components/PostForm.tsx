"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useState } from "react";
import { savePost } from "@/app/actions/posts";
import { categories } from "@/lib/site";
import { slugify } from "@/lib/posts/validation";
import type { Database } from "@/lib/types/database";
import { Markdown } from "@/components/blog/Markdown";

type Post = Database["public"]["Tables"]["posts"]["Row"];
export function PostForm({ post, newId }: { post?: Post; newId?: string }) {
  const [state, action, pending] = useActionState(savePost, {});
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugEdited, setSlugEdited] = useState(!!post);
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [category, setCategory] = useState(post?.category || "Personal Notes");
  const [cover, setCover] = useState(post?.cover_image_url || "");
  const [alt, setAlt] = useState(post?.cover_image_alt || "");
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty && !pending) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending]);
  const error = (field: keyof NonNullable<typeof state.errors>) =>
    state.errors?.[field] ? (
      <p id={`${field}-error`} className="mt-1 text-sm text-error">
        {state.errors[field]}
      </p>
    ) : null;
  const invalid = (field: keyof NonNullable<typeof state.errors>) => ({
    "aria-invalid": !!state.errors?.[field],
    "aria-describedby": state.errors?.[field] ? `${field}-error` : undefined,
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin"
          className="text-sm text-primary"
          onClick={(event) => {
            if (dirty && !window.confirm("Leave without saving your changes?"))
              event.preventDefault();
          }}
        >
          ← Editorial studio
        </Link>
        <span className="rounded-full border px-3 py-1 text-xs">
          {post?.status === "published" ? "Published article" : "Private draft"}
        </span>
      </div>
      <h1 className="mt-8 font-editorial-headline text-4xl">
        {post ? "Refine your story" : "Start a new story"}
      </h1>
      <p className="mt-3 text-sm text-on-surface-variant">
        Save privately until you’re ready to share. Changes take effect when you
        save.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const submitter = (event.nativeEvent as SubmitEvent).submitter;
          data.set(
            "status",
            submitter instanceof HTMLButtonElement &&
              submitter.value === "published"
              ? "published"
              : "draft",
          );
          // Keep editor values intact when a server action returns validation errors.
          startTransition(() => action(data));
        }}
        onChange={() => setDirty(true)}
        className="mt-8 space-y-6"
      >
        <input type="hidden" name="id" value={post?.id || newId} />
        <input type="hidden" name="version" value={post?.version || 1} />
        <input type="hidden" name="mode" value={post ? "edit" : "create"} />
        {state.message && (
          <p
            role="alert"
            className="rounded-lg border border-error/30 bg-error-container/30 p-4 text-sm text-error"
          >
            {state.message}
          </p>
        )}
        <fieldset disabled={pending} className="space-y-6">
          <label className="block text-sm font-medium">
            Title
            <input
              name="title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!slugEdited) setSlug(slugify(event.target.value));
              }}
              maxLength={200}
              className="field"
              placeholder="An idea worth sharing"
              {...invalid("title")}
            />
            {error("title")}
          </label>
          <label className="block text-sm font-medium">
            Article URL
            <input
              name="slug"
              value={slug}
              readOnly={!!post?.published_at}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.target.value);
              }}
              maxLength={160}
              required
              className="field font-mono"
              {...invalid("slug")}
            />
            <span className="mt-1 block text-xs font-normal text-on-surface-variant">
              /blog/{slug || "your-story"}
              {post?.published_at ? " · Published URLs stay permanent." : ""}
            </span>
            {error("slug")}
          </label>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Category
              <select
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="field"
                {...invalid("category")}
              >
                {categories.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              {error("category")}
            </label>
            <div className="self-end pb-3 text-xs text-on-surface-variant">
              {content.trim().split(/\s+/).filter(Boolean).length} words ·{" "}
              {Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 220))}{" "}
              min read
            </div>
          </div>
          <label className="block text-sm font-medium">
            Short description
            <textarea
              name="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              maxLength={300}
              rows={3}
              className="field"
              placeholder="A short introduction for readers and search engines."
              {...invalid("excerpt")}
            />
            {error("excerpt")}
          </label>
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <label htmlFor="content" className="text-sm font-medium">
                Article content
              </label>
              <button
                type="button"
                aria-pressed={preview}
                className="text-sm text-primary underline"
                onClick={() => setPreview(!preview)}
              >
                {preview ? "Continue editing" : "Preview Markdown"}
              </button>
            </div>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={20}
              hidden={preview}
              className="field min-h-96 font-mono text-sm"
              placeholder="Write your story using Markdown…"
              {...invalid("content")}
            />
            {preview && (
              <div className="min-h-96 rounded-xl border bg-white p-6">
                <Markdown content={content || "*Nothing to preview yet.*"} />
              </div>
            )}
            {error("content")}
            <p className="mt-2 text-xs text-on-surface-variant">
              Markdown supports headings, lists, links, and code. Raw HTML is
              disabled.
            </p>
          </div>
          <details
            className="rounded-xl border p-5"
            open={
              !!state.errors?.cover_image_url || !!state.errors?.cover_image_alt
            }
          >
            <summary className="cursor-pointer text-sm font-medium">
              Cover image (optional)
            </summary>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium">
                HTTPS image URL
                <input
                  name="cover_image_url"
                  type="url"
                  value={cover}
                  onChange={(event) => setCover(event.target.value)}
                  maxLength={2048}
                  className="field"
                  {...invalid("cover_image_url")}
                />
                {error("cover_image_url")}
              </label>
              <p className="text-xs text-on-surface-variant">
                Use Unsplash, Picsum, Googleusercontent, or this project’s
                public Supabase Storage.
              </p>
              <label className="block text-sm font-medium">
                Image description
                <input
                  name="cover_image_alt"
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                  maxLength={300}
                  className="field"
                  {...invalid("cover_image_alt")}
                />
                {error("cover_image_alt")}
              </label>
            </div>
          </details>
          <div className="sticky bottom-0 flex flex-wrap gap-3 border-t bg-background/95 py-5 backdrop-blur">
            <button
              type="submit"
              name="status"
              value="draft"
              className="button-secondary"
            >
              {pending
                ? "Saving…"
                : post?.status === "published"
                  ? "Unpublish to draft"
                  : "Save draft"}
            </button>
            <button
              type="submit"
              name="status"
              value="published"
              className="button-primary"
            >
              {pending
                ? "Saving…"
                : post?.status === "published"
                  ? "Update published article"
                  : "Publish article"}
            </button>
          </div>
        </fieldset>
        <p role="status" className="sr-only">
          {pending ? "Saving article" : ""}
        </p>
      </form>
    </>
  );
}
