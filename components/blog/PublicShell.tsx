import Link from "next/link";
import type { CSSProperties } from "react";
import { publishedSite } from "@/lib/cms/queries";
import type { SiteConfig } from "@/lib/cms/site-config";
export async function PublicShell({
  children,
  config: override,
}: {
  children: React.ReactNode;
  config?: SiteConfig;
}) {
  const config = override || (await publishedSite());
  const styles = {
    "--color-background": config.background,
    "--color-surface": config.background,
    "--color-on-surface": config.text,
    "--color-on-surface-variant": config.text,
    "--color-secondary": config.text,
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
    <div className="public-journal flex min-h-screen flex-col" style={styles}>
      <header className="mx-auto w-full max-w-[1280px] px-6 sm:px-10">
        <div className="flex items-center justify-between gap-5 border-b border-current/20 py-6 sm:py-8">
          <Link
            href="/"
            className="max-w-[60%] break-words font-editorial-headline text-3xl tracking-[-0.06em] sm:text-4xl"
          >
            {config.name}
            <span className="text-primary">.</span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="flex shrink-0 items-center gap-5 text-xs sm:gap-8 sm:text-sm"
          >
            <Link href="/blog" className="hover:underline underline-offset-4">
              Articles
            </Link>
            <Link href="/login" className="text-primary">
              <span className="sm:hidden">Studio ↗</span>
              <span className="hidden sm:inline">Editorial studio ↗</span>
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-auto bg-[var(--color-on-surface)] text-[var(--color-background)]">
        <div className="mx-auto max-w-[1280px] px-6 py-12 sm:px-10 sm:py-16">
          <div className="flex flex-wrap items-start justify-between gap-8 border-b border-current/20 pb-10">
            <div>
              <p className="font-editorial-headline text-5xl tracking-tight sm:text-6xl">
                {config.name}.
              </p>
              <p className="mt-5 max-w-sm text-sm leading-relaxed">
                {config.footer}
              </p>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/blog">The archive ↗</Link>
              <Link href="/login">Studio ↗</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-4 text-xs">
            <p>
              © {new Date().getFullYear()} {config.name}
            </p>
            <p>For the endlessly curious.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
