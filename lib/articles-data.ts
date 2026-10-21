import { Article } from './types';

export const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'designing-resilient-distributed-state-in-typescript',
    title: 'Designing Resilient Distributed State in TypeScript',
    excerpt:
      'Exploring state synchronisation primitives, monotonic counters, and conflict resolution across complex disconnected client architectures.',
    category: 'Software Engineering',
    status: 'Published',
    publishedAt: 'Oct 28, 2026',
    dateTimestamp: 1793232000000,
    readTime: '8 min read',
    wordCount: 1640,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB-Iw-U8uQXbIsz7esh2sWAPCUdBda1juqKfQyVTga6JjoqSAhZDj0jJYA_Ki3rEE9voK3-AomicTq52QbvQTO89lBQMGITfnz-clmNT7oYInjgiyX2lIEf5wo1yzxLjT12FOHL7AKZ3rg1Ds1hHjsuBz2ObGsgw_6I8DrqVG9b7ffVDJPXlo9z7Hlt37T6oy1oDvZ3Vk34NPY66pv9f9dHO2ZXrEs8MveP4QsbfxysNVM2jJ9VoBpgxw',
    imageAlt:
      'A clean minimalist developer studio desk bathed in morning sunlight with laptop and notebook.',
    author: {
      name: 'The Journal Editorial',
      role: 'Author',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBPQDz79MkY-Dsgkz1OPgZCJJHfTPMw904-tE-Gr_V0jtGE9ruHvQg0sz9USSi5TvABUgEgprAZXNXWHW9wh0ID-kJh_gRvmNAwuHruY_8oJO1u-h0O0YCLpU6QVBt0Fo_FwtU73Kbk0rJi1UaU5d40_39l0MzO4PyaCrOAVKl1N0baEEb2AN8yfoY5JfgK2Y6iOQ7jhy6pph8bc64rgkeKIfCaHHA2SwIkuBjDiWKgSNPCQ9L32S8sCQ',
    },
    content: `## The Anatomy of Offline State

State management in distributed web applications is frequently treated as a solved persistence challenge until network partitioning manifests. When network boundaries become porous, naive optimistic updates crumble into race conditions, phantom overwrites, and state drift.

### Monotonic Clocks and Causal Consistency

In centralized architectures, an auto-incrementing database sequence or unified UTC timestamp provides a convenient illusion of absolute time. In distributed, peer-to-peer, or disconnected edge runtimes, physical time is fundamentally untrustworthy.

\`\`\`typescript
export interface VectorClock {
  readonly clientIdentifier: string;
  readonly monotonicCounter: bigint;
  readonly lineageProof: ReadonlyArray<string>;
}

export function advanceClock(current: VectorClock, peer: VectorClock): VectorClock {
  return {
    clientIdentifier: current.clientIdentifier,
    monotonicCounter: (current.monotonicCounter > peer.monotonicCounter 
      ? current.monotonicCounter 
      : peer.monotonicCounter) + 1n,
    lineageProof: [...current.lineageProof, peer.clientIdentifier]
  };
}
\`\`\`

> "State is not what you keep in memory; it is the chronological log of decisions your software agreed not to regret."

### Key Principles for Resilient State
1. **Append-Only Delta Streams**: Never mutate records in place; broadcast operations that commute cleanly.
2. **Deterministic Convergence**: Two nodes applying the same set of operations in any order must arrive at the identical state.
3. **Graceful Degradation**: When a sync peer halts, read and write buffers must preserve transactional boundaries.`,
  },
  {
    id: '2',
    slug: 'the-psychology-of-deep-work-in-an-era-of-infinite-pings',
    title: 'The Psychology of Deep Work in an Era of Infinite Pings',
    excerpt:
      'How intentional cognitive boundaries and sensory reduction rituals protect original craft from modern micro-interruptions.',
    category: 'Personal Notes',
    status: 'Published',
    publishedAt: 'Oct 25, 2026',
    dateTimestamp: 1792972800000,
    readTime: '5 min read',
    wordCount: 1180,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAtuoi1m7DtenT_vaw96PTd9FtMYnVZi8AnpqwYa0Qp8BVoK6pQ0RA5a3RZLeifzL-t5CxmstZdRuuj6MNhRlMorvkC19MASju5H56xXR2XASvqOVmzk0duwk6swPdkUNDsr7GFeUIKw-vfSG-zmCCEs6beZ6GVSkTbbzeequmc_8w_0Vw0ojphJXid1ye7F3NRgg24ZGM2Koj9lpPR2hVee4g7rP7GFUX6nVXmFwIFZ4G2R56omWu7kA',
    imageAlt:
      'An overhead shot of an uncluttered oak writing desk featuring a ceramic tea cup, fountain pen, and closed leather journal.',
    author: {
      name: 'Elena Rostova',
      role: 'Staff Essayist',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCcP6EtsZh9NxhZ7mI3WhgjJ9L3vZVNoRiwF3yuvCVVD63t3QP2gIHR0QV_2preqYFq-isqEAV3OEAdCUNDoZC0TYZ98dwyUDT5JrgWg0yqxviyi_XyFGoDgF9xR4858oZSRsVTwzIAdSIiNucL84Lzbplk5vR9OmxD0mH2oqJ2WqA6tBpbxwZ38KZ1pLRYDi-q-Nzl8mOZF-kylPXr4vvNZzWL4vJUgZGZp5dkJXdR6yQnGlbowsAUuQ',
    },
    content: `## The Fragmented Mind

Attention is not a renewable fuel replenished by 30-second caffeine breaks. When modern workplace tooling fractures hours into three-minute intervals of notification management, the capability for higher-order intellectual synthesis quietly atrophies.

### The Myth of Ambient Multi-Tasking

Cognitive science has repeatedly demonstrated that attention switching carries an invisible switching tax. The residual cognitive load from an unopened Slack ping or unread pull request comment remains active in working memory for upwards of twenty minutes.

> "A quiet mind is not the absence of thought, but the deliberate sanctuary where thought can unfold without haste."

### Three Rituals for Cognitive Sanctuary
- **The Analog Morning**: No illuminated screens for the first ninety minutes after dawn.
- **Batch Processing Windows**: Check asynchronous communications precisely twice each day.
- **Physical Demarcation**: Associate physical desks exclusively with generative creation, never consumption.`,
  },
  {
    id: '3',
    slug: 'how-we-scaled-nextjs-app-router-for-10m-pageviews',
    title: 'How We Scaled Next.js App Router for 10M Pageviews',
    excerpt:
      'Real-world telemetry, selective revalidation recipes, and streaming edge caching lessons gathered from high-load editorial launches.',
    category: 'Technology',
    status: 'Published',
    publishedAt: 'Oct 22, 2026',
    dateTimestamp: 1792713600000,
    readTime: '11 min read',
    wordCount: 2420,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1bTATu2um2DcHa0i5MLPF4WuhHS0o_4lHoIWqRM4i4Rse5zIN1yuNUAXu_HbCyqZwaGj5Bu3emJ7qbXZMBBKTjdg-oZuz__1ju7RAhGdVcP_W8eqvbk4VybVedhtNGbNFPBcla3jk6W8-XM814OM4um9fCRcru3Kub7rPZt3-jwy9JX3G5nMofTfQbFCU1lJPqd0N5ACkg6Jgnq3TMNF62SA-smHTKHVaG4qMWCYQWElLqLcqugPoPw',
    imageAlt:
      'Abstract typographic visualization of server network paths and edge cache nodes.',
    author: {
      name: 'Marcus Vance',
      role: 'Principal Architect',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA-H2-6WHWLkq7zTiTtXkDQYrbIJAaDCwI9BVV7t3Yupp4uRBFv3qRi65lxaftgSGDskcoM2pAH-cEJvay_fzcd4FkXGMYBxJlfyhCoZ16tTAsXN9i2DCu6v6qs83o5yfhrIt4lK2B47u_n165fSYUVSyst4rjluQt6pEOcrmJYVzUghrriDMVpaytdNjwAmGpZPBGXgBSKvi5IJkUKgf8r6Kyc8Nmhi71KMrowb-lMOrF0_u6lV0YdKQ',
    },
    content: `## The Edge as First Principle

Editorial launches create asymmetric traffic spikes that reveal every latency bottleneck in seconds. When ten million readers arrive within a six-hour publication window, traditional origin servers fold under connection exhaustion.

### Streaming and Tiered Caching

By decoupling the critical semantic HTML shell from dynamic subscriber state via React Server Components (RSC) and HTTP streaming, time-to-first-byte (TTFB) remains under 45ms across global edge POPs.

\`\`\`typescript
export const revalidate = 3600; // Cache on edge for 1 hour

export async function generateStaticParams() {
  const articles = await fetchEditorialCatalog();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}
\`\`\`

> "Do not cache data because your database is slow; cache data because the speed of light is finite."`,
  },
  {
    id: '4',
    slug: 'building-better-software-starts-with-better-thinking',
    title: 'Building Better Software Starts With Better Thinking',
    excerpt:
      'Why problem formulation, clear prose specifications, and domain taxonomy outshine hasty code implementation every single time.',
    category: 'Software Engineering',
    status: 'Published',
    publishedAt: 'Oct 20, 2026',
    dateTimestamp: 1792540800000,
    readTime: '6 min read',
    wordCount: 1420,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBPn24SH6s_2mwMX8Jwrj2DFe5zDwdZp8ucVfkk4C-W2L9yBDi8RXwT969sxrcdhsUM4D6G7dKyBOvvnc_GIsGn0qh-06beJj1EaqwL2DzDOg12-bGDR0fcC9tNEAPMORGwp3A1XnVctI3VRYT7aUCiJh4_bkY0Nwmn7BHNm5ya5Ug3Z1plrF9L4363EjYJfCroFFJ3uFPV2ocBku5hkClXUMO0yld0cAjC0WAYOUcTg5O7kU5XrHO1AA',
    imageAlt:
      'Architectural model layout on drafting board with concrete columns, calipers, and blueprints.',
    author: {
      name: 'The Journal Editorial',
      role: 'Author',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBPQDz79MkY-Dsgkz1OPgZCJJHfTPMw904-tE-Gr_V0jtGE9ruHvQg0sz9USSi5TvABUgEgprAZXNXWHW9wh0ID-kJh_gRvmNAwuHruY_8oJO1u-h0O0YCLpU6QVBt0Fo_FwtU73Kbk0rJi1UaU5d40_39l0MzO4PyaCrOAVKl1N0baEEb2AN8yfoY5JfgK2Y6iOQ7jhy6pph8bc64rgkeKIfCaHHA2SwIkuBjDiWKgSNPCQ9L32S8sCQ',
    },
    featured: true,
    content: `Every morning before opening an editor or terminal, there is a temptation that modern engineering culture relentlessly reinforces: the urge to produce visible momentum. We measure velocity in pull requests merged, tickets resolved, and lines of typescript orchestrated into cloud services. Yet, the costliest disasters in distributed software rarely stem from typing speed; they stem from incomplete mental models of the problem domain.

When an engineer rushes to synthesize a solution before articulating the invariant constraints, they are not saving time—they are borrowing against future clarity at an extortionate interest rate. Deliberate thinking is neither procrastination nor academic indulgence; it is the single most potent optimization available in modern software delivery.

## 1. The Illusion of Immediate Momentum

Consider the common lifecycle of an ambitious feature request. The initial requirements document arrives with ambiguous boundaries. Rather than stepping back with a pad of paper to interrogate the edge behaviors, the modern reflex is to scaffold scaffolding immediately: initialize databases, design React contexts, and connect API clients.

> "Premature abstraction is the root of most architectural rot in modern web applications."
> — Notes on Software Discipline, 2026

By drafting abstractions early, the developer inadvertently constructs a psychological barrier against revision. When fundamental misunderstandings surface later in quality assurance or load trials, correcting them demands disassembling elaborate edifices rather than redrawing sketches on a whiteboard.

### Three diagnostic questions before the first keystroke:
* **What is the irreversible core?** Identify which database state transitions or API commitments cannot be easily undone later.
* **Can this be described in plain sentences?** If you cannot explain the reconciliation algorithm to a non-technical peer without technical jargon, the boundary is hazy.
* **What is the failure state when external services halt?** Systems must be architected for degradation rather than utopian availability.

\`\`\`typescript
// Define bounded contracts and immutable domain states before schema execution
type EditorialRevision = {
  readonly id: RevisionIdentifier;
  readonly documentId: string;
  readonly delta: OperationLog[];
  readonly author: StaffCredentials;
  readonly createdAt: Date;
};

export async function commitDeliberateThought(
  intent: SystemIntent,
  constraints: BoundaryMap
): Promise<SystemContract> {
  const validatedContext = await constraints.interrogate(intent);
  return validatedContext.freezeAsImmutableSpecification();
}
\`\`\`

## 2. Writing as an Architectural Tool

The highest leverage practice an engineering team can adopt is writing narrative Request For Comments (RFC) documents prior to implementation. When forced into sentences with subjects, verbs, and punctuation, logical vacuums become painfully obvious. Code excels at conveying instructions to a runtime; English prose excels at exposing self-deception in human understanding.

When we treat the drafting of a technical specification with the same editorial seriousness as an essay for publication, the resulting software requires fewer hotfixes, exhibits predictable performance traits, and can be maintained effortlessly by developers who were not present when the first line was committed.

In the end, our machines do not care how fast we typed the code into the editor. They only execute the decisions we arrived at when we sat in silence, stared at the blank page, and took the time to think.`,
  },
  {
    id: '5',
    slug: 'a-practical-primer-on-postgresql-rls-and-security',
    title: 'A Practical Primer on PostgreSQL RLS and Security',
    excerpt:
      'A comprehensive hands-on walkthrough implementing Row-Level Security policies with Supabase authentication and automated testing suites.',
    category: 'Tutorials',
    status: 'Published',
    publishedAt: 'Oct 17, 2026',
    dateTimestamp: 1792281600000,
    readTime: '9 min read',
    wordCount: 1980,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCW-X6b7dLrhJig1LoTzz4nVLGT0qvX4na5ZaUgHye_j9M4ZUxwefHF773Z0TAzQG8ANh18f_mTVHfk07bqBqu4ekF2LWAyPfnI2GBbll0nYauR1CtJNuZIBdTjWvdMv0JkI61hWtVDjGhdnOd9g25CFVHBFrtWa0YgIkFBBUvtlOtpS9f3Xst7zs_zYJwXu8YXieP3EeVuV_4RB1jY0IVT05kumyFJilmzUIzaciulZMzXiOtrg2uyGw',
    imageAlt:
      'Cryptographic padlock emblem on brushed titanium with etched relational database schemas.',
    author: {
      name: 'Sofia Chen',
      role: 'Database Security Specialist',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBPQDz79MkY-Dsgkz1OPgZCJJHfTPMw904-tE-Gr_V0jtGE9ruHvQg0sz9USSi5TvABUgEgprAZXNXWHW9wh0ID-kJh_gRvmNAwuHruY_8oJO1u-h0O0YCLpU6QVBt0Fo_FwtU73Kbk0rJi1UaU5d40_39l0MzO4PyaCrOAVKl1N0baEEb2AN8yfoY5JfgK2Y6iOQ7jhy6pph8bc64rgkeKIfCaHHA2SwIkuBjDiWKgSNPCQ9L32S8sCQ',
    },
    content: `## Defense-in-Depth at the Storage Layer

Application-layer authorization is notorious for silent failures. When an engineer omits an \`auth.uid == user_id\` check in an API endpoint, data exfiltration happens silently without database alerts.

### Enabling Row-Level Security

PostgreSQL Row-Level Security moves authorization boundaries directly into the database engine:

\`\`\`sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can edit their drafts"
ON articles
FOR UPDATE
USING (auth.uid() = author_id);
\`\`\`

By declaring access rules declaratively alongside schema definitions, your database enforces boundaries regardless of whether requests arrive from GraphQL, REST, or server actions.`,
  },
  {
    id: '6',
    slug: 'navigating-the-first-90-days-as-a-staff-engineer',
    title: 'Navigating the First 90 Days as a Staff Engineer',
    excerpt:
      'Balancing technical sponsorship, organizational empathy, and architectural leverage without burning out early in the senior track.',
    category: 'Career',
    status: 'Published',
    publishedAt: 'Oct 14, 2026',
    dateTimestamp: 1792022400000,
    readTime: '7 min read',
    wordCount: 1530,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBBBz3SebNce98AINV-8-aDSQF8DBktUMVoxfJ9knMV-CdZUKV89ZXwP6DEF842cr80qdNIMmcqyUlbMZR8HMRF6dEtui0-XXGxLQ_VTtVkXD1u_92WOo-svBhpP2EZH3Qh-gaFWXkdt_sQWAjkay9kVJUIaOWBiPRYj0hPstSuELEEKWi1-KIzdjigSTuRqtW-aZcCUEggIlAJ8iUwqJE99jPqLBk7x8VQfgr9vtdF203LlkgdkO2xAA',
    imageAlt:
      'Modern corporate atrium with birch wood beams, reading mezzanine, and focused conversations.',
    author: {
      name: 'David Aris',
      role: 'Staff Engineer',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA-H2-6WHWLkq7zTiTtXkDQYrbIJAaDCwI9BVV7t3Yupp4uRBFv3qRi65lxaftgSGDskcoM2pAH-cEJvay_fzcd4FkXGMYBxJlfyhCoZ16tTAsXN9i2DCu6v6qs83o5yfhrIt4lK2B47u_n165fSYUVSyst4rjluQt6pEOcrmJYVzUghrriDMVpaytdNjwAmGpZPBGXgBSKvi5IJkUKgf8r6Kyc8Nmhi71KMrowb-lMOrF0_u6lV0YdKQ',
    },
    content: `## The Ambiguity of Scope

At the staff level, your manager no longer hands you tickets with explicit acceptance criteria. Your mandate is to discover where engineering friction silently drains momentum and create systemic remedies.

### Listening Tours Over Instant Dictates

The common pitfall is attempting to re-architect everything in month one. The senior engineer who listens to five teams talk about their continuous integration pain gains vastly more political capital than the one who authors an unsolicited 40-page paradigm manifesto.`,
  },
  {
    id: '7',
    slug: 'the-lost-art-of-crafting-clean-interfaces',
    title: 'The Lost Art of Crafting Clean Interfaces',
    excerpt:
      'Rediscovering the enduring power of restraint, deliberate typography, and tactile negative space against trendy visual bloat.',
    category: 'Technology',
    status: 'Published',
    publishedAt: 'Oct 10, 2026',
    dateTimestamp: 1791676800000,
    readTime: '4 min read',
    wordCount: 980,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBxyeuvjb-wP-s3NP3f8Y_h3BMtB3SSS8s2KFetvDRRozCk03hkYELvcpL3nYE8dQA1KJElAAe7s5WLNY5388vk2ae56MIXqAUN6lZ7gR2VVMI-QWK-vJN4iCvzICBfUySc04vKaXvk-04hi8uYi45h36ufa5ouMvsGCKDBRlClMZUrBX2RzpClw9C2fn8DH1IMiLrcj9Ae3ngsJhRx60PFFfJEP4_QG6ZZZB2NhjGp0vgcBbPodo_pZA',
    imageAlt:
      'Swiss typography books on stone table with metal ruler and fine pencil in soft studio lighting.',
    author: {
      name: 'Elena Rostova',
      role: 'Design Director',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCcP6EtsZh9NxhZ7mI3WhgjJ9L3vZVNoRiwF3yuvCVVD63t3QP2gIHR0QV_2preqYFq-isqEAV3OEAdCUNDoZC0TYZ98dwyUDT5JrgWg0yqxviyi_XyFGoDgF9xR4858oZSRsVTwzIAdSIiNucL84Lzbplk5vR9OmxD0mH2oqJ2WqA6tBpbxwZ38KZ1pLRYDi-q-Nzl8mOZF-kylPXr4vvNZzWL4vJUgZGZp5dkJXdR6yQnGlbowsAUuQ',
    },
    content: `## The Tyranny of the Cluttered Viewport

When every pixel screams for attention, the user absorbs nothing. Modern web design often confuses density with utility, layering animations, badges, floating widgets, and modal interruptions until reading becomes an obstacle course.

True interface craftsmanship begins with subtraction: honoring negative space, setting balanced typographic proportions, and allowing ideas to breathe on a quiet ground.`,
  },
  {
    id: '8',
    slug: 'reflections-on-single-author-publishing',
    title: 'Reflections on Single-Author Publishing',
    excerpt:
      'A five-year post-mortem on running an independent digital periodical without advertising, sponsors, or algorithmic compromise.',
    category: 'Personal Notes',
    status: 'Published',
    publishedAt: 'Oct 05, 2026',
    dateTimestamp: 1791244800000,
    readTime: '5 min read',
    wordCount: 1250,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJCagpVeRiHvOyp65CXrjKCKw1lMyVyhLyHUdridCNVObHNw33A3w6UIG1_W1CXF_JVflHZneAdawKy31_jrdkUwjtsFdUILblySf5LhEzNeO5IfEByN64nkkzuyE1mTBxdoq11P2qq8Dv2pdXydyZHE_fHCae2HEIdw6HKYtPgeli4TTiqBQ_s3JiqPswhNM65SanAb2g5qiMtjKPJian_fU_9KRentm1PCEq52P6CgKOuCUx81sO2g',
    imageAlt:
      'Vintage letterpress printing machine in Parisian print shop with serif prints on drying racks.',
    author: {
      name: 'The Journal Editorial',
      role: 'Editor-in-Chief',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBPQDz79MkY-Dsgkz1OPgZCJJHfTPMw904-tE-Gr_V0jtGE9ruHvQg0sz9USSi5TvABUgEgprAZXNXWHW9wh0ID-kJh_gRvmNAwuHruY_8oJO1u-h0O0YCLpU6QVBt0Fo_FwtU73Kbk0rJi1UaU5d40_39l0MzO4PyaCrOAVKl1N0baEEb2AN8yfoY5JfgK2Y6iOQ7jhy6pph8bc64rgkeKIfCaHHA2SwIkuBjDiWKgSNPCQ9L32S8sCQ',
    },
    content: `## The Economics of Independence

Five years ago, we disconnected our publication from advertising networks, newsletter syndicates, and recommendation algorithms. The prevailing wisdom insisted this was commercial suicide.

Instead, something remarkable happened: readers who craved depth found in our deliberate cadence an oasis. Without clickbait incentives, every paragraph can be polished until it sings with clarity.`,
  },
  {
    id: '9',
    slug: 'the-principles-of-deliberate-software',
    title: 'The Principles of Deliberate Software',
    excerpt:
      'An inquiry into slow architecture, deliberate engineering decisions, and why human-readable interfaces outlast compiler optimizations.',
    category: 'Software Engineering',
    status: 'Draft',
    publishedAt: 'Oct 29, 2026',
    dateTimestamp: 1793318400000,
    readTime: '6 min read',
    wordCount: 1350,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDgYDvfXM5SJBmwblh-VQWhbY497x-qpU0FlDyGjx-lGONw7-FBXRMziDSlo7yMsVMPkuQFJN0tNTWpQBfO0weslz4WSNs65-eokgPqppLT-6QJYqDeQrOTJJmKXLRVgVwIpQz63jvEaWZswhY92jBm_XtcaMPng9mSrrxA8fyKCKMZXXehhkaU7NkNe_XHGjsbw9C3lY-j2K8r_DKSrN2Q2mlJ53SD22BPy6mhcSbEXUgpmjW3erkMyg',
    imageAlt: 'Monochrome concrete curves representing deliberate software engineering logic.',
    author: {
      name: 'The Journal Editorial',
      role: 'Managing Editor',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCcP6EtsZh9NxhZ7mI3WhgjJ9L3vZVNoRiwF3yuvCVVD63t3QP2gIHR0QV_2preqYFq-isqEAV3OEAdCUNDoZC0TYZ98dwyUDT5JrgWg0yqxviyi_XyFGoDgF9xR4858oZSRsVTwzIAdSIiNucL84Lzbplk5vR9OmxD0mH2oqJ2WqA6tBpbxwZ38KZ1pLRYDi-q-Nzl8mOZF-kylPXr4vvNZzWL4vJUgZGZp5dkJXdR6yQnGlbowsAUuQ',
    },
    content: `# The Principles of Deliberate Software

Software architecture begins not in the compiler, but in the clarity of human prose. When we rush to materialize database schemas before establishing our domain lexicon, we accumulate architectural friction that no amount of refactoring easily remedies.

## The Quiet Craft of Architecture

In a world addicted to instantaneous velocity, deliberate engineering appears deceptively inert. Yet durability is built through contemplative constraints:

> "Simplicity does not precede complexity, but follows it. The mark of mastery is not the accumulation of patterns, but their ruthless subtraction."

### Foundational Tenets
1. **Clarity of Lexicon:** Every entity in code must correspond to an unambiguous real-world concept.
2. **Defensive Surface:** Reduce public module boundaries to their mathematical minimum.
3. **Reversible Choices:** Postpone irreversible infrastructure decisions until empirical necessity mandates them.`,
  },
  {
    id: '10',
    slug: 'local-first-architectures-an-empirical-evaluation',
    title: 'Local-First Architectures: An Empirical Evaluation',
    excerpt:
      'CRDT implementations versus operational transformation across patchy mobile networks and distributed state machines.',
    category: 'Technology',
    status: 'Draft',
    publishedAt: 'Oct 24, 2026',
    dateTimestamp: 1792886400000,
    readTime: '7 min read',
    wordCount: 1540,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAIINqQ65SlKSdNlxB8DT69WQJM7eO4SwVhNjRIXIBC0oGUeAELpKWu7nbn2Pc3ssOL3-pARbv88rq1ACBHj2KKyMfrrPFVeUivPJsCM0MCXpZESssZPSV3_7fLsp3NA1Mof2oCUWO6TvSUyim0MQfsn9xmjOBTRmXwPq6MBLEVM4LmK6ACpVT-WFf72x9tgV1k864jyUskCY-hUsPONzTNjKNImXs92_9JZVf85N2WqhIZv25KQRbSbg',
    imageAlt: 'Lead letterpress blocks neatly arranged in a compositor tray.',
    author: {
      name: 'Marcus Vance',
      role: 'Principal Architect',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA-H2-6WHWLkq7zTiTtXkDQYrbIJAaDCwI9BVV7t3Yupp4uRBFv3qRi65lxaftgSGDskcoM2pAH-cEJvay_fzcd4FkXGMYBxJlfyhCoZ16tTAsXN9i2DCu6v6qs83o5yfhrIt4lK2B47u_n165fSYUVSyst4rjluQt6pEOcrmJYVzUghrriDMVpaytdNjwAmGpZPBGXgBSKvi5IJkUKgf8r6Kyc8Nmhi71KMrowb-lMOrF0_u6lV0YdKQ',
    },
    content: `## The Sovereign Client

For fifteen years, the prevailing web architecture has treated client hardware as thin, untrusted display tubes for remote server compute. Local-first computing restores agency to edge devices, guaranteeing instant writes and offline resilience.`,
  },
  {
    id: '11',
    slug: 'draft-the-typography-of-modern-programming-languages',
    title: 'Draft: The Typography of Modern Programming Languages',
    excerpt:
      'Analyzing ligature designs, glyph weights, and legibility thresholds across mono fonts for prolonged deep engineering sessions.',
    category: 'Tutorials',
    status: 'Draft',
    publishedAt: 'Oct 18, 2026',
    dateTimestamp: 1792368000000,
    readTime: '6 min read',
    wordCount: 1300,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA0RUED1RFhOTb55P262Y3x4jWnYe_17fp0rKAJG7zMGtMwrGNnAWfZrkvH2xVqUx1ZMQzLDDcFMhfYCa5S8OpTDpRAlGIr_cIPU29ctrWpuSiGcGzqIx2nlxXngm5DHdkKBuwXL8hwXKFOGlpnDkIHVSZZOQhqO7csyXevLOmhy-sFipLfIqcyc8-rlG4xrZKgYvlg4i46AXf12C_A0q20M3rrt2AtqUou-YYB6VF6io8mUKh1GTAqgg',
    imageAlt: 'Macro study of classic editorial typography specimens on heavyweight archival paper.',
    author: {
      name: 'Sofia Chen',
      role: 'Staff Designer',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBPQDz79MkY-Dsgkz1OPgZCJJHfTPMw904-tE-Gr_V0jtGE9ruHvQg0sz9USSi5TvABUgEgprAZXNXWHW9wh0ID-kJh_gRvmNAwuHruY_8oJO1u-h0O0YCLpU6QVBt0Fo_FwtU73Kbk0rJi1UaU5d40_39l0MzO4PyaCrOAVKl1N0baEEb2AN8yfoY5JfgK2Y6iOQ7jhy6pph8bc64rgkeKIfCaHHA2SwIkuBjDiWKgSNPCQ9L32S8sCQ',
    },
    content: `## Glyphs That Serve Thought

Typography in code is not aesthetic indulgence. Clear visual distinction between zero and capital O, or between \`1\`, \`l\`, and \`|\`, prevents countless compiler diagnostics before they occur.`,
  },
];
