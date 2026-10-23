import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth/require-admin";
import { LoginForm } from "@/components/LoginForm";
import { PublicShell } from "@/components/blog/PublicShell";
import { CategoryArtwork } from "@/components/blog/CategoryArtwork";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sign in · The Journal",
  robots: { index: false, follow: false },
};
export default async function Login() {
  if (await adminSession()) redirect("/admin");
  return (
    <PublicShell>
      <main id="main-content" className="journal-container contact-layout">
        <section>
          <p className="eyebrow">The editorial atelier</p>
          <h2 className="display-title mt-5">
            Every story starts <em>somewhere.</em>
          </h2>
          <p className="page-description">
            Your ideas, your voice, your space to publish. Independent thinking.
            Considered writing.
          </p>
          <div className="contact-art hidden sm:block">
            <CategoryArtwork category="Personal Notes" />
          </div>
        </section>
        <section className="contact-panel">
          <Link href="/" className="text-link">
            ← Back to the Journal
          </Link>
          <h1 className="font-editorial-headline text-4xl mt-7">
            Welcome back.
          </h1>
          <p className="muted mt-3 text-sm leading-7">
            Sign in to your private editorial studio.
          </p>
          <LoginForm />
          <p className="muted mt-8 text-xs leading-6">
            Access is reserved for the designated editor. To recover access,
            contact the site owner.
          </p>
        </section>
      </main>
    </PublicShell>
  );
}
