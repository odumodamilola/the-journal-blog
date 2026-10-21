'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Article } from '@/lib/types';
import { isBookmarked, toggleBookmark } from '@/lib/articles-store';

interface ReaderViewProps {
  article: Article;
  relatedArticles: Article[];
  onBack: () => void;
  onSelectArticle: (slug: string) => void;
  onExploreMore: () => void;
}

export function ReaderView({
  article,
  relatedArticles,
  onBack,
  onSelectArticle,
  onExploreMore,
}: ReaderViewProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(1); // 0: 18px, 1: 20px, 2: 23px
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [bookmarkedSlug, setBookmarkedSlug] = useState<{ [slug: string]: boolean }>({});
  const bookmarked = bookmarkedSlug[article.slug] ?? isBookmarked(article.slug);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        const progress = (window.scrollY / docHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(code);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleBookmarkToggle = () => {
    const nextState = toggleBookmark(article.slug);
    setBookmarkedSlug((prev) => ({ ...prev, [article.slug]: nextState }));
  };

  const fontSizes = [
    { text: 'text-[18px] leading-[30px]', label: 'Small' },
    { text: 'text-[20px] leading-[34px]', label: 'Standard' },
    { text: 'text-[23px] leading-[38px]', label: 'Comfortable' },
  ];

  return (
    <div className="w-full min-h-screen bg-background text-on-surface antialiased flex flex-col">
      {/* Sticky Top Reading Nav Bar */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-14 py-2.5 flex items-center justify-between">
          {/* Left: Monogram and Back link */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors group py-1 text-xs font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:-translate-x-1">
                arrow_back
              </span>
              <span className="hidden sm:inline">Explore Articles</span>
            </button>
            <div className="h-4 w-px bg-outline-variant/40 hidden sm:block"></div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-primary-container text-on-primary flex items-center justify-center font-editorial-headline text-base font-bold shrink-0">
                J
              </div>
              <span className="font-editorial-headline text-lg font-medium tracking-tight text-on-surface hidden md:inline">
                The Journal
              </span>
            </button>
          </div>

          {/* Center: Current Article Title hint (Visible upon scroll) */}
          <div className="hidden lg:block max-w-md truncate text-center opacity-85">
            <span className="font-editorial-headline text-sm text-on-surface-variant truncate block">
              {article.title}
            </span>
          </div>

          {/* Right: Reader actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Copy Article Link"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copiedLink ? 'check' : 'link'}
              </span>
              <span className="hidden md:inline">
                {copiedLink ? 'Copied' : 'Share'}
              </span>
            </button>

            <button
              onClick={handleBookmarkToggle}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                bookmarked
                  ? 'text-primary bg-primary-fixed/30'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
              }`}
              title="Bookmark story"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={bookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                bookmark
              </span>
            </button>

            <button
              onClick={() => {
                alert('Subscribed! You will receive weekly dispatches from The Journal.');
              }}
              className="ml-1 px-3 py-1.5 bg-primary-container text-on-primary text-xs font-semibold rounded-lg hover:bg-primary transition-colors cursor-pointer"
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="w-full bg-outline-variant/20 h-[2.5px] overflow-hidden">
          <div
            className="bg-primary h-full transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
      </header>

      <main className="w-full flex-grow">
        {/* Breadcrumb back link */}
        <div className="max-w-[740px] mx-auto px-4 pt-8 md:pt-12">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-all duration-200 group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-1">
              arrow_left_alt
            </span>
            <span>Back to Articles</span>
          </button>
        </div>

        {/* Article Header Section */}
        <header className="max-w-[740px] mx-auto px-4 pt-6 pb-8">
          {/* Category Pill */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-surface-container text-on-surface-variant border border-outline-variant/40 rounded-full text-[11px] font-semibold tracking-widest uppercase">
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-editorial-headline text-3xl sm:text-4xl md:text-5xl text-on-surface font-normal tracking-tight mb-4 text-balance leading-tight">
            {article.title}
          </h1>

          {/* Subtitle */}
          <p className="font-editorial-body text-xl md:text-2xl text-on-surface-variant font-light leading-relaxed mb-8 text-balance">
            {article.excerpt}
          </p>

          {/* Metadata & Author Line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-outline-variant/30">
            {/* Author Profile */}
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatarUrl}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover border border-outline-variant/50"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-on-surface">
                    By {article.author.name}
                  </span>
                  <span className="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
                  <span className="text-xs text-primary font-medium">
                    {article.author.role}
                  </span>
                </div>
                <p className="text-xs text-secondary">
                  {article.publishedAt} · {article.readTime}
                  {article.wordCount ? ` · ${article.wordCount} words` : ''}
                </p>
              </div>
            </div>

            {/* Article Utility Controls */}
            <div className="flex items-center gap-1 text-secondary self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
                className="px-2 py-1 hover:text-primary hover:bg-surface-container rounded transition-colors text-xs font-semibold cursor-pointer"
                title="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSizeIndex((i) => Math.min(fontSizes.length - 1, i + 1))}
                className="px-2 py-1 hover:text-primary hover:bg-surface-container rounded transition-colors text-xs font-semibold cursor-pointer"
                title="Increase font size"
              >
                A+
              </button>
              <div className="h-4 w-px bg-outline-variant/40 mx-1"></div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 hover:text-primary hover:bg-surface-container rounded transition-colors cursor-pointer"
                title="Copy story link"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copiedLink ? 'done' : 'share'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  isPlayingAudio ? 'text-primary bg-primary-fixed/30' : 'hover:text-primary hover:bg-surface-container'
                }`}
                title={isPlayingAudio ? 'Pause narrative audio' : 'Listen to narrative audio'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isPlayingAudio ? 'pause' : 'headphones'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        <div className="max-w-5xl mx-auto px-4 md:px-14 mb-10">
          <div className="relative overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-low shadow-sm">
            <img
              src={
                article.slug === 'building-better-software-starts-with-better-thinking'
                  ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7rs5A7kyyp-7PB0LxwjngCDQed3bVO4r0JntAzXc1qMesyH6OMXvu7IEoAXzq2zFlax5emioiIoZS7huWBPJuTX0DecjViT4GqP0qkIu1fPi9CjhA6I46Ag-SzzxloY7ZtwLmpTn9mZ-aEBgbGISDrz7dllmYGTnXLw2Z9PDTzuN5LQXzU4cMFKK4h48HIS64sqZPbFpfjvsYWv8QRnaCqCwkJxqnv26NMqG-03sUyR-EY_FAviAtdg'
                  : article.imageUrl || article.coverImageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsYv1pw284tnSDkXJJNqGK0NIaF13zQxbTRf0qMYdhPnCKONaCN_vR4QNxC7OU1XcOhswnUAbHbjMbgX4E1o_dRO5VXzo37RNzgE2-r1nNuQnBD_mad7biRAfWtOAvWaGvqpFlXzP89hz6JWGAWNn3yIP-XitsfrU-wgQab6ApSoOQO39XAohxYFKWttBYq12iU_4cVpJl6u5G0Ruqg5z3FXdsL2vTWI6VH2jxZNVOBR1HU4dYz4KSmQ'
              }
              alt={article.imageAlt || article.coverCaption || article.title}
              className="w-full h-[320px] md:h-[460px] object-cover"
            />
          </div>
          <p className="mt-3 text-center text-xs text-secondary italic">
            Figure 1: Architectural contemplation precedes structural resilience. Studio dispatch #{article.id}24.
          </p>
        </div>

        {/* Centered Editorial Reading Column */}
        <article
          className={`max-w-[740px] mx-auto px-4 text-on-surface font-editorial-body ${fontSizes[fontSizeIndex].text}`}
        >
          {/* Audio Player Banner if playing */}
          {isPlayingAudio && (
            <div className="mb-6 p-3.5 bg-primary-fixed/30 border border-primary-fixed-dim/50 rounded-xl flex items-center justify-between font-editorial-sans text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-primary font-medium">
                <span className="material-symbols-outlined text-[18px] animate-pulse">graphic_eq</span>
                <span>Now Narrating: {article.title}</span>
              </div>
              <div className="flex items-center gap-3 text-secondary">
                <span>01:14 / 06:00</span>
                <button
                  onClick={() => setIsPlayingAudio(false)}
                  className="hover:text-on-surface text-xs font-semibold cursor-pointer"
                >
                  Stop
                </button>
              </div>
            </div>
          )}

          {/* First paragraph with Drop Cap */}
          {article.content ? (
            <div className="prose prose-emerald max-w-none text-on-surface">
              <div className="drop-cap">
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h2 className="font-editorial-headline text-2xl md:text-3xl text-on-surface font-normal mt-10 mb-4 tracking-tight">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="font-editorial-headline text-xl text-on-surface font-medium mt-8 mb-3">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className={`mb-6 text-on-surface ${fontSizes[fontSizeIndex].text}`}>
                        {children}
                      </p>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-8 pl-6 border-l-2 border-primary py-2 text-on-surface bg-surface-container-low/50 rounded-r-lg not-italic">
                        <div className="font-editorial-headline text-xl italic font-normal text-on-surface leading-snug">
                          {children}
                        </div>
                      </blockquote>
                    ),
                    code: ({ inline, className, children, ...props }: any) => {
                      const codeString = String(children).replace(/\n$/, '');
                      if (inline) {
                        return (
                          <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs font-mono text-primary font-medium" {...props}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <div className="my-8 rounded-lg overflow-hidden border border-outline-variant/40 bg-inverse-surface text-inverse-on-surface shadow-sm font-editorial-sans">
                          <div className="flex items-center justify-between px-4 py-2 bg-inverse-surface border-b border-outline/30 text-outline-variant text-xs">
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-error/70"></span>
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400/70"></span>
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-fixed/70"></span>
                              <span className="ml-2 font-mono uppercase tracking-wider text-[11px] text-tertiary-fixed">
                                typescript
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(codeString)}
                              className="flex items-center gap-1.5 text-tertiary-fixed hover:text-inverse-on-surface transition-colors py-0.5 px-2 rounded hover:bg-white/10 cursor-pointer text-xs"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {copiedCode ? 'check' : 'content_copy'}
                              </span>
                              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="p-4 md:p-5 overflow-x-auto text-[13px] leading-relaxed text-inverse-on-surface font-mono">
                            <code>{codeString}</code>
                          </pre>
                        </div>
                      );
                    },
                    ul: ({ children }) => (
                      <ul className="my-6 space-y-2.5 pl-6 list-disc text-on-surface-variant font-editorial-sans text-sm">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-6 space-y-2.5 pl-6 list-decimal text-on-surface-variant font-editorial-sans text-sm">
                        {children}
                      </ol>
                    ),
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <p className="text-secondary italic">This article has no content yet.</p>
          )}

          {/* Three Diagnostic Questions Checklist Callout for software essays */}
          <div className="my-8 bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 font-editorial-sans">
            <h3 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
              <span>Three diagnostic questions before the first keystroke:</span>
            </h3>
            <ul className="space-y-3 text-xs leading-relaxed text-on-surface-variant">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <span>
                  <strong className="text-on-surface font-semibold">What is the irreversible core?</strong> Identify which database state transitions or API commitments cannot be easily undone later.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <span>
                  <strong className="text-on-surface font-semibold">Can this be described in plain sentences?</strong> If you cannot explain the reconciliation algorithm to a non-technical peer without technical jargon, the boundary is hazy.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <span>
                  <strong className="text-on-surface font-semibold">What is the failure state when external services halt?</strong> Systems must be architected for degradation rather than utopian availability.
                </span>
              </li>
            </ul>
          </div>
        </article>

        {/* Article Ending & Utility Monogram Accent */}
        <div className="max-w-[740px] mx-auto px-4 pt-6 pb-12">
          {/* Monogram Divider */}
          <div className="flex items-center justify-center gap-4 my-8">
            <div className="h-px bg-outline-variant/40 flex-1"></div>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/40">
              <img
                alt="The Journal Monogram"
                className="w-4 h-4 object-contain rounded"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WCnLDISF1B4DOE2WOWVf8o8J1lRGqXM2LX58nL2LAKLggO2Ap5nktLM6rPIg4KCvnMUYTx2BVHWvSxPVsrxw5B5PraRCu5iENa99OBBf8maQLPHFACYEWtC2ABRic3X8PWEaLKnaVm28288EcxNU_GMHfSoTfvItBfaRS6rWjuI66C49hQt0AcNwG9YsELkruxLz31NE0U5AYvHSNLiNvUA6aIxfx4f8reiV9re2deizaQD2e6nnNWYQg"
              />
            </div>
            <div className="h-px bg-outline-variant/40 flex-1"></div>
          </div>

          {/* Signoff Box */}
          <div className="p-6 md:p-8 bg-surface-container-low rounded-xl border border-outline-variant/30 text-center font-editorial-sans">
            <h4 className="font-editorial-headline text-2xl text-on-surface mb-2">
              Thanks for reading.
            </h4>
            <p className="text-xs md:text-sm text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed">
              The Journal publishes weekly dispatches dedicated to intentional craftsmanship across systems engineering, design, and literature.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onExploreMore}
                className="px-5 py-2.5 bg-primary-container text-on-primary text-xs font-semibold rounded-lg hover:bg-primary transition-all shadow-xs cursor-pointer"
              >
                Explore More Articles
              </button>
              <button
                type="button"
                onClick={handleBookmarkToggle}
                className="px-5 py-2.5 border border-outline-variant/50 text-on-surface hover:bg-surface-container text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {bookmarked ? 'bookmark' : 'bookmark_add'}
                </span>
                <span>{bookmarked ? 'Saved to Reading List' : 'Save to Reading List'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-outline-variant/30 bg-surface-container-lowest py-16">
            <div className="max-w-7xl mx-auto px-4 md:px-14">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-3 border-b border-outline-variant/30">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest block mb-1">
                    Curation
                  </span>
                  <h3 className="font-editorial-headline text-2xl md:text-3xl text-on-surface">
                    Stories from the same vein
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onExploreMore}
                  className="mt-2 md:mt-0 text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View full engineering index</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.slice(0, 3).map((art) => (
                  <article
                    key={art.id}
                    onClick={() => onSelectArticle(art.slug)}
                    className="bg-surface rounded-xl border border-outline-variant/40 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="aspect-[16/10] overflow-hidden rounded-lg mb-4 bg-surface-container">
                        <img
                          src={art.imageUrl}
                          alt={art.imageAlt}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-xs">
                        <span className="font-semibold text-primary uppercase tracking-wider text-[11px]">
                          {art.category}
                        </span>
                        <span className="text-outline-variant">·</span>
                        <span className="text-secondary">{art.readTime}</span>
                      </div>
                      <h4 className="font-editorial-headline text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {art.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-secondary text-xs">
                      <span>{art.publishedAt}</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:text-primary">
                        arrow_forward
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Floating Reading Audio / Font Control Dock */}
        <aside className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-surface/95 backdrop-blur-md border border-outline-variant/50 shadow-lg px-4 py-2 rounded-full flex items-center gap-3 text-secondary text-xs">
          <button
            type="button"
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">
              {isPlayingAudio ? 'pause_circle' : 'play_circle'}
            </span>
            <span className="font-medium hidden sm:inline">
              {isPlayingAudio ? 'Playing' : 'Listen (6m)'}
            </span>
          </button>
          <div className="w-px h-3.5 bg-outline-variant/40"></div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
              className={`px-1.5 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                fontSizeIndex === 0 ? 'text-primary bg-primary-fixed/30' : 'hover:text-primary'
              }`}
            >
              Aa-
            </button>
            <button
              type="button"
              onClick={() => setFontSizeIndex((i) => Math.min(fontSizes.length - 1, i + 1))}
              className={`px-1.5 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                fontSizeIndex === 2 ? 'text-primary bg-primary-fixed/30' : 'hover:text-primary'
              }`}
            >
              Aa+
            </button>
          </div>
          <div className="w-px h-3.5 bg-outline-variant/40"></div>
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className="p-1 hover:text-primary transition-colors cursor-pointer"
            title="Bookmark story"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={bookmarked ? { fontVariationSettings: "'FILL' 1", color: '#00593f' } : undefined}
            >
              {bookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
        </aside>
      </main>
    </div>
  );
}
