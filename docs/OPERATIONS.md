# Production operations

## Access and release checks

Only the verified singleton editor may manage content. Public signups are disabled; RLS checks membership and ownership independently of the UI. The initial password has been replaced, and its rejection was verified on 23 October 2026. Do not share passwords in chat or commit sessions/keys.

Push to `main` to deploy through GitHub → Vercel. CI checks lint, types, unit tests, production build, production dependency advisories, public browser behavior and WCAG-tagged accessibility checks. The public Supabase publishable key in CI is intentionally public; no privileged key or editor credential is supplied to pull-request jobs. Authenticated tests require an explicit local editor login using `npm run test:admin`.

## Backup policy

For this low-volume, single-editor release, run `npm run backup:create` daily and **before a publishing/editing session or destructive operation**. Keep 30 days of successful encrypted snapshots. This is an operator-run policy, not an unattended backup service: RPO is the time of the latest successful snapshot, not guaranteed 24-hour coverage. The machine needs network access, a logged-in Supabase CLI profile named `thejournal`, and Postgres tools of at least the server's major version. On this Windows machine:

```powershell
$env:JOURNAL_PG_BIN = 'C:/Program Files/PostgreSQL/18/bin'
npm run backup:create
npm run backup:verify
```

The export uses a temporary CLI database login and the role from Supabase's documented dump plan; it changes no remote grants. `pg_dump` obtains a consistent database snapshot. The archive contains the `public` and `auth` schemas, including sensitive Auth data. It is encrypted with AES-256-GCM before being written to `.backups`. The authenticated encryption rejects altered archives and incorrect keys. A SHA-256 sidecar supports archive inventory checks.

The generated `.backup-key` is a separate, ignored local file. **Move a copy to your password manager and retain an encrypted backup copy on a separate trusted device/storage location.** A key beside the backup is convenient for a local restore drill but does not protect against compromise/loss of this computer. Losing the key makes recovery impossible. Neither backups, keys, test sessions nor audit reports are committed or sent to Vercel. Windows file permissions are inherited from the current user's workspace; restrict access to this directory appropriately.

The database backup is not a full Supabase-project clone: it does not contain Storage object bytes, external cover images, project settings, Edge Functions or custom roles/passwords. The upgraded CMS now supports managed uploads: also run `npm run backup:media` using the normal-owner session workflow in [EDITORIAL-CMS.md](EDITORIAL-CMS.md). Keep the Git repository/migrations, Auth settings in `supabase/config.toml`, and Vercel configuration alongside the recovery plan. No paid backup/PITR upgrade has been enabled. For unattended, cloud-independent daily backups, provision a trusted backup destination and scoped database credential; do not copy a broad personal CLI token into CI.

## Isolated recovery verification

`npm run backup:verify` decrypts the latest archive in memory and restores it into a **new password-protected local Postgres cluster bound to 127.0.0.1**. It never accepts a remote restore target, never resets production, checks restored membership/RLS, reapplies explicit API grants, and runs `supabase/tests/permissions.sql`. Fixtures roll back. It stops the cluster and removes only its newly generated test directory; cleanup is skipped if shutdown cannot be confirmed. A non-sensitive result is written to `.audit-reports/recovery-drill.json`.

Perform this drill monthly and after schema changes. For an actual outage:

1. Preserve the damaged project; stop publishing and record the last good backup.
2. Create a separate replacement Supabase project and obtain its trusted database connection. Re-enable required extensions and recreate the Supabase roles through the managed platform.
3. Decrypt the archive using the retained recovery key on a trusted machine. Restore `public` and `auth` into the replacement project's **empty application tables**, in one transaction, with a reviewed Supabase migration/restore procedure. The local drill is not an automatic production restore command.
4. Run `supabase/recovery/application-grants.sql` to reapply app API grants and revoke public execution of internal trigger functions. Verify both tables retain RLS and rerun permission tests. Restore managed Auth data into the platform's matching Auth schema using Supabase's documented restore procedure; platform roles/ownership/ACLs must remain managed correctly. The local drill verifies database data and app isolation, not a running replacement Supabase Auth service. Restore matching migration history or repair it deliberately; do not blindly rerun initial table-creation migrations over restored tables.
5. Restore Auth Site URL, redirect allowlist, signup restrictions, email/SMTP and password policies; rotate/revoke restored sessions and reauthenticate the owner. Update Vercel's project URL/publishable key, redeploy, and run live smoke tests before switching readers.

For a code-only regression, roll back the Vercel deployment. Database changes need a separate reviewed recovery. Target recovery time for this small release is one business day with the owner and platform access available; the local drill measures only database restoration, not a complete cloud failover.

## Accessibility and performance

Run `npm run test:a11y` for automated WCAG 2/2.1/2.2 A/AA-tagged checks, skip-link and keyboard-login behavior, and 320/768/1440 px overflow checks. The full CMS test additionally audits the dashboard, account page, editor, validation errors, private preview, public article and deletion dialog. Automation is not a certification or a replacement for assistive-technology/user testing.

Run `npm run test:performance` against an already running production build, or set `JOURNAL_TEST_BASE_URL` to the live domain. CI runs the same mobile budget on an isolated runner with installed Chromium, after browser tests finish; reports are attached to the workflow. Lighthouse uses simulated mobile conditions and writes detailed reports to `.audit-reports`. Budgets: performance ≥85, accessibility 100, CLS ≤0.1, and total blocking time ≤300 ms. Keep `/login` noindex intentionally; its SEO score is not a public-article quality gate. Performance scores vary with hardware/network; compare repeated runs rather than treating a single lab score as a field Core Web Vitals guarantee. A failing local/live run remains a diagnostic finding even when CI passes; do not discard it or change budgets simply to make a report green.

`npm run test:load` runs a bounded read-only test: 50 requests, five concurrent readers, no writes, 15-second timeout, zero HTTP failures and p95 ≤3 seconds. Environment overrides are capped at ten concurrent readers and 200 requests. This is a small-launch smoke test, **not a stress/capacity certification**. Schedule a larger staged test before significant traffic growth.

## Monitoring and dependencies

Inspect Vercel runtime errors and Supabase advisors/logs after releases. Maintain Auth rate limits. Supabase's paid leaked-password protection remains disabled; no paid upgrade was authorized. The runtime dependency audit is clean. The dev-only braces glob-pattern advisory remains upstream-unpatched and is not reachable through visitor input; CSS selector parsing uses the patched override. Monitor upstream fixes and do not accept an automatic framework downgrade.
