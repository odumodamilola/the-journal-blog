import { Article, ArticleCategory, ArticleStatus, StudioStats } from './types';
import { INITIAL_ARTICLES } from './articles-data';

const STORAGE_KEY = 'the_journal_articles_v1';
const BOOKMARKS_KEY = 'the_journal_bookmarks_v1';
const AUTH_KEY = 'the_journal_admin_auth_v1';

// -------------------------------------------------------------
// Pure Calculation & Formatting Logic (Decoupled & Testable)
// -------------------------------------------------------------

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateWordCount(content: string): number {
  if (!content) return 0;
  const cleaned = content.replace(/#+|<[^>]*>|[-*`_>]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words.length;
}

export function calculateReadingTime(content: string): string {
  const words = calculateWordCount(content);
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function computeStats(articles: Article[]): StudioStats {
  const totalArticles = articles.length;
  const publishedCount = articles.filter((a) => a.status === 'Published').length;
  const draftCount = articles.filter((a) => a.status === 'Draft').length;
  const publishRate =
    totalArticles > 0 ? Math.round((publishedCount / totalArticles) * 100) : 0;

  return {
    totalArticles,
    publishedCount,
    draftCount,
    publishRate,
  };
}

export function filterArticles(
  articles: Article[],
  options: {
    query?: string;
    category?: string;
    status?: string;
  }
): Article[] {
  const q = (options.query || '').toLowerCase().trim();
  const cat = options.category;
  const status = options.status;

  return articles.filter((item) => {
    // Status check
    if (status && status !== 'all' && item.status.toLowerCase() !== status.toLowerCase()) {
      return false;
    }

    // Category check
    if (cat && cat !== 'all') {
      const normalizedCat = cat.toLowerCase().replace(/[-\s]/g, '');
      const itemCat = item.category.toLowerCase().replace(/[-\s]/g, '');
      if (itemCat !== normalizedCat) return false;
    }

    // Search query check
    if (q) {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchExcerpt = item.excerpt.toLowerCase().includes(q);
      const matchContent = item.content.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchExcerpt && !matchContent && !matchCategory) {
        return false;
      }
    }

    return true;
  });
}

export function paginateArticles(
  articles: Article[],
  page: number,
  pageSize: number
): {
  items: Article[];
  page: number;
  totalPages: number;
  totalCount: number;
  startIndex: number;
  endIndex: number;
} {
  const totalCount = articles.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const items = articles.slice(startIndex, endIndex);

  return {
    items,
    page: currentPage,
    totalPages,
    totalCount,
    startIndex: totalCount > 0 ? startIndex + 1 : 0,
    endIndex,
  };
}

// -------------------------------------------------------------
// Client Storage & Persistence Helpers
// -------------------------------------------------------------

export function loadArticlesFromStorage(): Article[] {
  if (typeof window === 'undefined') {
    return INITIAL_ARTICLES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ARTICLES));
      return INITIAL_ARTICLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ARTICLES;
  } catch {
    return INITIAL_ARTICLES;
  }
}

export function saveArticlesToStorage(articles: Article[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch (err) {
    console.error('Failed to save articles to storage:', err);
  }
}

export function getBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(slug);
    let isNowBookmarked = false;
    if (index >= 0) {
      bookmarks.splice(index, 1);
      isNowBookmarked = false;
    } else {
      bookmarks.push(slug);
      isNowBookmarked = true;
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return isNowBookmarked;
  } catch {
    return false;
  }
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().includes(slug);
}

export function getAdminAuthState(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthState(isLoggedIn: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (isLoggedIn) {
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}
