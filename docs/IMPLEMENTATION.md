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

- [ ] Editor replaces the initial password at `/admin/account`.
- [x] Full browser CMS lifecycle test with the verified editor.
- [x] Final runtime dependency audit after patched PostCSS installation.
- [x] Final public/mobile browser acceptance run.
- [x] Vercel authenticated and initial deployment completed.
- [x] Release pushed to GitHub (`7adc212`) and deployed through the connected repository; Vercel reported READY and the GitHub deployment status succeeded.
- [x] Production domain/Auth redirects configured and public signup disabled.
- [ ] Backup retention/recovery policy selected by the project owner. Existing project inspection returned WAL archiving enabled, PITR disabled, and no available physical recovery points yet; no paid upgrade was enabled.
- [x] Live-domain publishing and sign-out verified.

Deployment and browser behavior have been verified independently of the build. The remaining owner decisions above must be handled before treating this as a fully hardened operational service.

Known tooling advisory: the development-only glob/micromatch chain uses braces 3.0.3, whose latest upstream release remains unpatched for a nested-pattern denial of service. These tools consume repository patterns during build/lint, not visitor input. The production dependency audit is clean; keep the build toolchain under review rather than accepting npm's suggested framework downgrade.
