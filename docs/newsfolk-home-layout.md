# The Journal — reference-style homepage

Reference: https://newsfolk.framer.media/ (measured in a browser at desktop and mobile widths).

This is an implementation in the existing Next.js app, not a Framer migration. It follows the reference's layout with The Journal's Newsreader/Inter typography, forest-green/ivory palette, existing CMS and real published content.

## Layout correspondence

- Centered large masthead with utility navigation and pill search; six boxed icon-led category tabs; a compact headline strip.
- Full-width photographic lead, folded Highlights ribbon and four story thumbnails in a dark strip. Desktop stage is 674px high; mobile stage is 370px, with four compact thumbnail controls.
- Three aligned editorial columns: six recent stories, a lead plus three text stories, and five numbered selected reads.
- Wide Journal brand banner, then four horizontal subject desks with lead imagery, headline/copy and two related or subject-discovery links.
- A two-by-two archive grid with a Journal/sidebar column, followed by a dark multi-column footer and contact card.
- Mobile navigation, stacked columns/desks, responsive images, keyboard interaction and reduced-motion support.

The reference's newsletter, podcasts, social links and advertisements are not fabricated. Those positions contain working Journal archive, subject, About and Contact links. Selected reads are a deterministic reading list, not an invented popularity ranking. Empty subjects are honestly labeled; if their published posts are outside the bounded homepage feed, readers are directed to the complete archive.

## CMS and data

Existing featured-post selection, headline/emphasis, brand typography/colors, section visibility/order, section text, managed hero image, image/split/gallery sections and CTA links remain supported. The CMS preview now uses the same published-only homepage feed and category counts as the public homepage, while its draft configuration still requires the administrator.

Article images retain their canonical association. No stories, media records, schema, RLS, Auth settings or database contents were changed. Only minimal story metadata crosses into the interactive hero. The homepage no longer fetches the full featured article body just to display its summary.

The Framer and computer-use guidance informed browser measurement of the published reference; no third-party Framer project was edited. Supabase guidance informed reuse of public-only reads in the private preview; no privileged key or new data access was introduced.

## Verification

- 30 unit tests pass, including deterministic composition, configured lead selection, canonical/unique hero covers and empty/sparse data.
- TypeScript and the isolated production build pass. Homepage first-load JavaScript: 157KB in the Next.js build report.
- ESLint: zero errors, 16 existing warnings in legacy components.
- Browser coverage includes nine widths (320–1920px), desktop/mobile axe checks, hero keyboard controls, mobile navigation/search, category/archive links, all 50 published news briefs, anonymous CMS protection and reduced motion.
- Authenticated CMS/media workflows require an owner session and are not claimed as tested by this change.

An existing development server was sharing `.next`; verification was moved to the ignored `.next-verify` directory using `JOURNAL_BUILD_DIR=.next-verify`, leaving that server untouched. A subsequent test run was interrupted by a long computer suspension; interrupted checks must be rerun, not counted as passes.

Screenshots are generated in ignored `test-results` by the homepage browser tests. Release-specific browser counts, CI/performance results and preview URL are recorded on the pull request. This document does not claim that the revision has replaced production or that previous Lighthouse measurements apply to this build.

Final local functional coverage: 25 distinct public browser checks passed (24 in the interrupted suite, plus its one affected navigation test in an isolated successful rerun); two authenticated workflows remain skipped. The first CI run independently passed 24 browser tests but exposed a race in the new mobile test: it read `boundingBox().height` before the streamed hero was visible. The test now explicitly waits for the hero and retries the 370px computed-height assertion rather than dereferencing a nullable box.

The Windows-local simulated-mobile performance audit failed the existing gate: home 34 (LCP 6.50s, TBT 3985ms), archive 77 (LCP 3.51s, TBT 409ms), login 80 (LCP 3.35s, TBT 485ms). Accessibility/best-practices were 100 on all three, public SEO 100, login SEO 63 because it is intentionally noindex; CLS was 0.000133. This is not hidden or treated as release-ready performance. Independent CI measurements are recorded on the PR when available.
