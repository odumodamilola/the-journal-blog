import test from 'node:test';
import assert from 'node:assert/strict';
import {
  slugify,
  calculateWordCount,
  calculateReadingTime,
  computeStats,
  filterArticles,
  paginateArticles,
} from './articles-store';
import { Article } from './types';

const sampleArticles: Article[] = [
  {
    id: '1',
    slug: 'post-one',
    title: 'Designing Resilient Distributed State in TypeScript',
    excerpt: 'Exploring monotonic counters and consensus primitives.',
    content: 'State synchronisation across distributed networks is challenging.',
    category: 'Software Engineering',
    status: 'Published',
    publishedAt: 'Oct 28, 2026',
    dateTimestamp: 1793232000000,
    readTime: '8 min read',
    imageUrl: '/test.png',
    imageAlt: 'Test image',
    author: { name: 'Editor', role: 'Staff', avatarUrl: '/avatar.png' },
  },
  {
    id: '2',
    slug: 'post-two',
    title: 'The Psychology of Deep Work in an Era of Infinite Pings',
    excerpt: 'How intentional boundaries protect focus.',
    content: 'Attention is a scarce cognitive currency in modern engineering offices.',
    category: 'Personal Notes',
    status: 'Published',
    publishedAt: 'Oct 25, 2026',
    dateTimestamp: 1792972800000,
    readTime: '5 min read',
    imageUrl: '/test2.png',
    imageAlt: 'Test image 2',
    author: { name: 'Editor', role: 'Staff', avatarUrl: '/avatar.png' },
  },
  {
    id: '3',
    slug: 'post-three',
    title: 'Local-First Architectures: An Empirical Evaluation',
    excerpt: 'CRDT implementations and offline state sync.',
    content: 'Draft content for evaluating operational transformation vs CRDTs.',
    category: 'Technology',
    status: 'Draft',
    publishedAt: 'Oct 24, 2026',
    dateTimestamp: 1792886400000,
    readTime: '7 min read',
    imageUrl: '/test3.png',
    imageAlt: 'Test image 3',
    author: { name: 'Editor', role: 'Staff', avatarUrl: '/avatar.png' },
  },
];

test('slugify transforms title into clean URL slug', () => {
  assert.equal(
    slugify('Building Better Software Starts With Better Thinking!'),
    'building-better-software-starts-with-better-thinking'
  );
  assert.equal(
    slugify('  The Principles of Deliberate Software & Architecture -- 2026  '),
    'the-principles-of-deliberate-software-architecture-2026'
  );
  assert.equal(slugify('Special characters: @#$%^&*()_+='), 'special-characters');
});

test('calculateWordCount cleans markdown formatting and counts words accurately', () => {
  const md = '# Title\n\nThis is a **clean** test paragraph with [a link](https://test.com) and `inline code`.';
  const count = calculateWordCount(md);
  assert.equal(count > 10, true);
  assert.equal(calculateWordCount(''), 0);
});

test('calculateReadingTime calculates appropriate minutes for content length', () => {
  const shortContent = 'Just a brief thought.';
  assert.equal(calculateReadingTime(shortContent), '1 min read');

  const longContent = Array(600).fill('word').join(' ');
  assert.equal(calculateReadingTime(longContent), '3 min read');
});

test('computeStats computes totals, published count, draft count, and publish rate', () => {
  const stats = computeStats(sampleArticles);
  assert.equal(stats.totalArticles, 3);
  assert.equal(stats.publishedCount, 2);
  assert.equal(stats.draftCount, 1);
  assert.equal(stats.publishRate, 67); // 2 / 3 = 66.66% -> 67%
});

test('filterArticles filters by search query and category', () => {
  const searchResults = filterArticles(sampleArticles, { query: 'distributed' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, '1');

  const categoryResults = filterArticles(sampleArticles, { category: 'personal-notes' });
  assert.equal(categoryResults.length, 1);
  assert.equal(categoryResults[0].id, '2');

  const statusResults = filterArticles(sampleArticles, { status: 'draft' });
  assert.equal(statusResults.length, 1);
  assert.equal(statusResults[0].id, '3');
});

test('paginateArticles splits items and computes boundaries correctly', () => {
  const page1 = paginateArticles(sampleArticles, 1, 2);
  assert.equal(page1.items.length, 2);
  assert.equal(page1.totalPages, 2);
  assert.equal(page1.startIndex, 1);
  assert.equal(page1.endIndex, 2);

  const page2 = paginateArticles(sampleArticles, 2, 2);
  assert.equal(page2.items.length, 1);
  assert.equal(page2.startIndex, 3);
  assert.equal(page2.endIndex, 3);
});
