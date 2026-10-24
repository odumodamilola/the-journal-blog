import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { SiteConfig } from "@/lib/cms/site-config";
import { editorialCategories } from "@/lib/editorial";
import { SiteHeader } from "./SiteHeader";
import { MagazineFooter } from "./MagazineFooter";

export function PublicFrame({
  children,
  config,
  magazine = false,
  headlines = [],
}: {
  children: ReactNode;
  config: SiteConfig;
  magazine?: boolean;
  headlines?: { title: string; slug: string; published_at: string | null }[];
}) {
  const styles = {
    "--color-background": config.background,
    "--color-surface": config.background,
    "--color-on-surface": config.text,
    "--color-primary": config.accent,
    "--color-primary-container": config.accent,
    "--public-heading":
      config.headingFont === "Newsreader"
        ? "var(--font-newsreader), Georgia, serif"
        : "var(--font-inter), sans-serif",
    fontFamily:
      config.bodyFont === "Newsreader"
        ? "var(--font-newsreader), Georgia, serif"
        : "var(--font-inter), sans-serif",
    background: config.background,
    color: config.text,
  } as CSSProperties;
  return (
    <div
      className={`public-journal flex min-h-screen flex-col ${magazine ? "magazine-home" : ""}`}
      style={styles}
    >
      <SiteHeader
        name={config.name}
        magazine={magazine}
        headlines={headlines}
      />
      {children}
      {magazine ? (
        <MagazineFooter config={config} />
      ) : (
        <footer className="site-footer">
          <div className="journal-container">
            <div className="footer-lead">
              <div>
                <p className="footer-eyebrow">For the endlessly curious.</p>
                <h2>
                  Stories that
                  <br />
                  <em>stay with you.</em>
                </h2>
              </div>
              <Link href="/blog" className="footer-cta">
                Find your next read{" "}
                <ArrowUpRight size={23} aria-hidden="true" />
              </Link>
            </div>
            <div className="footer-columns">
              <div>
                <Link href="/" className="footer-wordmark">
                  {config.name}.
                </Link>
                <p className="footer-description">{config.footer}</p>
              </div>
              <nav aria-label="Footer publication links">
                <p className="footer-label">The publication</p>
                <Link href="/blog">All articles</Link>
                <Link href="/about">About the Journal</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/login">Editorial studio ↗</Link>
              </nav>
              <nav aria-label="Footer categories">
                <p className="footer-label">Follow your curiosity</p>
                {editorialCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/blog?category=${encodeURIComponent(category)}`}
                  >
                    {category}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="footer-bottom">
              <p>
                © {new Date().getFullYear()} {config.name}
              </p>
              <p>Independent thinking. Considered writing.</p>
              <a href="#main-content">Back to top ↑</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
