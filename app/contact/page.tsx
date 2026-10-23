import type { Metadata } from "next";
import { PublicShell } from "@/components/blog/PublicShell";
import { CategoryArtwork } from "@/components/blog/CategoryArtwork";
import { ContactForm } from "@/components/blog/ContactForm";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contact · The Journal",
  description:
    "A question, a thoughtful suggestion, a different perspective. Write to the editor of The Journal.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Let’s start a conversation. · The Journal",
    description: "Write to the editor of The Journal.",
    type: "website",
    url: "/contact",
  },
  twitter: {
    card: "summary",
    title: "Contact · The Journal",
    description: "Write to the editor of The Journal.",
  },
};
export default function ContactPage() {
  return (
    <PublicShell>
      <main id="main-content" className="journal-container contact-layout">
        <section>
          <p className="eyebrow">The correspondence desk</p>
          <h1 className="display-title mt-5">
            Let’s start a <em>conversation.</em>
          </h1>
          <p className="page-description">
            A question that won’t leave you alone. An idea worth exploring. A
            different point of view. There’s room for all of it here.
          </p>
          <div className="contact-art">
            <CategoryArtwork category="Personal Notes" />
          </div>
          <p className="muted mt-5 text-xs leading-6 max-w-sm">
            Notes go directly into the private editorial inbox. There’s no
            promised response time, but every considered message is welcome.
          </p>
        </section>
        <section className="contact-panel" aria-labelledby="contact-form-title">
          <p className="eyebrow mb-3">A note to the editor</p>
          <h2 id="contact-form-title">What’s on your mind?</h2>
          <ContactForm />
        </section>
      </main>
    </PublicShell>
  );
}
