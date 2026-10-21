'use client';

import React, { useState, useEffect } from 'react';
import { Article, ArticleCategory, ArticleStatus } from '@/lib/types';
import { slugify, calculateReadingTime } from '@/lib/articles-store';
import { MarkdownEditor } from '@/components/MarkdownEditor';

interface EditorViewProps {
  articleToEdit: Article | null;
  onSave: (article: Article) => void;
  onCancel: () => void;
  onPreview: (slug: string) => void;
}

const PRESET_COVERS = [
  {
    name: 'Serene Ceramic & Notebook',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsYv1pw284tnSDkXJJNqGK0NIaF13zQxbTRf0qMYdhPnCKONaCN_vR4QNxC7OU1XcOhswnUAbHbjMbgX4E1o_dRO5VXzo37RNzgE2-r1nNuQnBD_mad7biRAfWtOAvWaGvqpFlXzP89hz6JWGAWNn3yIP-XitsfrU-wgQab6ApSoOQO39XAohxYFKWttBYq12iU_4cVpJl6u5G0Ruqg5z3FXdsL2vTWI6VH2jxZNVOBR1HU4dYz4KSmQ',
  },
  {
    name: 'Minimalist Architecture Library',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwVEHEYYrK1iFVxZusZtRgr26OR-5GhDYDFHs_E81kej6wkXeOfH7_FIpRCdP-kTsUyw_2hYEC1qLzwrL4xCMSvJl_kFLb5dx2rrGcvz-nrJqbIO43AghmUgT90bo0wuNw3PJPoRHw_6q-y-lQuzFcNxsXoJbradPKMxYVRlMkuH3xJZKt0_5rULCN4i8uQ8g-ah2_B0etypb73p6iUbBB6jWYRUAnjHrzpu98alMNjAvMGvv0AzVkiw',
  },
  {
    name: 'Architectural Serenity Garden',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYwmMPNzRl1FsR5WVg-y0V00QtRKqN9KtkTIyhLdQMsSIXEzC7TjYZ9DeHW-jcmI_BzbDEESg8YTz5UGUHYx2cGTsHqJ3q9hWWNMdiN01nks7cplZirnWjFEcqae1AU0qdRwIH8QJo0fmhsFSbgLdKjGHj8Ltwwdjm8V7Z1kfu8Dg8sQTnOklceblVQ33s-evYrMWZSQ1niAmSoAYsjcDki6f1oX42_ej9n2ZHpmZcZ755viuz6eJy3A',
  },
  {
    name: 'Typographic Paper & Book Spine',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-H2-6WHWLkq7zTiTtXkDQYrbIJAaDCwI9BVV7t3Yupp4uRBFv3qRi65lxaftgSGDskcoM2pAH-cEJvay_fzcd4FkXGMYBxJlfyhCoZ16tTAsXN9i2DCu6v6qs83o5yfhrIt4lK2B47u_n165fSYUVSyst4rjluQt6pEOcrmJYVzUghrriDMVpaytdNjwAmGpZPBGXgBSKvi5IJkUKgf8r6Kyc8Nmhi71KMrowb-lMOrF0_u6lV0YdKQ',
  },
];

export function EditorView({
  articleToEdit,
  onSave,
  onCancel,
  onPreview,
}: EditorViewProps) {
  const isEditing = !!articleToEdit;

  const [title, setTitle] = useState(articleToEdit?.title || '');
  const [slug, setSlug] = useState(articleToEdit?.slug || '');
  const [isSlugCustom, setIsSlugCustom] = useState(isEditing);
  const [excerpt, setExcerpt] = useState(articleToEdit?.excerpt || '');
  const [content, setContent] = useState(
    articleToEdit?.content ||
      `### The Anatomy of Mindful Architecture\n\nWhen we build software systems with deliberate care, we prioritize clarity over haste. Every architectural boundary becomes a quiet contract between components.\n\n> "Simplicity is prerequisite for reliability."\n\n#### Diagnostic Considerations\n\n* Can state survive transient disconnection?\n* Does each domain boundary hold a single clear invariant?\n* Are mutations idempotent and observable?\n\n\`\`\`typescript\ninterface DistributedEntity<T> {\n  id: string;\n  version: number;\n  timestamp: number;\n  payload: T;\n}\n\`\`\`\n\nContinue shaping the narrative here...`
  );
  const [category, setCategory] = useState<ArticleCategory>(
    articleToEdit?.category || 'Technology'
  );
  const [authorName, setAuthorName] = useState(
    articleToEdit?.author?.name || 'Evelyn Reed'
  );
  const [authorRole, setAuthorRole] = useState(
    articleToEdit?.author?.role || 'Lead Architect & Systems Researcher'
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    articleToEdit?.coverImageUrl || PRESET_COVERS[0].url
  );
  const [coverCaption, setCoverCaption] = useState(
    articleToEdit?.coverCaption ||
      'Archival capture of deliberate workspace tools, medium format.'
  );
  const [featured, setFeatured] = useState(articleToEdit?.featured || false);
  const [lastSaved, setLastSaved] = useState<string>('Autosaved just now');

  // Auto-generate slug when title changes unless manually customized
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugCustom) {
      setSlug(slugify(val));
    }
  };

  const handleSave = (status: ArticleStatus) => {
    if (!title.trim()) {
      alert('Please enter a title for your article.');
      return;
    }

    const finalSlug = slug.trim() || slugify(title);
    const readingTime = calculateReadingTime(content);

    const savedArticle: Article = {
      id: articleToEdit?.id || String(Date.now()),
      slug: finalSlug,
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      content,
      category,
      status,
      publishedAt: articleToEdit?.publishedAt || 'October 28, 2026',
      readingTimeMinutes: readingTime,
      readTime: readingTime,
      imageUrl: coverImageUrl,
      imageAlt: coverCaption,
      coverImageUrl,
      coverCaption,
      featured,
      author: {
        name: authorName,
        role: authorRole,
        avatarUrl:
          articleToEdit?.author?.avatarUrl ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCcP6EtsZh9NxhZ7mI3WhgjJ9L3vZVNoRiwF3yuvCVVD63t3QP2gIHR0QV_2preqYFq-isqEAV3OEAdCUNDoZC0TYZ98dwyUDT5JrgWg0yqxviyi_XyFGoDgF9xR4858oZSRsVTwzIAdSIiNucL84Lzbplk5vR9OmxD0mH2oqJ2WqA6tBpbxwZ38KZ1pLRYDi-q-Nzl8mOZF-kylPXr4vvNZzWL4vJUgZGZp5dkJXdR6yQnGlbowsAUuQ',
      },
    };

    setLastSaved('Saved to publication');
    onSave(savedArticle);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col">
      {/* Top Action Bar */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Stories</span>
          </button>
          <span className="text-outline-variant">/</span>
          <span className="text-xs font-medium text-on-surface">
            {isEditing ? 'Edit Story' : 'New Story'}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-outline ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
            {lastSaved}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {slug && (
            <button
              onClick={() => onPreview(slug)}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Preview</span>
            </button>
          )}

          <button
            onClick={() => handleSave('Draft')}
            type="button"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-outline-variant/60 hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave('Published')}
            type="button"
            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">publish</span>
            <span>Publish Story</span>
          </button>
        </div>
      </header>

      {/* Main Form & Markdown Canvas */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
        {/* Editorial Configuration Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant mb-1">
              Article Title
            </label>
            <input
              type="text"
              placeholder="e.g. Designing Resilient Distributed State in TypeScript"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full font-editorial-headline text-2xl sm:text-3xl text-on-surface bg-transparent border-b border-outline-variant/40 focus:border-primary-container focus:outline-none pb-2 transition-colors placeholder:text-outline"
            />
          </div>

          {/* Slug URL */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="text-on-surface-variant font-medium">Canonical Slug:</span>
            <span className="font-mono text-outline">https://thejournal.press/posts/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setIsSlugCustom(true);
                setSlug(e.target.value);
              }}
              placeholder="url-friendly-slug"
              className="font-mono text-primary font-semibold bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/40 focus:outline-none focus:border-primary-container"
            />
            {!isSlugCustom && (
              <span className="text-[10px] text-outline italic">Auto-generated from title</span>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Brief Excerpt (Abstract)
              </label>
              <span className="text-[10px] text-outline font-mono">
                {excerpt.length}/280
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={280}
              placeholder="Write a clear, thought-provoking summary of this article..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary-container transition-colors resize-none"
            />
          </div>

          {/* Metadata Row: Category, Author, Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-outline-variant/20">
            {/* Category */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary-container cursor-pointer"
              >
                <option value="Technology">Technology</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Tutorials">Tutorials</option>
                <option value="Career">Career</option>
                <option value="Personal Notes">Personal Notes</option>
              </select>
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant mb-1">
                Author Byline
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>

            {/* Featured Story */}
            <div className="flex flex-col justify-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-container focus:ring-primary-container"
                />
                <span className="text-xs text-on-surface font-semibold">
                  Feature on Journal Homepage
                </span>
              </label>
            </div>
          </div>

          {/* Cover Image Picker */}
          <div className="pt-2 border-t border-outline-variant/20">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Cover Image
              </label>
              <span className="text-[10px] text-outline">Select preset or provide image URL</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {PRESET_COVERS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setCoverImageUrl(preset.url)}
                  className={`h-16 rounded-lg overflow-hidden border-2 relative transition-all group ${
                    coverImageUrl === preset.url
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-outline-variant/40 hover:border-outline-variant/80'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] py-0.5 truncate px-1 text-center">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-mono"
              />
              <input
                type="text"
                value={coverCaption}
                onChange={(e) => setCoverCaption(e.target.value)}
                placeholder="Figure caption..."
                className="w-1/3 bg-surface-container-low border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
              />
            </div>
          </div>
        </div>

        {/* Markdown Content Editor */}
        <div className="flex-1">
          <MarkdownEditor
            title={title}
            onTitleChange={handleTitleChange}
            slug={slug}
            onSlugChange={(newSlug) => {
              setIsSlugCustom(true);
              setSlug(newSlug);
            }}
            excerpt={excerpt}
            onExcerptChange={setExcerpt}
            content={content}
            onContentChange={setContent}
            autoSyncSlug={!isSlugCustom}
            hideHeaderFields={true}
          />
        </div>
      </main>
    </div>
  );
}
