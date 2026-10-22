"use client";
import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      {state.message && (
        <p
          role="alert"
          className="rounded-lg bg-error-container/40 p-4 text-sm text-error"
        >
          {state.message}
        </p>
      )}
      <fieldset disabled={pending} className="space-y-5">
        <label className="block text-sm font-medium">
          Email address
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="username"
            className="field"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            maxLength={1024}
            autoComplete="current-password"
            className="field"
          />
        </label>
        <button className="button-primary w-full">
          {pending ? "Signing in…" : "Sign in to studio"}
        </button>
      </fieldset>
      <p role="status" className="sr-only">
        {pending ? "Authenticating" : ""}
      </p>
    </form>
  );
}
