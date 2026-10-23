# The Journal: editorial redesign release report

## 1. Audit summary

The original public UI repeated a narrow, uniform card layout, had limited discovery/navigation, disconnected login/error styling and no About or working Contact page. The inventory was 51 published articles: one Technology article and 50 World News briefs. Four original categories currently have no posts. Generic cover photographs were repeated across unrelated subjects.

Preserved Next.js 15 App Router, Supabase, all slugs, real published/draft states, authenticated CRUD, rich text, private managed-media delivery, website section configuration and the single-administrator authorization model. No replacement application or demo content.

## 2. Reference study and transformation

Newsfolk's homepage, article, author listing and Contact pages were inspected in the browser, including a wide desktop viewport and a narrower viewport. Observed principles: a dominant lead image, complementary compact stories, alternating editorial scales, category discovery, article sidebars and a substantial footer. Some mobile reference captures were desktop-scaled; hover/scroll timing and every reference breakpoint were not verified and are not claimed.

Adapted hierarchy and composition, not its brand or content. Excluded orange colors, copied photography/headlines, auto-rotating news tickers, invented rankings, advertising, podcasts, financial template copy and fake staff/contact details. The implementation remains an ideas-and-technology journal with World News as an existing category, not a new news-only brand.

Framer setup was inspected because of the reference workflow; this is a Next.js implementation, not a Framer project.

## 3. Design system

- Forest #207255, deep evergreen #17573f, ink #18231d, warm ivory #f8f7f4, white and sage #e8efe9. Existing explicitly configured CMS colors/fonts remain honored.
- Newsreader display/editorial type and Inter utility/body text; fluid clamp-based scale, deliberate italic emphasis and balanced headings.
- 1,360px desktop container, 720px long-form reading column, responsive spacing rhythm and image crops.
- Shared public shell/header/footer, lead/standard/wide/compact story treatments, category artwork, form panels and loading/error/empty states.
- Selective sticky-header glass with solid fallback, visible focus states and 44px icon controls. No added tracking or animation dependency.

## 4. Pages and functionality

| Route | Implementation |
| --- | --- |
| / | Real Technology-led feature by default, complementary stories, actual latest posts, distinct green feature, real category counts and all existing CMS section types/order. Configured hero media appears separately rather than replacing an article's canonical cover. |
| /blog | Search, original categories, stable nine-per-page archive, wide first card, meaningful empty results and pagination. |
| /blog?category=… | Category description, original subject-specific vector artwork, selected filter and truthful published count. No fabricated stories in empty categories. |
| /blog/[slug] | Canonical cover, date/byline/reading estimate, readable rich/Markdown content, optional long-post contents navigation, reading progress, copy/native share, back-to-top and actual same-category related posts. |
| /about | Publication purpose and principles, configured brand copy and original illustration; no invented biography or team. |
| /contact | Accessible, validated form backed by a private Supabase inbox. No invented public address or email-delivery claim. |
| /login | Shared editorial design; existing authentication and authenticated redirect retained; noindex. |
| 404 / error / loading | Shared brand/navigation and useful recovery, no external database dependency for the error shell. |
| /admin/messages | Protected, paginated inbox and an explicit mailto reply action; no automatic email sending. |

No pre-existing donation, legal or author-profile route was discovered. No payment system, legal claims, staff profile or newsletter was fabricated.

## 5. Images and asset report

38 topic-specific licensed replacements are recorded with article slug, category, canonical source URL, photographer, photo page, license, alt text, original dimensions and verification timestamp in [editorial-assets.json](../content/editorial-assets.json). Retained news-photo sources are in [the earlier photo manifest](../content/news/2026-10-23-photos.json). The original Technology cover was retained.

Assignments include city/legislature architecture for geographically specific legal/political stories, a real Abu Simbel temple photograph, a mining illustration, different computing hardware, a financial chart, Canadian shipping, a Romanian port, healthcare space, sun protection, a coffee/caffeine illustration and astronomical imagery. Sensitive stories do not identify unrelated private individuals as alleged offenders or patients. Captions distinguish archive illustrations from photographs of the reported event.

All **51 published articles now have 51 distinct canonical cover image paths**. The 38 replacements and only their image-credit body sections were applied atomically with optimistic version guards. Existing revisions preserve prior versions. Same canonical cover on home/archive/detail/metadata; no random assignment. The content update is already live independently of the redesign branch.

All **51 cover URLs returned HTTP 200 and decoded successfully**, checked 23 October 2026. Verification does not guarantee future third-party uptime. Stable image boxes and original category-art fallback handle failures.

Next/Image supplies responsive source sets and priority hints. An approved-host Unsplash loader uses its own responsive CDN encoding directly, avoiding a second lossy server recompression/download of large masters for thumbnails. Other approved sources keep the standard optimizer. Existing managed uploads retain their AVIF/WebP pipeline and private publication checks. No downloads from the reference site and no synthetic news-event photography.

Original code-native category artwork has six distinct motifs for Technology, Software Engineering, Tutorials, Career, Personal Notes and World News. It also supplies the About/Contact compositions and honest empty-category art.

## 6. Motion

Existing Motion for React, LazyMotion and asynchronously loaded DOM animation features support selected, once-only, short 12px section reveals. Server-rendered content remains visible before JavaScript. CSS handles restrained image zoom, link-arrow movement, focus/hover feedback, dialog entrance and header surface changes. Progress updates are requestAnimationFrame-throttled; scroll listeners are passive and cleaned up.

Reduced-motion CSS disables nonessential animation, transforms and smooth scrolling. No scroll-jacking, autoplay carousel, per-paragraph animation or forced App Router page-transition wrapper.

## 7. SEO and performance

Metadata API provides canonical URLs, page-specific titles/descriptions, article OG/Twitter images, dates and source-derived article text. Added escaped WebSite, BlogPosting, publisher and BreadcrumbList JSON-LD. Sitemap includes About/Contact and published posts only. Search/private/auth pages remain excluded from indexing. Markdown body H1 becomes H2 to maintain one page H1.

Next.js 15 blocking metadata is configured so descriptions are emitted in the HTML head for lightweight crawlers and link previews, not streamed into the body. No hidden content or disabled type checking.

The first local simulated-mobile audit (before the final CDN loading and accessibility fixes) measured home 81, archive 85 and login 87 performance; accessibility 100 on those routes; CLS near zero. It exposed missing head descriptions and link-label mismatches, which were corrected. These earlier measurements are diagnostic, not the final performance claim. The final audit result is recorded below when available.

No real-user INP or 75th-percentile Core Web Vitals guarantee is asserted. Login is intentionally noindex, so its Lighthouse SEO score should not be treated as a public indexing target.

## 8. Functional and security verification

Implemented automated checks for 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px: no horizontal overflow, one H1, keyboard dialogs/focus return, genuine search, original/empty categories, article reading, Contact validation, reduced motion and mobile/desktop axe WCAG checks.

Existing acceptance coverage checks all 50 news briefs and their source/timing/license/canonical sections, six archive pages and private route/API rejection. Authenticated CRUD/media tests skip without an explicitly supplied test session; no password was retrieved or reused.

The additive Contact migration enables RLS. Guests have only bounded column-level INSERT permission; they cannot read, update or delete inbox messages. Only the designated administrator can SELECT. A non-public trigger normalizes content and enforces three messages per email per hour and a global 100/day ceiling. HTTP handler enforces same origin, JSON, a 24KB body cap, server/client validation and a honeypot. No service-role key is used.

Verified guest insert/admin-only read/nonadmin invisibility and no guest read/update/delete. A transactional test accepted three messages and rejected the fourth, then rolled back. A real local endpoint submission returned 201; its synthetic QA record was removed, and zero QA records remain. No reader's message was deleted.

The global daily limit is a deliberate abuse/storage ceiling, not a full CAPTCHA or distributed anti-bot service. Contact stores messages only; reply delivery requires the editor's own email client. Retention/deletion policy should be set by the operator.

## 9. Build validation and release

TypeScript and unit tests passed during implementation. ESLint has no errors; 16 pre-existing warnings remain in unused/legacy components. Production builds passed with all new routes. Font downloads require ordinary network access; the sandbox-only DNS failure was not an application compile error.

The redesigned UI is on codex/editorial-public-redesign. Production UI has not been promoted by this work. The contact migration and canonical cover updates have already been applied to the existing Supabase project. Keep the migration in source control for other environments.

## 10. Remaining items / release evidence

Final test and performance rerun: pending at the time of this report update.

- Authenticated CMS visual/CRUD acceptance requires an administrator test session; never claim those skipped tests passed.
- Existing Supabase advisory: leaked-password protection is disabled. No Auth policy or password was changed by this redesign.
- External Supabase/image connections intermittently timed out during one full local test run; two later read-only acceptance checks hit error boundaries. A separate desktop 404 contrast issue and an ambiguous test search selector were corrected. Successful reruns must be distinguished from that initial run.
- The final production UI release needs preview review and promotion. No claim that this branch is already the live UI.
