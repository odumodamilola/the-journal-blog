'use client';

import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { slugify } from '@/lib/articles-store';

interface MarkdownEditorProps {
  title: string;
  onTitleChange: (val: string) => void;
  slug: string;
  onSlugChange: (val: string) => void;
  excerpt: string;
  onExcerptChange: (val: string) => void;
  content: string;
  onContentChange: (val: string) => void;
  autoSyncSlug?: boolean;
  hideHeaderFields?: boolean;
}

export function MarkdownEditor({
  title,
  onTitleChange,
  slug,
  onSlugChange,
  excerpt,
  onExcerptChange,
  content,
  onContentChange,
  autoSyncSlug = true,
  hideHeaderFields = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTitleChange = (val: string) => {
    onTitleChange(val);
    if (autoSyncSlug) {
      onSlugChange(slugify(val));
    }
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    onContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4)
      );
    }, 0);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-sm flex flex-col gap-6">
      {/* Title, Slug & Excerpt Fields (hidden when parent editor provides dedicated layout) */}
      {!hideHeaderFields && (
        <>
          {/* Title Input */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Article Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Give your story a compelling title..."
              className="w-full font-editorial-headline text-2xl md:text-3xl font-medium text-on-surface bg-transparent border-0 border-b-2 border-outline-variant/30 pb-2.5 focus:border-primary focus:outline-none placeholder:text-outline-variant placeholder:font-normal transition-colors"
            />
          </div>

          {/* URL Slug Field */}
          <div className="flex flex-col gap-1.5 p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-secondary truncate">
                <span className="material-symbols-outlined text-[16px] text-outline">link</span>
                <span className="text-outline-variant font-mono">thejournal.press/articles/</span>
                <span className="text-on-surface font-mono font-medium truncate">{slug || 'untitled-slug'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSlug(!isEditingSlug)}
                className="text-primary hover:text-primary-container text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>{isEditingSlug ? 'Done' : 'Edit'}</span>
              </button>
            </div>
            {isEditingSlug && (
              <div className="mt-1 pt-1.5 border-t border-outline-variant/20">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => onSlugChange(slugify(e.target.value))}
                  placeholder="custom-url-slug"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-2.5 py-1 font-mono text-xs text-on-surface focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Short Description / Excerpt */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-on-surface-variant">
                Short Description / Excerpt
              </label>
              <span
                className={`text-xs font-mono ${
                  excerpt.length > 200 ? 'text-error font-semibold' : 'text-secondary'
                }`}
              >
                {excerpt.length} / 200
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={220}
              value={excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
              placeholder="Summarize the core premise of this article for RSS readers and publication meta cards..."
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-3 text-sm leading-relaxed text-on-surface focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>
        </>
      )}

      {/* Dual Tab Switcher & Editor Toolbar */}
      <div className="border border-outline-variant/40 rounded-lg overflow-hidden bg-surface-container-lowest">
        {/* Tab Controls & Formatting Toolbar */}
        <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg border border-outline-variant/20">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-3.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Write (Markdown)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Markdown Formatting Toolbar Icons (Available in Write mode) */}
          {activeTab === 'write' && (
            <div className="flex items-center gap-1 text-on-surface-variant">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 hover:bg-surface-container rounded hover:text-on-surface transition-colors cursor-pointer"
                title="Bold"
              >
                <span className="material-symbols-outlined text-[18px]">format_bold</span>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 hover:bg-surface-container rounded hover:text-on-surface transition-colors cursor-pointer"
                title="Italic"
              >
                <span className="material-symbols-outlined text-[18px]">format_italic</span>
              </button>
              <span className="w-px h-4 bg-outline-variant/40 mx-0.5"></span>
              <button
                type="button"
                onClick={() => insertFormatting('## ')}
                className="p-1 hover:bg-surface-container rounded hover:text-on-surface transition-colors font-serif font-bold text-[13px] px-1.5 cursor-pointer"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ')}
                className="p-1 hover:bg-surface-container rounded hover:text-on-surface transition-colors font-serif font-bold text-[13px] px-1.5 cursor-pointer"
                title="Heading 3"
              >
                H3
              </button>
              <span className="w-px h-4 bg-outline-variant/40 mx-0.5"></span>
              <button
                type="button"
                onClick={() => insertFormatting('> ')}
                className="p-1.5 hover:bg-surface-container rounded hover:text-on-surface transition-colors cursor-pointer"
                title="Blockquote"
              >
                <span className="material-symbols-outlined text-[18px]">format_quote</span>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('```typescript\n', '\n```')}
                className="p-1.5 hover:bg-surface-container rounded hover:text-on-surface transition-colors cursor-pointer"
                title="Code Block"
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[', '](https://)')}
                className="p-1.5 hover:bg-surface-container rounded hover:text-on-surface transition-colors cursor-pointer"
                title="Insert Link"
              >
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('![Caption](', ')')}
                className="p-1.5 hover:bg-surface-container rounded hover:text-on-surface transition-colors cursor-pointer"
                title="Add Image"
              >
                <span className="material-symbols-outlined text-[18px]">image</span>
              </button>
            </div>
          )}
        </div>

        {/* Textarea or Preview Body */}
        {activeTab === 'write' ? (
          <div className="p-5">
            <textarea
              ref={textareaRef}
              rows={20}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Write your article in Markdown..."
              className="w-full bg-transparent border-0 font-mono text-[13px] leading-relaxed text-on-surface focus:outline-none resize-y p-0"
            />
          </div>
        ) : (
          <div className="p-8 prose prose-emerald max-w-none min-h-[420px] font-editorial-body text-on-surface leading-relaxed">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-secondary italic">Nothing written yet. Switch to Write tab to begin drafting.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
