'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Article } from '@/lib/types';
import { INITIAL_ARTICLES } from '@/lib/articles-data';
import {
  loadArticlesFromStorage,
  saveArticlesToStorage,
  getAdminAuthState,
  setAdminAuthState,
} from '@/lib/articles-store';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomeView } from '@/components/views/HomeView';
import { ArchiveView } from '@/components/views/ArchiveView';
import { ReaderView } from '@/components/views/ReaderView';
import { StudioView } from '@/components/views/StudioView';
import { EditorView } from '@/components/views/EditorView';
import { LoginView } from '@/components/views/LoginView';

type ViewMode = 'home' | 'archive' | 'story' | 'studio' | 'editor' | 'login';

export default function Page() {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [currentSlug, setCurrentSlug] = useState<string>('designing-resilient-distributed-state-in-typescript');
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [archiveInitialCategory, setArchiveInitialCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Synchronize browser history and hash navigation safely after initial SSR mount
  useEffect(() => {
    const syncFromHashAndStorage = () => {
      const loaded = loadArticlesFromStorage();
      if (loaded && loaded.length > 0) {
        setArticles(loaded);
      }
      setIsAuthenticated(getAdminAuthState());

      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('story/')) {
        const slug = hash.replace('story/', '');
        if (slug) {
          setCurrentSlug(slug);
          setCurrentView('story');
        }
      } else if (hash === 'archive' || hash === 'articles') {
        setCurrentView('archive');
      } else if (hash === 'studio' || hash === 'admin') {
        setCurrentView('studio');
      } else if (hash === 'login') {
        setCurrentView('login');
      } else if (!hash) {
        setCurrentView('home');
      }
    };

    const timer = setTimeout(syncFromHashAndStorage, 0);
    window.addEventListener('hashchange', syncFromHashAndStorage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', syncFromHashAndStorage);
    };
  }, []);

  // Update hash when view changes
  const navigateTo = (view: string, slug?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'home') {
      setCurrentView('home');
      window.location.hash = '';
    } else if (view === 'archive' || view === 'articles') {
      if (slug) {
        setArchiveInitialCategory(slug);
      }
      setCurrentView('archive');
      window.location.hash = 'archive';
    } else if (view === 'story' || view === 'reader') {
      if (slug) {
        setCurrentSlug(slug);
        window.location.hash = `story/${slug}`;
      }
      setCurrentView('story');
    } else if (view === 'studio') {
      if (!isAuthenticated) {
        setCurrentView('login');
        window.location.hash = 'login';
      } else {
        setCurrentView('studio');
        window.location.hash = 'studio';
      }
    } else if (view === 'editor') {
      if (!isAuthenticated) {
        setCurrentView('login');
        window.location.hash = 'login';
      } else {
        setCurrentView('editor');
      }
    } else if (view === 'login') {
      setCurrentView('login');
      window.location.hash = 'login';
    }
  };

  // Find current reading article
  const currentArticle =
    articles.find((a) => a.slug === currentSlug) ||
    articles[0] ||
    INITIAL_ARTICLES[0];

  // Related articles
  const relatedArticles = articles
    .filter((a) => a.slug !== currentArticle.slug && a.status === 'Published')
    .slice(0, 3);

  // Article CRUD Handlers
  const handleSaveArticle = (savedArticle: Article) => {
    const existingIndex = articles.findIndex((a) => a.id === savedArticle.id);
    let updated: Article[];
    if (existingIndex >= 0) {
      updated = [...articles];
      updated[existingIndex] = savedArticle;
      showToast(
        savedArticle.status === 'Published'
          ? 'Article published successfully!'
          : 'Draft saved to your studio.'
      );
    } else {
      updated = [savedArticle, ...articles];
      showToast(
        savedArticle.status === 'Published'
          ? 'New story published to The Journal!'
          : 'New draft saved successfully.'
      );
    }

    setArticles(updated);
    saveArticlesToStorage(updated);
    setEditingArticle(null);
    setCurrentView('studio');
    window.location.hash = 'studio';
  };

  const handleDeleteArticle = (id: string) => {
    const target = articles.find((a) => a.id === id);
    const updated = articles.filter((a) => a.id !== id);
    setArticles(updated);
    saveArticlesToStorage(updated);
    showToast(`Deleted "${target?.title || 'Article'}"`);
  };

  const handleStartNewArticle = () => {
    setEditingArticle(null);
    setCurrentView('editor');
  };

  const handleStartEditArticle = (article: Article) => {
    setEditingArticle(article);
    setCurrentView('editor');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAdminAuthState(true);
    showToast('Authenticated as Managing Editor.');
    setCurrentView('studio');
    window.location.hash = 'studio';
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setAdminAuthState(false);
    showToast('Signed out of editorial studio.');
    setCurrentView('home');
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Toast Notification Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-surface-container-highest/95 backdrop-blur-md text-on-surface border border-outline-variant/60 shadow-xl rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main View Switcher */}
      {currentView === 'home' && (
        <>
          <Navbar
            currentView="home"
            onNavigate={navigateTo}
            articles={articles}
            onOpenSearch={() => navigateTo('archive')}
          />
          <main className="flex-1">
            <HomeView articles={articles} onNavigate={navigateTo} />
          </main>
          <Footer onNavigate={navigateTo} />
        </>
      )}

      {currentView === 'archive' && (
        <>
          <Navbar
            currentView="archive"
            onNavigate={navigateTo}
            articles={articles}
            onOpenSearch={() => {}}
          />
          <main className="flex-1">
            <ArchiveView
              articles={articles}
              initialCategory={archiveInitialCategory}
              onRead={(slug) => navigateTo('story', slug)}
            />
          </main>
          <Footer onNavigate={navigateTo} />
        </>
      )}

      {currentView === 'story' && currentArticle && (
        <main className="flex-1">
          <ReaderView
            article={currentArticle}
            relatedArticles={relatedArticles}
            onBack={() => navigateTo('archive')}
            onSelectArticle={(slug) => navigateTo('story', slug)}
            onExploreMore={() => navigateTo('archive')}
          />
        </main>
      )}

      {currentView === 'studio' && (
        <main className="flex-1">
          <StudioView
            articles={articles}
            onNewEntry={handleStartNewArticle}
            onEditArticle={handleStartEditArticle}
            onDeleteArticle={handleDeleteArticle}
            onPreviewArticle={(slug) => navigateTo('story', slug)}
            onReaderView={() => navigateTo('home')}
            onSignOut={handleSignOut}
          />
        </main>
      )}

      {currentView === 'editor' && (
        <main className="flex-1">
          <EditorView
            articleToEdit={editingArticle}
            onSave={handleSaveArticle}
            onCancel={() => {
              setEditingArticle(null);
              setCurrentView('studio');
            }}
            onPreview={(slug) => navigateTo('story', slug)}
          />
        </main>
      )}

      {currentView === 'login' && (
        <main className="flex-1">
          <LoginView
            onSuccess={handleLoginSuccess}
            onBackToJournal={() => navigateTo('home')}
          />
        </main>
      )}
    </div>
  );
}
