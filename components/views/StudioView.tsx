'use client';

import React, { useState, useMemo } from 'react';
import { Article, ArticleCategory, ArticleStatus } from '@/lib/types';
import { StudioSidebar } from '@/components/StudioSidebar';
import { DeleteModal } from '@/components/DeleteModal';

interface StudioViewProps {
  articles: Article[];
  onNewEntry: () => void;
  onEditArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onPreviewArticle: (slug: string) => void;
  onReaderView: () => void;
  onSignOut: () => void;
}

export function StudioView({
  articles,
  onNewEntry,
  onEditArticle,
  onDeleteArticle,
  onPreviewArticle,
  onReaderView,
  onSignOut,
}: StudioViewProps) {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | ArticleStatus>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  // Compute live stats
  const totalCount = articles.length;
  const publishedCount = articles.filter((a) => a.status === 'Published').length;
  const draftCount = articles.filter((a) => a.status === 'Draft').length;

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      if (currentTab === 'drafts' && article.status !== 'Draft') return false;
      if (selectedStatus !== 'All' && article.status !== selectedStatus) return false;
      if (selectedCategory !== 'All' && article.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = article.title.toLowerCase().includes(q);
        const matchExcerpt = article.excerpt.toLowerCase().includes(q);
        const matchAuthor = article.author.name.toLowerCase().includes(q);
        if (!matchTitle && !matchExcerpt && !matchAuthor) return false;
      }
      return true;
    });
  }, [articles, currentTab, selectedStatus, selectedCategory, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Slug', 'Category', 'Status', 'Date', 'ReadTime', 'Author'];
    const rows = articles.map((a) => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      a.slug,
      a.category,
      a.status,
      a.publishedAt,
      a.readingTimeMinutes,
      `"${a.author.name}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `the_journal_articles_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col md:flex-row">
      {/* 1. Persistent Sidebar */}
      <StudioSidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'drafts') {
            setSelectedStatus('Draft');
          } else if (tab === 'stories' || tab === 'dashboard') {
            setSelectedStatus('All');
          }
        }}
        onNewEntry={onNewEntry}
        onReaderView={onReaderView}
        onSignOut={onSignOut}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
        {/* Micro-header ambient banner */}
        <div className="px-4 md:px-10 py-2.5 border-b border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-xs flex justify-between items-center text-on-surface-variant text-xs">
          <div className="flex items-center gap-2">
            <span>Editorial Workspace</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-semibold capitalize">
              {currentTab === 'dashboard' ? 'Content Management' : currentTab}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
              CMS Sync Active
            </span>
            <span className="text-outline-variant">|</span>
            <span className="text-[11px] font-mono">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-10 py-8 flex flex-col gap-8">
          {/* Dashboard Header */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-editorial-headline text-3xl sm:text-4xl font-normal text-on-surface tracking-tight">
                {currentTab === 'dashboard' && 'Dashboard'}
                {currentTab === 'stories' && 'All Stories'}
                {currentTab === 'drafts' && 'In-Progress Drafts'}
                {currentTab === 'analytics' && 'Publication Analytics'}
                {currentTab === 'subscribers' && 'Subscribers & Audience'}
                {currentTab === 'settings' && 'Studio Configuration'}
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                {currentTab === 'dashboard' && 'Manage your stories and keep your publication growing.'}
                {currentTab === 'stories' && 'Review, curate, and update your published and drafted essays.'}
                {currentTab === 'drafts' && 'Unpublished manuscripts and works in active drafting.'}
                {currentTab === 'analytics' && 'Performance metrics, read times, and editorial engagement.'}
                {currentTab === 'subscribers' && 'Manage registered readers and newsletter distribution.'}
                {currentTab === 'settings' && 'Editorial rules, domain configurations, and credentials.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-outline-variant/60 text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Export CSV</span>
              </button>

              <button
                onClick={onNewEntry}
                type="button"
                className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ New Article</span>
              </button>
            </div>
          </section>

          {/* 3 Overview Statistics Cards */}
          {(currentTab === 'dashboard' || currentTab === 'stories' || currentTab === 'drafts') && (
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Total Articles */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 flex items-start justify-between shadow-xs hover:border-outline-variant/60 transition-all">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Total Articles
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-editorial-headline text-3xl font-medium text-on-surface">
                      {totalCount}
                    </span>
                    <span className="text-xs text-on-surface-variant">across all issues</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-on-surface-variant/80">
                    <span className="material-symbols-outlined text-[15px] text-primary">trending_up</span>
                    <span>+3 stories added this month</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                </div>
              </div>

              {/* Card 2: Published */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 flex items-start justify-between shadow-xs hover:border-outline-variant/60 transition-all">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                      Published
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Live
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-editorial-headline text-3xl font-medium text-on-surface">
                      {publishedCount}
                    </span>
                    <span className="text-xs text-on-surface-variant">live articles</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-emerald-700">check_circle</span>
                    <span>
                      {totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 100}% live rate
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-100">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
              </div>

              {/* Card 3: Drafts */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 flex items-start justify-between shadow-xs hover:border-outline-variant/60 transition-all">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                      Drafts
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      WIP
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-editorial-headline text-3xl font-medium text-on-surface">
                      {draftCount}
                    </span>
                    <span className="text-xs text-on-surface-variant">in-progress essays</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-800 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-amber-700">edit_note</span>
                    <span>Ready for editorial polish</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-800 border border-amber-100">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
              </div>
            </section>
          )}

          {/* MAIN ARTICLES TABLE VIEW */}
          {(currentTab === 'dashboard' || currentTab === 'stories' || currentTab === 'drafts') && (
            <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
              {/* Header & Filter Controls */}
              <div className="p-5 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-editorial-headline text-xl font-medium text-on-surface">
                    Your Articles
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Create, edit, and manage everything you have written.
                  </p>
                </div>

                {/* Filter and Search Ribbon */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Input */}
                  <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-outline">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search stories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Status Toggle Pills */}
                  <div className="inline-flex rounded-lg bg-surface-container-low p-0.5 border border-outline-variant/40">
                    {(['All', 'Published', 'Draft'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          selectedStatus === status
                            ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {status === 'Draft' ? 'Drafts' : status}
                      </button>
                    ))}
                  </div>

                  {/* Category Selector */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary-container cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Technology">Technology</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Tutorials">Tutorials</option>
                    <option value="Career">Career</option>
                    <option value="Personal Notes">Personal Notes</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-low/60 border-b border-outline-variant/20 text-on-surface-variant font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-5">Title & Summary</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-center">Reading Time</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {filteredArticles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[36px] text-outline-variant block mb-2">
                            drafts
                          </span>
                          <p className="text-sm font-medium text-on-surface">No articles found</p>
                          <p className="text-xs text-outline mt-1">
                            Try adjusting your search criteria or write a new entry.
                          </p>
                          <button
                            onClick={onNewEntry}
                            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            <span>Create New Article</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredArticles.map((article) => (
                        <tr
                          key={article.id}
                          className="hover:bg-surface-container-low/50 transition-colors group"
                        >
                          {/* Title & Excerpt */}
                          <td className="py-4 px-5 max-w-sm">
                            <div className="flex flex-col gap-1">
                              <span
                                onClick={() => onEditArticle(article)}
                                className="font-editorial-headline text-base font-medium text-on-surface hover:text-primary cursor-pointer line-clamp-1"
                              >
                                {article.title}
                              </span>
                              <span className="text-[11px] text-on-surface-variant line-clamp-1">
                                {article.excerpt}
                              </span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant/40">
                              {article.category}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {article.status === 'Published' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                Live
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                Draft
                              </span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 whitespace-nowrap text-on-surface-variant text-[11px]">
                            {article.publishedAt}
                          </td>

                          {/* Read Time */}
                          <td className="py-4 px-4 whitespace-nowrap text-center text-on-surface-variant text-[11px]">
                            {article.readTime || `${article.readingTimeMinutes || 5} min read`}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* Preview / Read */}
                              <button
                                onClick={() => onPreviewArticle(article.slug)}
                                title="Preview Article"
                                className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  visibility
                                </span>
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => onEditArticle(article)}
                                title="Edit Article"
                                className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  edit_square
                                </span>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setArticleToDelete(article)}
                                title="Delete Article"
                                className="p-1.5 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer info */}
              <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>
                  Showing {filteredArticles.length} of {totalCount} total entries
                </span>
                <span className="font-mono">Supabase Storage Sync: Active</span>
              </div>
            </section>
          )}

          {/* ANALYTICS TAB CONTENT */}
          {currentTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Total Readers
                  </span>
                  <div className="font-editorial-headline text-3xl font-medium mt-2">89,420</div>
                  <span className="text-[11px] text-emerald-700 flex items-center gap-1 mt-2 font-medium">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +14.8% vs last month
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Avg Completion Rate
                  </span>
                  <div className="font-editorial-headline text-3xl font-medium mt-2">68.4%</div>
                  <span className="text-[11px] text-emerald-700 flex items-center gap-1 mt-2 font-medium">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span> High depth of engagement
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Avg Read Duration
                  </span>
                  <div className="font-editorial-headline text-3xl font-medium mt-2">6m 42s</div>
                  <span className="text-[11px] text-on-surface-variant mt-2 block">
                    Focused long-form cohort
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Bookmarks Saved
                  </span>
                  <div className="font-editorial-headline text-3xl font-medium mt-2">1,834</div>
                  <span className="text-[11px] text-primary mt-2 block font-medium">
                    Personal library additions
                  </span>
                </div>
              </div>

              {/* Popular Articles */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
                <h3 className="font-editorial-headline text-xl font-medium text-on-surface mb-4">
                  Top Performing Essays
                </h3>
                <div className="space-y-3">
                  {articles.slice(0, 4).map((art, idx) => (
                    <div
                      key={art.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-outline w-5 font-semibold">0{idx + 1}</span>
                        <div>
                          <p className="font-editorial-headline text-sm font-medium text-on-surface">{art.title}</p>
                          <span className="text-[11px] text-on-surface-variant">{art.category} · {art.publishedAt}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-primary">{Math.round(24000 / (idx + 1)).toLocaleString()} reads</span>
                        <span className="block text-[10px] text-outline">72% read to end</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBSCRIBERS TAB */}
          {currentTab === 'subscribers' && (
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
                <div>
                  <h3 className="font-editorial-headline text-2xl font-medium text-on-surface">Subscribers Directory</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">1,420 readers subscribed to The Journal Dispatches.</p>
                </div>
                <button
                  onClick={() => alert('Subscriber list exported as CSV.')}
                  className="px-3.5 py-2 rounded-lg border border-outline-variant/50 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Export Member List
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-surface-container-low">
                  <span className="text-xs text-on-surface-variant font-medium">Free Reading Tier</span>
                  <div className="text-2xl font-editorial-headline font-semibold mt-1">1,120</div>
                  <span className="text-[11px] text-outline">Bi-weekly essay digest</span>
                </div>
                <div className="p-4 rounded-lg bg-surface-container-low">
                  <span className="text-xs text-on-surface-variant font-medium">Patron / Print Member</span>
                  <div className="text-2xl font-editorial-headline font-semibold mt-1">300</div>
                  <span className="text-[11px] text-primary font-medium">Quarterly archival issues</span>
                </div>
                <div className="p-4 rounded-lg bg-surface-container-low">
                  <span className="text-xs text-on-surface-variant font-medium">Average Open Rate</span>
                  <div className="text-2xl font-editorial-headline font-semibold mt-1">64.2%</div>
                  <span className="text-[11px] text-emerald-700 font-medium">+18% above editorial industry benchmarks</span>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {currentTab === 'settings' && (
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 max-w-3xl space-y-6">
              <h3 className="font-editorial-headline text-2xl font-medium text-on-surface">Studio Settings</h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-on-surface mb-1">
                    Publication Name
                  </label>
                  <input
                    type="text"
                    defaultValue="The Journal"
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-on-surface mb-1">
                    Editorial Tagline
                  </label>
                  <input
                    type="text"
                    defaultValue="Ideas worth sharing. Stories worth reading."
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-on-surface mb-1">
                    Managing Editor Email
                  </label>
                  <input
                    type="email"
                    defaultValue="editor@thejournal.press"
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-on-surface mb-1">
                    Custom Domain
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue="thejournal.press"
                      className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface font-mono"
                    />
                    <span className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Verified SSL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <DeleteModal
          isOpen={true}
          articleTitle={articleToDelete.title}
          onConfirm={() => {
            onDeleteArticle(articleToDelete.id);
            setArticleToDelete(null);
          }}
          onCancel={() => setArticleToDelete(null)}
        />
      )}
    </div>
  );
}
