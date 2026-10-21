'use client';

import React from 'react';

interface StudioSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onNewEntry: () => void;
  onReaderView: () => void;
  onSignOut: () => void;
}

export function StudioSidebar({
  currentTab,
  onTabChange,
  onNewEntry,
  onReaderView,
  onSignOut,
}: StudioSidebarProps) {
  return (
    <aside className="w-64 h-full md:h-screen md:sticky top-0 bg-surface-container-low flex flex-col justify-between border-r border-outline-variant/30 shrink-0 select-none z-30">
      <div className="p-4 flex flex-col gap-5">
        {/* Header / Editorial Director Info */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high shrink-0 border border-outline-variant/40">
            <img
              alt="Managing Editor Portrait"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcP6EtsZh9NxhZ7mI3WhgjJ9L3vZVNoRiwF3yuvCVVD63t3QP2gIHR0QV_2preqYFq-isqEAV3OEAdCUNDoZC0TYZ98dwyUDT5JrgWg0yqxviyi_XyFGoDgF9xR4858oZSRsVTwzIAdSIiNucL84Lzbplk5vR9OmxD0mH2oqJ2WqA6tBpbxwZ38KZ1pLRYDi-q-Nzl8mOZF-kylPXr4vvNZzWL4vJUgZGZp5dkJXdR6yQnGlbowsAUuQ"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-editorial-headline text-lg font-medium text-on-surface truncate leading-snug">
              The Journal Studio
            </span>
            <span className="text-xs text-on-surface-variant truncate">
              Managing Editor
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onNewEntry}
          className="w-full bg-primary-container hover:bg-primary text-on-primary py-2 px-3.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors duration-150 active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>New Entry</span>
        </button>

        {/* Main Navigation Tabs */}
        <nav className="flex flex-col gap-1 text-sm font-medium">
          {/* Dashboard */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${
              currentTab === 'dashboard'
                ? 'bg-surface-container text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span>Dashboard</span>
          </button>

          {/* Stories */}
          <button
            onClick={() => onTabChange('stories')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${
              currentTab === 'stories'
                ? 'bg-surface-container text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            <span>Stories</span>
          </button>

          {/* Drafts */}
          <button
            onClick={() => onTabChange('drafts')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${
              currentTab === 'drafts'
                ? 'bg-surface-container-highest text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            <span>Drafts</span>
          </button>

          {/* Analytics */}
          <button
            onClick={() => onTabChange('analytics')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${
              currentTab === 'analytics'
                ? 'bg-surface-container text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">query_stats</span>
            <span>Analytics</span>
          </button>

          {/* Subscribers */}
          <button
            onClick={() => onTabChange('subscribers')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${
              currentTab === 'subscribers'
                ? 'bg-surface-container text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">group</span>
            <span>Subscribers</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onTabChange('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${
              currentTab === 'settings'
                ? 'bg-surface-container text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Footer Secondary Tab Links */}
      <div className="p-4 border-t border-outline-variant/30 flex flex-col gap-1 text-sm font-medium">
        <button
          onClick={onReaderView}
          className="flex items-center gap-2.5 px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer text-left"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          <span>Reader View</span>
        </button>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2.5 px-3 py-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer text-left"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
