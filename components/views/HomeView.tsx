'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Clock, BookOpen } from 'lucide-react';
import { Article, ArticleCategory } from '@/lib/types';
import { filterArticles } from '@/lib/articles-store';

interface HomeViewProps {
  articles: Article[];
  onNavigate: (view: string, slug?: string) => void;
}

export function HomeView({ articles, onNavigate }: HomeViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { label: 'All', key: 'all' },
    { label: 'Technology', key: 'technology' },
    { label: 'Software Engineering', key: 'software-engineering' },
    { label: 'Tutorials', key: 'tutorials' },
    { label: 'Career', key: 'career' },
    { label: 'Personal Notes', key: 'personal-notes' },
  ];

  const featuredArticle =
    articles.find((a) => a.featured) || articles[0] || null;

  const filteredArticles = filterArticles(articles, {
    category: selectedCategory,
    status: 'published',
  }).slice(0, 3);

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-14 pt-12 md:pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Text composition */}
          <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/40 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
              <span className="text-[11px] font-semibold tracking-widest text-on-surface-variant uppercase">
                THE JOURNAL — THOUGHTS, IDEAS &amp; PERSPECTIVES
              </span>
            </div>
            <h1 className="font-editorial-headline text-4xl sm:text-5xl lg:text-6xl text-on-surface mb-6 leading-[1.1] tracking-tight">
              Good ideas deserve a place to grow.
            </h1>
            <p className="font-editorial-body text-xl text-on-surface-variant max-w-xl mb-8 leading-relaxed">
              A space for thoughtful writing on technology, creativity, personal growth, and the ideas shaping tomorrow.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <button
                onClick={() => onNavigate('archive')}
                className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold px-6 py-3 rounded-full transition-all duration-150 active:scale-[0.98] shadow-xs cursor-pointer"
              >
                <span>Explore Articles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (featuredArticle) onNavigate('reader', featuredArticle.slug);
                }}
                className="inline-flex items-center gap-1.5 text-on-surface font-semibold text-sm hover:text-primary pb-0.5 border-b border-transparent hover:border-primary transition-all duration-150 cursor-pointer"
              >
                <span>Read the latest story</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Curated visual card composition */}
          <div className="lg:col-span-5 relative">
            <div
              onClick={() => {
                const target = articles.find(
                  (a) => a.slug === 'the-principles-of-deliberate-software'
                ) || articles[0];
                if (target) onNavigate('reader', target.slug);
              }}
              className="relative bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer group"
            >
              <div className="relative h-[380px] sm:h-[420px] w-full overflow-hidden">
                <img
                  className="w-full h-full object-cover object-[center_70%] transition-transform duration-700 group-hover:scale-105"
                  alt="Architectural serenity frame with soft natural morning light"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYwmMPNzRl1FsR5WVg-y0V00QtRKqN9KtkTIyhLdQMsSIXEzC7TjYZ9DeHW-jcmI_BzbDEESg8YTz5UGUHYx2cGTsHqJ3q9hWWNMdiN01nks7cplZirnWjFEcqae1AU0qdRwIH8QJo0fmhsFSbgLdKjGHj8Ltwwdjm8V7Z1kfu8Dg8sQTnOklceblVQ33s-evYrMWZSQ1niAmSoAYsjcDki6f1oX42_ej9n2ZHpmZcZ755viuz6eJy3A"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-black/25"></div>
                {/* Floating Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-on-surface text-[11px] font-semibold tracking-wider border border-outline-variant/40 shadow-xs">
                    SOFTWARE ARCHITECTURE · 7 MIN READ
                  </span>
                </div>
                {/* Overlay Headline */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-editorial-headline text-2xl text-inverse-on-surface mb-2 font-normal leading-snug">
                    The Architecture of Serenity in Systems
                  </h3>
                  <p className="text-xs text-tertiary-fixed font-light leading-relaxed">
                    Exploring the psychological resonance between built environments and distributed backend pipelines.
                  </p>
                </div>
              </div>
            </div>
            {/* Background Archival Layered Sheet */}
            <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border border-outline-variant/50 -z-10 bg-surface-container-low shadow-xs hidden sm:block"></div>
          </div>
        </div>
      </section>

      {/* 2. Featured Story Section */}
      {featuredArticle && (
        <section className="w-full bg-surface-container-low py-16 border-y border-outline-variant/30">
          <div className="max-w-7xl mx-auto px-4 md:px-14">
            <div className="mb-6">
              <span className="text-xs font-semibold tracking-widest text-primary uppercase">
                FEATURED STORY
              </span>
              <h2 className="font-editorial-headline text-3xl md:text-4xl text-on-surface mt-1">
                A good place to begin.
              </h2>
            </div>
            <article
              onClick={() => onNavigate('reader', featuredArticle.slug)}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Cover Photo */}
                <div className="lg:col-span-7 h-72 lg:h-auto min-h-[360px] relative overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                    alt={featuredArticle.imageAlt}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5Ux8PGA2M_iF07OPb9IODhtM_9y1eaQF9GAF56ncn4Z5fnq2c091URA2jsrWpsD0sv39MxdbEqkWkY-JS7mOQuDa1kpwq1jKH6DUm3cbZrbRgT3Swq2ZnUzXUcwkOGaEYiMyVRFKx3fPoY0iSpV-Nxn-0HRD92EY9r-O6BTjs3RV1ezJJs4qepvBe7NEQtxwz0IDhH7hJScsz7z-yO9KiAYPP0Dlz2ff0fu5m-c0RKMgnKNlEBk-VZw"
                  />
                </div>
                {/* Content Panel */}
                <div className="lg:col-span-5 p-6 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold tracking-wider border border-outline-variant/40">
                        {featuredArticle.category.toUpperCase()}
                      </span>
                      <span className="text-xs text-secondary">{featuredArticle.publishedAt}</span>
                    </div>
                    <h3 className="font-editorial-headline text-2xl md:text-3xl text-on-surface mb-3 group-hover:text-primary transition-colors leading-snug">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant mb-6">
                      {featuredArticle.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                    <div className="flex items-center gap-1.5 text-secondary text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{featuredArticle.readTime}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                      <span>Read Story</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* 3. Explore by Interest (Taxonomy) */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-14 pt-16 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              TAXONOMY
            </span>
            <h2 className="font-editorial-headline text-2xl md:text-3xl text-on-surface mt-1">
              Explore by Interest
            </h2>
          </div>
          <p className="text-xs text-secondary max-w-md">
            Filter across deliberate essays, system architectures, and practical technical field-notes.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-outline-variant/30">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Fresh Off The Press (Latest Articles) */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-14 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              FRESH OFF THE PRESS
            </span>
            <h2 className="font-editorial-headline text-3xl md:text-4xl text-on-surface mt-1">
              Latest Articles
            </h2>
          </div>
          <p className="text-sm text-on-surface-variant mt-2 md:mt-0">
            Explore the newest stories and perspectives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => onNavigate('reader', article.slug)}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div>
                <div className="h-52 w-full overflow-hidden bg-surface-container">
                  <img
                    src={article.imageUrl}
                    alt={article.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold border border-outline-variant/40">
                      {article.category}
                    </span>
                    <span className="text-xs text-secondary">{article.publishedAt}</span>
                  </div>
                  <h3 className="font-editorial-headline text-xl text-on-surface mb-2 group-hover:text-primary transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-outline-variant/20 mt-2">
                <span className="text-xs text-secondary">{article.readTime}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-on-primary-fixed-variant transition-colors">
                  <span>Read</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* View All Articles CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={() => onNavigate('archive')}
            className="inline-flex items-center gap-2 border border-outline-variant/50 hover:border-primary text-on-surface hover:text-primary text-sm font-semibold px-8 py-3 rounded-full bg-surface-container-lowest hover:bg-surface-container transition-all duration-150 cursor-pointer shadow-xs"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 5. Closing Editorial Callout */}
      <section className="w-full bg-surface-container-low border-t border-outline-variant/30 py-16 my-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            DELIBERATE INQUIRY
          </span>
          <h2 className="font-editorial-headline text-3xl md:text-4xl text-on-surface mt-2 mb-4 leading-tight">
            There&apos;s always something new to learn.
          </h2>
          <p className="font-editorial-body text-xl text-on-surface-variant mb-8 leading-relaxed max-w-xl mx-auto">
            Thoughtful articles, useful insights, and stories to keep you curious. Delivered with typographic reverence and intellectual rigor.
          </p>
          <button
            onClick={() => onNavigate('archive')}
            className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold px-8 py-3.5 rounded-full shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
          >
            <span>Browse the Journal</span>
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
