import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PublicShell } from "@/components/blog/PublicShell";
import { CategoryArtwork } from "@/components/blog/CategoryArtwork";
import { Reveal } from "@/components/blog/Reveal";
import { publishedSite } from "@/lib/cms/queries";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "About · The Journal",
  description:
    "An independent space for technology, the craft of building and considered perspectives. Discover the idea behind The Journal.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Every story begins with curiosity. · The Journal",
    description:
      "The idea behind The Journal: curiosity, clarity and thoughtful exploration.",
    type: "website",
    url: "/about",
  },
  twitter: {
    card: "summary",
    title: "About · The Journal",
    description:
      "Curiosity, clarity and thoughtful exploration. The idea behind The Journal.",
  },
};
export default async function AboutPage() {
  const config = await publishedSite();
  return (
    <PublicShell config={config}>
      <main id="main-content" className="journal-container pb-8">
        <header className="page-intro about-grid">
          <div>
            <p className="eyebrow">The idea behind the Journal</p>
            <h1 className="display-title mt-5">
              Every story begins with <em>curiosity.</em>
            </h1>
            <p className="page-description">{config.description}</p>
            <Link href="/blog" className="text-link mt-5">
              Explore the stories
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="about-art">
            <CategoryArtwork category="Personal Notes" />
            <CategoryArtwork category="Technology" />
            <CategoryArtwork category="Software Engineering" />
          </div>
        </header>
        <section className="home-section about-story">
          <div>
            <p className="eyebrow">A little context</p>
            <h2 className="mt-4">A place to look a little closer.</h2>
          </div>
          <div>
            <p>
              The Journal is an independent publishing space for ideas about
              technology, the craft of building, work and everyday life.
            </p>
            <p>
              It brings together practical explorations and considered
              perspectives. Some stories ask how things work. Others ask why
              they matter. Each is an invitation to pause, follow a thread and
              make a connection.
            </p>
            <p>{config.footer}</p>
          </div>
        </section>
        <section className="home-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The way we approach it</p>
              <h2>Good questions. Clear thinking.</h2>
            </div>
          </div>
          <Reveal>
            <div className="principles-grid">
              {[
                [
                  "Curiosity",
                  "Follow questions beyond the obvious answer. Leave space for a different perspective.",
                ],
                [
                  "Clarity",
                  "Make complicated ideas approachable without losing the details that matter.",
                ],
                [
                  "Thoughtfulness",
                  "Give a subject the time and attention it deserves. Put understanding before urgency.",
                ],
                [
                  "Exploration",
                  "Connect the technical and the everyday. Keep learning, making and looking closer.",
                ],
              ].map(([title, body], index) => (
                <article key={title}>
                  <span>0{index + 1} /</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </section>
        <section className="home-section">
          <div className="brand-panel">
            <div>
              <p className="eyebrow mb-5">There’s more to discover</p>
              <h2>A new perspective is a good place to start.</h2>
            </div>
            <Link href="/blog" className="editorial-button">
              Explore the stories
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
