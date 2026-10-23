import Link from "next/link";
import { MediaLibrary } from "@/components/cms/MediaLibrary";
export default function MediaPage() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/admin" className="text-sm text-primary">
        ← Editorial studio
      </Link>
      <p className="eyebrow mt-8">A home for your visuals</p>
      <h1 className="mt-3 font-editorial-headline text-5xl">Media library</h1>
      <p className="my-6 max-w-2xl text-sm leading-relaxed text-secondary">
        Upload once, use anywhere. Draft images and originals remain private.
        Images become public only when used in a published article or website
        section.
      </p>
      <MediaLibrary />
    </main>
  );
}
