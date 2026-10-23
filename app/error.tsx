"use client";
import Link from "next/link";
import { PublicFrame } from "@/components/blog/PublicFrame";
import { defaultSite } from "@/lib/cms/site-config";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicFrame config={defaultSite}>
      <main id="main-content" className="journal-container state-page">
        <div>
          <p className="eyebrow">A brief interruption</p>
          <h1 className="display-title">
            Let’s try that <em>again.</em>
          </h1>
          <p className="page-description">
            We couldn’t load this page. Please try again, or return in a little
            while. Your place in the Journal is still here.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <button onClick={reset} className="editorial-button">
              Try again ↻
            </button>
            <Link href="/" className="text-link">
              Back to the front page
            </Link>
          </div>
        </div>
        <div className="state-number" aria-hidden="true">
          J.
        </div>
      </main>
    </PublicFrame>
  );
}
