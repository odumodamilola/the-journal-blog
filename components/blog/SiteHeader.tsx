"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { articleDate, editorialCategories } from "@/lib/editorial";
import { CategoryIcon } from "./CategoryIcon";

export function SiteHeader({
  name,
  magazine = false,
  headlines = [],
}: {
  name: string;
  magazine?: boolean;
  headlines?: { title: string; slug: string; published_at: string | null }[];
}) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const dialog = useRef<HTMLDialogElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [panel, setPanel] = useState<"search" | "menu">("menu");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    setHydrated(true);
    const update = () => setScrolled(window.scrollY > 30);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      dialog.current?.close();
      previousPathname.current = pathname;
    }
  }, [pathname]);
  const open = (value: "search" | "menu") => {
    setPanel(value);
    dialog.current?.showModal();
    requestAnimationFrame(() => {
      if (value === "search")
        dialog.current
          ?.querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
      else
        dialog.current
          ?.querySelector<HTMLButtonElement>(
            'button[aria-label="Close dialog"]',
          )
          ?.focus();
    });
  };
  return (
    <>
      {!magazine && (
        <div className="publication-note journal-container">
          <span>Independent writing. Open minds.</span>
          <span>Thoughtful ideas, beautifully presented.</span>
        </div>
      )}
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="journal-container header-main">
          <Link href="/" className="wordmark" aria-label={`${name} home`}>
            {name}
            <span>.</span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {[
              ["/blog", "Articles"],
              ["/about", "About"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  pathname === href ||
                  (href === "/blog" && pathname.startsWith("/blog/"))
                    ? "page"
                    : undefined
                }
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => open("search")}
              aria-label="Search articles"
              aria-haspopup="dialog"
              disabled={!hydrated}
            >
              <Search size={19} />
              {magazine && (
                <span className="magazine-search-label">Search articles</span>
              )}
            </button>
            <Link href="/login" className="studio-link">
              Editorial studio <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="icon-button mobile-menu-button"
              onClick={() => open("menu")}
              aria-label="Open navigation"
              aria-haspopup="dialog"
              disabled={!hydrated}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
        <nav
          aria-label="Categories"
          className="category-navigation journal-container"
        >
          {!magazine && <Link href="/blog">All articles</Link>}
          {editorialCategories.map((category) => (
            <Link
              key={category}
              href={`/blog?category=${encodeURIComponent(category)}`}
            >
              {magazine && <CategoryIcon category={category} />}
              {category}
            </Link>
          ))}
        </nav>
        {magazine && headlines.length > 0 && (
          <div className="magazine-headline-strip journal-container">
            <span>In the Journal</span>
            <nav
              aria-label="Article headlines"
              className="magazine-headline-links"
            >
              {headlines.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug}>
                  {post.published_at && (
                    <time dateTime={post.published_at}>
                      {articleDate(post.published_at)}
                    </time>
                  )}
                  <span>{post.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <dialog
        ref={dialog}
        className="navigation-dialog"
        aria-labelledby="navigation-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="dialog-surface">
          <div className="dialog-top">
            <p className="eyebrow" id="navigation-dialog-title">
              {panel === "search"
                ? "Find your next perspective"
                : "Explore the journal"}
            </p>
            <button
              type="button"
              className="icon-button"
              aria-label="Close dialog"
              onClick={() => dialog.current?.close()}
            >
              <X size={22} />
            </button>
          </div>
          {panel === "search" ? (
            <>
              <h2 className="dialog-heading">What are you curious about?</h2>
              <form
                action="/blog"
                onSubmit={() => dialog.current?.close()}
                className="overlay-search"
              >
                <label htmlFor="site-search">Search the journal</label>
                <div>
                  <Search aria-hidden="true" size={22} />
                  <input
                    id="site-search"
                    name="q"
                    type="search"
                    maxLength={100}
                    placeholder="An idea, a topic, a story…"
                    autoFocus
                  />
                  <button className="button-primary">
                    Search <ArrowUpRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </form>
              <p className="muted text-sm mt-6">Or start with a subject.</p>
              <div className="topic-pills">
                {editorialCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/blog?category=${encodeURIComponent(category)}`}
                    onClick={() => dialog.current?.close()}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <nav aria-label="Mobile navigation" className="mobile-nav">
                {[
                  ["/", "Home"],
                  ["/blog", "All articles"],
                  ["/about", "About the Journal"],
                  ["/contact", "Start a conversation"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => dialog.current?.close()}
                  >
                    {label}
                    <ArrowUpRight size={24} aria-hidden="true" />
                  </Link>
                ))}
              </nav>
              <div className="topic-pills">
                {editorialCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/blog?category=${encodeURIComponent(category)}`}
                    onClick={() => dialog.current?.close()}
                  >
                    {category}
                  </Link>
                ))}
              </div>
              <Link
                href="/login"
                className="text-link mt-8"
                onClick={() => dialog.current?.close()}
              >
                Editorial studio <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
