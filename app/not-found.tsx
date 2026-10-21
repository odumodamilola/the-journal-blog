import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center">
      <span className="text-xs font-mono uppercase tracking-widest text-[#73726E] mb-3">
        404 — Page Not Found
      </span>
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1A1A1A] mb-4">
        Story Not Found
      </h1>
      <p className="text-[#73726E] max-w-md mb-8 font-sans">
        The article or view you are looking for does not exist or may have been archived.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-black transition-colors"
      >
        Return to Front Page
      </Link>
    </div>
  );
}
