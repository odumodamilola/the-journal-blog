'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, RotateCcw, FileQuestion, ArrowLeft, ArrowRight } from 'lucide-react';
import { Article } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { filterArticles, paginateArticles } from '@/lib/articles-store';

interface ArchiveViewProps {
  articles: Article[];
  onRead: (slug: string) => void;
  initialCategory?: string;
}

export function ArchiveView({
  articles,
  onRead,
  initialCategory = 'all',
}: ArchiveViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const categories = [
    { label: 'All Articles', key: 'all' },
    { label: 'Technology', key: 'technology' },
    { label: 'Software Engineering', key: 'software-engineering' },
    { label: 'Tutorials', key: 'tutorials' },
    { label: 'Career', key: 'career' },
    { label: 'Personal Notes', key: 'personal-notes' },
  ];

  const filtered = useMemo(() => {
    return filterArticles(articles, {
      query: searchQuery,
      category: selectedCategory,
      status: 'published',
    });
  }, [articles, searchQuery, selectedCategory]);

  const pagination = useMemo(() => {
    return paginateArticles(filtered, currentPage, PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleCategoryChange = (key: string) => {
    setSelectedCategory(key);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const activeCategoryLabel =
    categories.find((c) => c.key === selectedCategory)?.label || 'All Topics';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-14 py-12 flex-grow">
      {/* 1. Page Header */}
      <section className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-0.5 bg-primary-container"></span>
          <span className="text-xs font-semibold text-primary tracking-widest uppercase">
            THE ARCHIVE
          </span>
        </div>
        <h1 className="font-editorial-headline text-4xl sm:text-5xl md:text-6xl text-on-surface tracking-tight mb-3">
          Explore the Journal
        </h1>
        <p className="font-editorial-body text-xl md:text-2xl text-on-surface-variant font-light">
          Thoughts, tutorials, and perspectives on building, learning, and everything in between.
        </p>
      </section>

      {/* 2. Search & Filter Toolbar */}
      <section className="mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search articles by title or keyword..."
              className="w-full pl-10 pr-9 py-2 bg-surface text-on-surface text-sm placeholder:text-secondary/70 border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary-container transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategoryChange(cat.key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                    : 'bg-surface-container-low text-secondary hover:text-on-surface border border-outline-variant/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Results Metadata Indicator */}
        <div className="flex items-center justify-between mt-3 px-1 text-on-surface-variant text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container"></span>
            <span>
              Showing {filtered.length} article{filtered.length === 1 ? '' : 's'} in{' '}
              <strong className="text-on-surface font-semibold">{activeCategoryLabel}</strong>
            </span>
          </div>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={handleReset}
              className="text-primary hover:underline text-xs flex items-center gap-1 font-medium transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </section>

      {/* 3. 3-Column Editorial Grid */}
      {pagination.items.length === 0 ? (
        <div className="my-16 p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <FileQuestion className="w-10 h-10 text-outline mx-auto mb-2" />
          <h3 className="font-editorial-headline text-2xl text-on-surface mb-2">
            No matching dispatches found
          </h3>
          <p className="text-sm text-secondary max-w-md mx-auto mb-6">
            We couldn&apos;t find any articles matching &ldquo;{searchQuery}&rdquo; in {activeCategoryLabel}.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
          >
            Clear Search &amp; Filters
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pagination.items.map((art) => (
            <ArticleCard key={art.id} article={art} onRead={onRead} />
          ))}
        </section>
      )}

      {/* 4. Pagination */}
      {pagination.totalPages > 1 && (
        <nav
          aria-label="Pagination Navigation"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/30 pt-6"
        >
          <div className="text-secondary text-xs">
            Showing <span className="font-semibold text-on-surface">{pagination.startIndex}–{pagination.endIndex}</span> of{' '}
            <span className="font-semibold text-on-surface">{pagination.totalCount}</span> archived entries
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-lg border border-outline-variant/40 text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="px-3 py-1 text-xs font-medium text-on-surface-variant">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="px-3.5 py-1.5 rounded-lg border border-outline-variant/50 text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
