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

Known tooling advisory: the development-only glob/micromatch chain uses braces 3.0.3, whose latest upstream release remains unpatched for a nested-pattern denial of service. These tools consume repository patterns during build/lint, not visitor input. The production dependency audit is clean; keep the build toolchain under review rather than accepting npm's suggested framework downgrade.
