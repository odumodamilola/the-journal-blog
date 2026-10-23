# Release evidence

Scope: one administrator, private Markdown drafts, public published posts, server-rendered routes, Supabase Auth, PostgreSQL RLS.

## Implemented

- Cookie-based Supabase login with verified user and database membership checks.
- Protected admin layout, create/edit actions, account password change, private saved previews.
- Structured field validation with retained form values, pending states, unique slugs, publication constraints.
- Optimistic version checks on update/delete and typed permanent-deletion confirmation.
- Server-rendered public routes, search, category filters, pagination, responsive cards, optimized covers.
- Article metadata, canonical URLs, sitemap, robots, Markdown HTML restrictions, semantic navigation and error/loading states.
- Database-generated types, migrations, permission test transaction, unit/browser tests and CI.

## Evidence collected in this session

- Codex Supabase MCP registered for `tgfhjjiojftvidofzxji`; OAuth login completed; live project URL verified through the new MCP connection.
- Existing secure-blog migration inspected in the live database.
- Internal event-trigger execution permission restricted in a versioned migration; database security findings resolved. Auth still reports disabled leaked-password protection, a Pro-plan feature; no paid upgrade was enabled.
- Live SQL permission/lifecycle test passed with all fixtures rolled back.
- Type checking and all ten unit tests passed; production build passed with lint enabled.
- Browser access-control checks passed for every anonymous admin route.
- Real editor registration, email verification and singleton membership confirmed.
- All three browser acceptance tests passed against the live production domain, including the authenticated save/preview/publish/edit/unpublish/delete/sign-out workflow.
- Extended acceptance coverage verifies retained categories/excerpts after validation, optimized cover-image loading, matching search/category results, canonical URLs and Open Graph metadata. It exposed a React form-reset issue; the editor now submits controlled state without resetting fields on validation errors, and all three tests passed against the corrected production build.
- Runtime dependency audit returned zero vulnerabilities after the patched PostCSS override.
- Vercel CLI updated to 65.1.0 and authenticated as `odumodamilola`. Official Vercel plugin installed in user scope; official shared MCP registered, OAuth completed, and team consent verified by authenticated project/team inspection.
- Vercel project created and linked to `odumodamilola/the-journal-blog`; production domain: `https://the-journal-blog-three.vercel.app`. Public HTTP response verified as 200; GitHub CI and production deployments succeeded.
- Supabase production Auth URL and exact login redirects configured; public signups disabled; minimum new password length increased to 12 while retaining existing MFA and email-verification settings.

## Release gates still to verify

- [x] Editor replaced the initial password at `/admin/account`; the old temporary password was independently rejected.
- [x] Full browser CMS lifecycle test with the verified editor.
- [x] Final runtime dependency audit after patched PostCSS installation.
- [x] Final public/mobile browser acceptance run.
- [x] Vercel authenticated and initial deployment completed.
- [x] Release pushed to GitHub (`7adc212`) and deployed through the connected repository; Vercel reported READY and the GitHub deployment status succeeded.
- [x] Production domain/Auth redirects configured and public signup disabled.
- [x] Owner-approved encrypted local backup of `public` and `auth` created; isolated password-protected Postgres restore and restored permission/lifecycle tests passed. Operator-run retention/recovery policy and limitations documented in `docs/OPERATIONS.md`; unattended scheduling and a separate-device copy are not claimed.
- [x] Live-domain publishing and sign-out verified.

Deployment and browser behavior have been verified independently of the build. Follow the operating policy below; a one-time backup is not an unattended recovery service.

## Hardening follow-up — 23 October 2026

- Added AES-256-GCM encrypted logical database backups, 30-day retention, tamper/wrong-key tests and an isolated recovery drill. The drill restored the real approved archive, retained RLS and singleton membership, and passed all SQL permission/lifecycle assertions. No restore touched production; temporary databases were stopped and removed.
- Verified the owner changed the administrator password and the old temporary credential no longer authenticates.
- Added WCAG-tagged axe scans, keyboard/skip-link/error checks and 320/768/1440px overflow regression checks. Fixed the missing skip-link target on the 404 page. All five public accessibility tests passed against the corrected production build.
- Replaced render-blocking third-party font CSS with Next.js self-hosted fonts and added the missing site icon. Automated reports remain ignored because authenticated browser artifacts can contain private sessions/content.
- Bounded live load smoke test: 50 read-only requests, concurrency 5, zero failures, p95 1113ms. This does not establish an enterprise traffic-capacity SLA.
- Expanded CI to run production dependency auditing and anonymous browser/accessibility checks. Authenticated tests require an explicit editor session; no privileged credential is placed in CI.
- Patched the development CSS selector-parser advisory through a pinned override; production dependency audit remains clean.
- CI run `39872910831` passed the unchanged simulated-mobile budgets: performance 94/95/96 for home/archive/login, accessibility 100 each, CLS 0 each, and total blocking time 108/75/142ms. Local and live audits on the development machine had slower, variable results (including budget failures); those results are diagnostic findings, not discarded or represented as universal field performance guarantees.
- Seven final live anonymous/public/accessibility checks passed. The expanded authenticated CMS accessibility pass is awaiting an owner sign-in through the temporary normal-login test browser. The prior release's authenticated publishing lifecycle passed, but that is not substituted for the new audit.

Known tooling advisory: the development-only glob/micromatch chain uses braces 3.0.3, whose latest upstream release remains unpatched for a nested-pattern denial of service. These tools consume repository patterns during build/lint, not visitor input. The production dependency audit is clean; keep the build toolchain under review rather than accepting npm's suggested framework downgrade.

## Editorial redesign and media CMS — 23 October 2026

Implemented a new responsive editorial landing page and public shell, validated rich-text JSON with dual Markdown rendering and explicit conversion, private media uploads over TUS, bounded Sharp processing, responsive AVIF/WebP delivery, in-use-safe recoverable trash, article revisions, and draft/published website/theme controls with reorderable sections and revision history. Hidden homepage sections and their image references are removed from the public document. Existing articles and published slugs were preserved.

The three additive CMS migrations were tested on the approved encrypted backup in an isolated local PostgreSQL cluster and applied to the hosted project. Hosted tests revealed default Supabase table grants; a follow-up least-privilege migration revoked those broad grants. Hosted and local transactional CMS permission tests now pass, including hidden-section privacy, non-admin isolation, optimistic website versions and in-use image protection. Local migration filenames were aligned with the actual hosted migration history; no applied database history was rewritten.

Nineteen unit tests pass, including real Sharp 4K/no-upscale/metadata/transparency checks, explicit Markdown conversion and same-origin protection using the actual HTTP Host rather than Next's internal URL. Production builds and TypeScript checks pass. Public WCAG-tagged axe checks, keyboard/skip-link tests and 320/768/1440px overflow checks pass; desktop/mobile screenshots were visually inspected. Runtime dependency auditing reports zero known vulnerabilities. Existing prototype-only lint warnings remain outside mounted production routes.

The new normal-session acceptance flow covers rich formatting, a 4096-pixel original upload, 3840-pixel delivery, draft privacy, publication, in-use image protection, website draft preview, and encrypted media backup integrity. **This authenticated flow has not yet run: it is awaiting an owner sign-in.** The new media backup implementation therefore must not be described as an already verified live image backup. The older database archive and restore drill are verified; a new CLI database export currently cannot initialize its temporary role (management endpoint returns HTTP 403). No privileged key was obtained to bypass that restriction. Owner login/CLI access must be resolved before claiming all operational checks complete.

See [EDITORIAL-CMS.md](EDITORIAL-CMS.md) for controls, recovery and limits. No paid plan, scheduled backup service, automatic hard-deletion job, or offsite backup destination was provisioned.
