"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="mx-auto max-w-xl px-6 py-24">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 font-editorial-headline text-4xl">
        We couldn’t load this page.
      </h1>
      <p className="mt-4 text-on-surface-variant">
        Please try again. If the problem continues, come back in a little while.
      </p>
      <button onClick={reset} className="button-primary mt-8">
        Try again
      </button>
    </main>
  );
}
