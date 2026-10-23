import Link from "next/link";
import { PublicFrame } from "@/components/blog/PublicFrame";
import { defaultSite } from "@/lib/cms/site-config";
export default function NotFound() {
  return (
    <PublicFrame config={defaultSite}>
      <main id="main-content" className="journal-container state-page">
        <div>
          <p className="eyebrow">404 / A page turned somewhere else</p>
          <h1 className="display-title">
            An unwritten <em>chapter.</em>
          </h1>
          <p className="page-description">
            The story you’re looking for may have moved, been unpublished, or
            never existed. There’s still plenty to discover.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/blog" className="editorial-button">
              Explore the archive ↗
            </Link>
            <Link href="/" className="text-link">
              Return to the front page
            </Link>
          </div>
        </div>
        <div className="state-number" aria-hidden="true">
          404
        </div>
      </main>
    </PublicFrame>
  );
}
