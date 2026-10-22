export default function Loading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      className="mx-auto w-full max-w-6xl px-6 py-20"
    >
      <p role="status" className="text-on-surface-variant">
        Loading the studio…
      </p>
      <div className="mt-8 h-48 animate-pulse rounded-2xl bg-surface-container" />
    </main>
  );
}
