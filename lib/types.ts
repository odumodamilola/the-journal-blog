export type ArticleCategory =
  | 'Technology'
  | 'Software Engineering'
  | 'Tutorials'
  | 'Career'
  | 'Personal Notes';

export type ArticleStatus = 'Published' | 'Draft';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  status: ArticleStatus;
  publishedAt: string; // e.g. "Oct 28, 2026"
  dateTimestamp?: number;
  readTime?: string; // e.g. "8 min read"
  readingTimeMinutes?: number | string;
  wordCount?: number;
  imageUrl?: string;
  imageAlt?: string;
  coverImageUrl?: string;
  coverCaption?: string;
  author: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  featured?: boolean;
}

export interface StudioStats {
  totalArticles: number;
  publishedCount: number;
  draftCount: number;
  publishRate: number;
}
