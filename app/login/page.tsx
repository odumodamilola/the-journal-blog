import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth/require-admin";
import { LoginForm } from "@/components/LoginForm";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sign in · The Journal",
  robots: { index: false, follow: false },
};
export default async function Login() {
  if (await adminSession()) redirect("/admin");
  return (
    <main id="main-content" className="grid min-h-screen md:grid-cols-2">
      <section className="hidden flex-col justify-between bg-[#18231d] p-14 text-white md:flex">
        <Link href="/" className="font-editorial-headline text-3xl">
          The Journal.
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[.25em] text-primary-fixed">
            The editorial atelier
          </p>
          <h1 className="mt-6 max-w-lg font-editorial-headline text-6xl leading-tight">
            Every great story starts somewhere.
          </h1>
          <p className="mt-6 text-white/70">
            Your ideas, your voice, your space to publish.
          </p>
        </div>
        <p className="text-xs text-white/60">
          Independent thinking. Considered writing.
        </p>
      </section>
      <section className="flex flex-col justify-center px-6 py-16 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="text-sm text-primary">
            ← Back to the Journal
          </Link>
          <h2 className="mt-12 font-editorial-headline text-4xl">
            Welcome back
          </h2>
          <p className="mt-3 text-sm text-on-surface-variant">
            Sign in to your private editorial studio.
          </p>
          <LoginForm />
          <p className="mt-8 text-xs text-on-surface-variant">
            Access is reserved for the designated editor. To recover access,
            contact the site owner.
          </p>
        </div>
      </section>
    </main>
  );
}
