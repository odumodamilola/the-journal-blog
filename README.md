# The Journal

A single-author publishing platform built with Next.js 15 App Router, React, TypeScript, Tailwind CSS, Supabase Auth and PostgreSQL.

Live site: https://the-journal-blog-three.vercel.app · Editorial studio: https://the-journal-blog-three.vercel.app/login

Source: https://github.com/odumodamilola/the-journal-blog. Pushes to `main` build and deploy automatically through the connected Vercel project.

## Run locally

Use Node.js 22 or newer.

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and fill in your project URL, publishable key, canonical site URL and author name. Never put a service-role key in a `NEXT_PUBLIC_` variable.
3. Apply migrations in `supabase/migrations` in order to a new Supabase project. The connected `thejournal` project already has these migrations.
4. Run `npm run dev` and open `http://localhost:3000`.

## Administrator provisioning

Register or create the intended editor in Supabase Auth and verify the email. Use a unique password. From the trusted SQL Editor, designate that exact user's UUID:

```sql
insert into public.admin_users (user_id)
select id from auth.users
where id = 'YOUR_VERIFIED_USER_UUID' and email_confirmed_at is not null;
```

The singleton primary key permits one administrator only. Ordinary authenticated users cannot add themselves, read drafts, or write posts. The app checks the verified server session and membership on every CMS route and mutation; PostgreSQL enforces the same access rules with RLS. Public requests use a separate client without session cookies, including when the reader is an administrator.

The designated administrator has been registered, email verification is complete, and the owner has replaced the initial password. Sign in at `/login`; passwords are managed at `/admin/account`. There is no authentication bypass or built-in demo account.

## Publishing

- `/admin`: Search and filter draft/published posts, inspect counts, and manage content.
- `/admin/posts/new`: Write Markdown, generate a slug from the title, add a description, category and optional cover.
- Save draft to keep work private. Empty draft bodies are permitted; published articles require a title and body.
- Preview Markdown before saving, or open a private preview of the last saved version from the studio.
- Publish to expose the article publicly. A published URL stays permanent even after unpublishing.
- Saving a published post updates it immediately. Choose **Unpublish to draft** to remove it from public routes.
- Version checks prevent a stale editor or delete dialog overwriting a newer revision. Copy unsaved text before reloading after a conflict.
- Deletion requires typing `DELETE` and cannot be undone in the CMS. Arrange database backups before launch.

Cover URLs are limited to configured HTTPS hosts and require descriptive alternative text. Markdown HTML is disabled; images are optimized through Next.js. Browser storage is not used as the source of truth for authentication or content. Original prototype components remain in the repository for design reference and are not mounted by the production routes.

## Verification

```sh
npm run check
npm run test:e2e
```

`check` runs lint, TypeScript, unit tests, and the production build. ESLint includes retained prototype components, which may emit image/unused-code warnings; production builds do not skip lint or type errors.

Browser tests use an isolated Chrome profile on Windows (Chromium on other systems) and port 3107. Tests check public navigation, search/category filters, metadata routes, mobile overflow and anonymous access restrictions. To run the full CMS workflow after the editor is verified, supply `JOURNAL_TEST_EMAIL` and `JOURNAL_TEST_PASSWORD` in the test process environment. Credentials are never committed. The test creates an article named `CMS acceptance story`, verifies draft privacy/publish/edit/unpublish/delete, and deletes that test article on success. Inspect any leftover test article if the test fails midway.

Run `supabase/tests/permissions.sql` as postgres through SQL Editor or MCP. It verifies administrator CRUD, publication constraints, immutable published URLs, version increments, anonymous draft isolation, non-admin write rejection and privilege escalation rejection. Fixtures are rolled back. Do not remove the transaction/rollback statements.

## Vercel deployment

1. Import the GitHub repository into Vercel and select Next.js. Use `npm ci`, `npm run build`, and the default output settings.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` (the actual production domain, without a trailing slash), and `NEXT_PUBLIC_AUTHOR_NAME`.
3. Add the production URL to Supabase Auth Site URL and the `/login` redirect allowlist. Use separate projects or restrict access for preview deployments that share the production database.
4. Verify the editor's email and set a unique password. Disable public sign-ups in Supabase Auth settings. Configure Auth rate limits and CAPTCHA if needed for an internet-facing admin login.
5. Deploy and test login/sign-out, draft privacy, publishing, editing and deletion on the production domain. Check page titles, sharing images, sitemap and robots output.

GitHub Actions runs lint, types, unit tests and build on pushes to `main` and pull requests. Vercel can deploy automatically from the connected repository after these checks pass. The app needs no privileged server key.

## Operations and recovery

See [the production operations runbook](docs/OPERATIONS.md) for encrypted backups, isolated restore drills, retention, recovery steps, accessibility/performance budgets, and known platform limitations. `npm run backup:create` creates an ignored local encrypted archive; `npm run backup:verify` restores only to a temporary local database. Save the recovery key separately in your password manager. `npm run test:admin` opens a normal editor login window for authenticated browser/a11y verification without sharing a password or retrieving a service-role key.

Monitor Vercel runtime failures and Supabase Auth/database logs. Review Supabase security advisors after schema changes. Do not log passwords, cookies or access tokens. Keep `npm ci` reproducible and review dependency advisories before updates; the PostCSS override pins the patched version for Next.js as well as the root dependency.

Enable backups appropriate to your Supabase plan, document retention, and test restoration to a separate project. For a bad app release, roll back the Vercel deployment. Database migrations require separate review and do not roll back with the frontend. Published slugs are permanent, and deleted content requires a backup restore if recovery is needed.

Comments, likes, bookmarks, subscriptions, multi-author workflows, media uploads and advanced rich-text editing are intentionally outside this release.
