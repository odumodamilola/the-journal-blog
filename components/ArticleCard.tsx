'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Article } from '@/lib/types';

interface ArticleCardProps {
  article: Article;
  onRead: (slug: string) => void;
}

export function ArticleCard({ article, onRead }: ArticleCardProps) {
  return (
    <article
      onClick={() => onRead(article.slug)}
      className="card-lift bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden flex flex-col justify-between group cursor-pointer"
    >
      <div>
        <div className="relative w-full h-48 overflow-hidden bg-surface-container">
          <img
            src={article.imageUrl || article.coverImageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsYv1pw284tnSDkXJJNqGK0NIaF13zQxbTRf0qMYdhPnCKONaCN_vR4QNxC7OU1XcOhswnUAbHbjMbgX4E1o_dRO5VXzo37RNzgE2-r1nNuQnBD_mad7biRAfWtOAvWaGvqpFlXzP89hz6JWGAWNn3yIP-XitsfrU-wgQab6ApSoOQO39XAohxYFKWttBYq12iU_4cVpJl6u5G0Ruqg5z3FXdsL2vTWI6VH2jxZNVOBR1HU4dYz4KSmQ'}
            alt={article.imageAlt || article.coverCaption || article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/40 text-[11px] font-semibold text-on-surface">
              {article.category}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-secondary text-xs font-medium mb-2">
            <time>{article.publishedAt}</time>
            <span>·</span>
            <span>{article.readTime || `${article.readingTimeMinutes || 5} min read`}</span>
          </div>
          <h2 className="font-editorial-headline text-[22px] leading-[30px] font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2 tracking-tight">
            {article.title}
          </h2>
          <p className="text-sm leading-relaxed text-on-surface-variant line-clamp-2">
            {article.excerpt}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
          <span>Read dispatch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
}
