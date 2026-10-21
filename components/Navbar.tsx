'use client';

import React, { useState } from 'react';
import { Search, Bookmark, PenSquare } from 'lucide-react';
import { Article } from '@/lib/types';
import { getBookmarks } from '@/lib/articles-store';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, slug?: string) => void;
  articles?: Article[];
  onOpenSearch?: () => void;
}

export function Navbar({ currentView, onNavigate, articles = [], onOpenSearch }: NavbarProps) {
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const bookmarkSlugs = getBookmarks();
  const bookmarkedArticles = articles.filter((a) => bookmarkSlugs.includes(a.slug));

  return (
    <>
      <header className="bg-surface docked full-width top-0 sticky z-40 border-b border-outline-variant/40">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-4 md:px-14 py-2.5 min-h-[64px]">
          {/* Brand & Wordmark Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-editorial-headline text-lg font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
                J
              </div>
              <span className="font-editorial-headline text-2xl font-medium tracking-tight text-on-surface">
                The Journal
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 pb-1 text-sm font-semibold transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Home</span>
              {currentView === 'home' && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container inline-block"></span>
              )}
            </button>
            <button
              onClick={() => onNavigate('archive')}
              className={`flex items-center gap-1.5 pb-1 text-sm font-semibold transition-colors cursor-pointer ${
                currentView === 'archive'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Archive</span>
              {currentView === 'archive' && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container inline-block"></span>
              )}
            </button>
            <button
              onClick={() => onNavigate('archive', undefined)}
              className="text-on-surface-variant hover:text-on-surface pb-1 text-sm font-medium transition-colors cursor-pointer"
            >
              <span>Dispatches</span>
            </button>
            <button
              onClick={() => onNavigate('studio')}
              className={`flex items-center gap-1.5 pb-1 text-sm font-semibold transition-colors cursor-pointer ${
                currentView.startsWith('studio') || currentView === 'login' || currentView === 'editor'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Studio</span>
              {(currentView.startsWith('studio') || currentView === 'login' || currentView === 'editor') && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container inline-block"></span>
              )}
            </button>
          </nav>

          {/* Trailing Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              aria-label="Search"
              onClick={onOpenSearch || (() => onNavigate('archive'))}
              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
              type="button"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Bookmarks */}
            <div className="relative">
              <button
                aria-label="Bookmarks"
                onClick={() => setShowBookmarksModal(!showBookmarksModal)}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors relative cursor-pointer"
                type="button"
              >
                <Bookmark className="w-5 h-5" />
                {bookmarkSlugs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                    {bookmarkSlugs.length}
                  </span>
                )}
              </button>

              {/* Bookmarks Dropdown */}
              {showBookmarksModal && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/40 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 mb-2">
                    <span className="text-xs font-semibold text-on-surface tracking-wider uppercase">
                      Reading List ({bookmarkedArticles.length})
                    </span>
                    <button
                      onClick={() => setShowBookmarksModal(false)}
                      className="text-outline hover:text-on-surface text-xs"
                    >
                      Close
                    </button>
                  </div>
                  {bookmarkedArticles.length === 0 ? (
                    <div className="py-6 text-center text-secondary text-xs">
                      No saved stories yet. Click the bookmark icon on any dispatch to save it for offline reading.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto custom-scroll space-y-2">
                      {bookmarkedArticles.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => {
                            setShowBookmarksModal(false);
                            onNavigate('reader', art.slug);
                          }}
                          className="p-2 hover:bg-surface-container rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="text-[11px] text-primary font-medium">{art.category}</div>
                          <div className="text-xs font-serif font-medium text-on-surface line-clamp-1">
                            {art.title}
                          </div>
                          <div className="text-[11px] text-secondary">{art.readTime}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-outline-variant/50 hidden sm:block"></div>

            {/* Sign In / Studio Access */}
            <button
              onClick={() => onNavigate('login')}
              className="hidden sm:inline-block text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors cursor-pointer"
            >
              Sign In
            </button>

            {/* Write Button */}
            <button
              onClick={() => onNavigate('new')}
              className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary px-3.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary active:scale-[0.99] transition-all duration-150 shadow-xs cursor-pointer"
            >
              <PenSquare className="w-4 h-4" />
              <span>Write</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
