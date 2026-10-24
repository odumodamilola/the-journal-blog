import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import type { SiteConfig } from "@/lib/cms/site-config";
import { editorialCategories } from "@/lib/editorial";
export function MagazineFooter({ config }: { config: SiteConfig }) {
  return (
    <footer className="magazine-footer">
      <div className="journal-container">
        <div className="magazine-footer-grid">
          <nav aria-label="Footer sitemap">
            <p>Publication</p>
            <Link href="/">Home</Link>
            <Link href="/blog">All articles</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <nav aria-label="Footer quick links">
            <p>Quick links</p>
            <Link href="/login">Editorial studio</Link>
            <Link href="/blog?category=Technology">Technology</Link>
            <Link href="/blog?category=World%20News">World News</Link>
            <a href="#main-content">Back to top</a>
          </nav>
          <nav aria-label="Footer categories">
            <p>Subjects</p>
            {editorialCategories.map((category) => (
              <Link
                key={category}
                href={`/blog?category=${encodeURIComponent(category)}`}
              >
                {category}
              </Link>
            ))}
          </nav>
          <div className="magazine-footer-note">
            <p className="magazine-footer-label">The Journal</p>
            <span className="magazine-footer-monogram" aria-hidden="true">
              J.
            </span>
            <p>{config.footer}</p>
          </div>
          <section className="magazine-footer-contact">
            <h2>
              <Mail size={20} aria-hidden="true" /> A note to the editor
            </h2>
            <p>
              A question, a different perspective, an idea worth exploring.
              Start a conversation.
            </p>
            <Link href="/contact">
              Write to the Journal <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </section>
        </div>
        <div className="magazine-footer-description">
          <Link href="/" className="footer-wordmark">
            {config.name}.
          </Link>
          <p>{config.description}</p>
          <p>
            {config.headline} {config.emphasis}
          </p>
        </div>
        <div className="magazine-footer-bottom">
          <p>
            © {new Date().getFullYear()} {config.name}
          </p>
          <p>Independent thinking. Considered writing.</p>
          <Link href="/blog">Explore the archive ↗</Link>
        </div>
      </div>
    </footer>
  );
}
