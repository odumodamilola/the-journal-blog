# Editorial CMS and image operations

## Editing

New articles open in the visual editor. Select text to use bold, italic, underline, strike, headings, font family/size, text color, highlights, lists, alignment, links and code. Paste/drop an image or choose **Insert image** to open the library. Uploaded images require alternative text; captions are optional. Formatting is stored as validated JSON, not executable HTML. Only self-hosted font choices, bounded sizes and safe links are accepted.

Existing articles stay in Markdown and are not silently converted. They retain their content, permanent published URLs, and Markdown preview. **Convert to visual editor** offers an explicit, review-before-save conversion; the old saved Markdown is retained in revision history on save. Heading levels are normalized to H2/H3 under the article title. Unsupported HTML/advanced constructs and inline external images stop conversion rather than being discarded. **Insert uploaded image** appends a managed image in Markdown. An empty article can switch modes. Existing covers may still use the approved external hosts.

Saving is explicit. The editor warns before closing with unsaved changes; it does not claim background autosaving of published articles. Save a draft, then use the studio's private preview. Publishing and editing require the verified singleton administrator, and optimistic version checks reject stale edits. Previous saved versions appear below the article editor; loading one does not publish it. Saving a restored version creates a new revision. Revision history is private and is removed when its parent article is permanently deleted.

## Website and appearance

Open `/admin/site` (also linked from the studio). Edit identity, hero copy, featured story, hero image, footer, colors and self-hosted typography. Add/reorder/hide/remove latest-stories, image, text/image, gallery, quote and call-to-action sections. Up to 16 sections and six images per gallery are supported. `/admin/appearance` redirects to the theme controls.

**Save website draft** changes only the private draft. **Preview saved draft** renders that saved state in a protected page; it does not show unsaved editor changes. **Publish website** atomically updates the public document. Hidden sections are stripped from that public document, including their image references. Color validation requires 4.5:1 contrast for body/accent text and white-on-accent buttons. Individual article colors still require editorial judgment. Previous website versions can be loaded into the editor before saving/publishing.

## Images: quality and limits

- JPEG, PNG, WebP and AVIF still images, maximum 20 MiB and 60 megapixels. HEIC, SVG and animated formats are not accepted. Export them to a supported still format first.
- Originals upload directly to **private** Supabase Storage over resumable TUS with 6 MiB chunks and retry backoff. Large originals do not pass through Vercel's request-body limit.
- Server-side Sharp decodes actual pixels, normalizes orientation/sRGB and strips delivery metadata. The original remains unchanged and private. Master variants fit inside 3840 × 3840 without upscaling; “4K” describes resolution, not guaranteed lossless quality or an invented higher-resolution source.
- Responsive derivatives at 480/960/1920/2560 plus the master are produced when smaller than the source. AVIF quality 60 and WebP quality 86 favor visual detail; transparent PNGs use lossless encoding to preserve alpha/graphic edges. File savings depend on content and can be negative for very small or already efficient originals. The library reports original and WebP master byte sizes.
- Native encoding runs sequentially under a database lease, with one active job for this single-editor site. A timed-out job can be retried after five minutes. Failed jobs never become public; there are no untracked background tasks. The Vercel Node handler has a 300-second maximum duration.
- Private delivery uses short-lived signed URLs after RLS checks. Only ready derivatives referenced by published articles/visible website sections are publicly available; original files are never served by the public media route. Previously downloaded/publicly cached content cannot be recalled, and an issued signed URL may remain usable for its remaining 60 seconds after unpublishing.
- Trash is recoverable and does not destroy object bytes. In-use media cannot be trashed until removed from current articles and both website documents. Historical revisions may refer to trashed media; restore the image in the library before restoring such a revision. No automatic hard-delete job is enabled. The library is bounded at 2,000 assets; review storage usage and unsuccessful uploads periodically.

## Media backup and recovery

Database `.jbackup` files do **not** contain Storage bytes. Run `npm run backup:media` as well as `npm run backup:create` before a publishing session. The media command opens a temporary normal-login browser; enter the password directly on the site. No service-role key is retrieved. It revokes only that temporary session afterward. Backups need the separate ignored `.backup-key` from the approved database backup workflow.

Media originals and all tracked derivatives (including trash) are downloaded using the editor's own RLS permissions. Each object and the private manifest are AES-256-GCM encrypted before disk writes. Each object is decrypted in memory and hash-checked before the archive is marked complete. Completed archives contain an `inventory.json`; partially completed directories must not be treated as recovery points. No plaintext image/session/password is committed or uploaded. Unfinished uploads without an original can appear in the manifest without an object; a missing ready image fails the backup.

Keep a matching database snapshot and media archive while publishing is paused; these separate exports are not a cross-service atomic snapshot. Retain 30 days of complete pairs and store an encrypted copy separately from this computer, with the recovery key in a password manager. Media archives are not automatically pruned or scheduled. These operations are not managed PITR or an offsite backup service.

For disaster recovery into a separate replacement project: restore the database and explicit application grants, recreate the private `journal-media` bucket and the two policies using `supabase/recovery/storage.sql`, decrypt verified media objects only in a trusted recovery process, and upload them to the **exact manifest paths** after restoring asset rows/administrator membership. Restore bytes using the Storage API, not direct SQL writes to `storage.objects`. Restore project Auth URLs and Vercel environment settings, then rerun the SQL permission tests and browser flow. Do not reset a live project to test recovery. `verifyMediaBackup` in `scripts/backup-media.mjs` checks all encrypted objects without writing plaintext or touching any remote project.

## Verification

`npm test` covers content/link validation, website schema/contrast and real Sharp encoding (4K cap, aspect ratio, metadata stripping, transparency and no upscaling). `supabase/tests/cms-permissions.sql` rolls back fixtures while checking image privacy, hidden sections, version conflicts, revisions, in-use protection and non-admin isolation. `npm run test:admin -- --backup-media tests/e2e/cms.spec.ts` uses a temporary normal owner session for the rich/media/website flow, a verified encrypted media backup, and the legacy publishing lifecycle. Public CI does not receive privileged credentials, so authenticated tests are explicitly skipped there rather than represented as passed.
