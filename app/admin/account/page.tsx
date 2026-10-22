import Link from "next/link";
import { PasswordForm } from "@/components/admin/PasswordForm";
export default function Account() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-lg px-6 py-16">
      <Link href="/admin" className="text-sm text-primary">
        ← Editorial studio
      </Link>
      <h1 className="mt-8 font-editorial-headline text-4xl">
        Secure your account
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
        Choose a unique password of at least 12 characters. Replace the initial
        password before publishing your site.
      </p>
      <PasswordForm />
    </main>
  );
}
