'use client';

import React from 'react';

interface FooterProps {
  onNavigate: (view: string, slug?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/30 w-full mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-14 py-10 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary-container text-on-primary flex items-center justify-center font-editorial-headline text-xs font-bold shrink-0">
              J
            </div>
            <span className="font-editorial-headline text-lg font-normal text-on-surface">
              The Journal
            </span>
          </div>
          <span className="hidden sm:inline-block text-outline-variant">|</span>
          <p className="text-xs text-on-surface-variant">
            © 2026 The Journal Publishing Co. Crafted for deliberate reading and thoughtful authorship.
          </p>
        </div>

        {/* Links & RSS indicator */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <button
            onClick={() => onNavigate('archive')}
            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Editorial Charter
          </button>
          <button
            onClick={() => onNavigate('archive')}
            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Masthead
          </button>
          <button
            onClick={() => onNavigate('new')}
            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Submissions
          </button>
          <button
            onClick={() => onNavigate('archive')}
            className="text-primary font-medium hover:underline cursor-pointer"
          >
            Archive Index
          </button>
          <button
            onClick={() => onNavigate('archive')}
            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Style Guide
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-1 text-primary hover:underline font-medium cursor-pointer"
            title="Content Studio CMS"
          >
            <span>Admin Access</span>
            <span className="material-symbols-outlined text-[13px]">lock</span>
          </button>
          <button
            onClick={() => {
              alert('RSS feed: /feed.xml has been updated with the latest articles.');
            }}
            className="inline-flex items-center gap-1 text-primary hover:text-primary-container transition-colors cursor-pointer"
            title="RSS Feed"
          >
            <span className="material-symbols-outlined text-[14px]">rss_feed</span>
            <span>RSS</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
