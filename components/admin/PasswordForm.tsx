"use client";
import { useActionState } from "react";
import { changePassword } from "@/app/actions/auth";
export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      {state.message && (
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
      )}
      <fieldset disabled={pending} className="space-y-5">
        <label className="block text-sm font-medium">
          New password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            className="field"
          />
        </label>
        <label className="block text-sm font-medium">
          Confirm new password
          <input
            name="confirmation"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            className="field"
          />
        </label>
        <button className="button-primary">
          {pending ? "Updating…" : "Update password"}
        </button>
      </fieldset>
    </form>
  );
}
