import Link from "next/link";
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-outline-variant/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link
            href="/"
            className="font-editorial-headline text-3xl tracking-tight"
          >
            The Journal<span className="text-primary">.</span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-6 text-sm"
          >
            <Link href="/blog" className="hover:text-primary">
              Articles
            </Link>
            <Link href="/login" className="text-primary">
              Editorial studio ↗
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-auto border-t border-outline-variant/40">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-6 px-6 py-10 text-xs text-on-surface-variant">
          <p>
            © {new Date().getFullYear()} The Journal · A space for considered
            ideas.
          </p>
          <Link href="/blog">Explore the archive →</Link>
        </div>
      </footer>
    </>
  );
}
