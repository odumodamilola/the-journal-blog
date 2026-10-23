import { PublicFrame } from "@/components/blog/PublicFrame";
import { defaultSite } from "@/lib/cms/site-config";
export default function Loading() {
  return (
    <PublicFrame config={defaultSite}>
      <main
        id="main-content"
        className="journal-container loading-editorial"
        aria-busy="true"
      >
        <p role="status" className="eyebrow">
          Opening the Journal…
        </p>
        <div className="loading-line mt-8" aria-hidden="true" />
        <div className="loading-line w-1/2" aria-hidden="true" />
        <div className="loading-shape mt-8" aria-hidden="true" />
      </main>
    </PublicFrame>
  );
}
