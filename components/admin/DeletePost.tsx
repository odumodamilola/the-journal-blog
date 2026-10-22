"use client";
import { useActionState, useId, useRef } from "react";
import { deletePost } from "@/app/actions/posts";

export function DeletePost({
  id,
  title,
  version,
}: {
  id: string;
  title: string;
  version: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const labelId = useId();
  const [state, action, pending] = useActionState(deletePost, {});
  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="text-error hover:underline"
        aria-label={`Delete ${title || "untitled draft"}`}
      >
        Delete
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={labelId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border bg-background p-6 text-on-surface shadow-xl backdrop:bg-black/40"
      >
        <h2 id={labelId} className="font-editorial-headline text-2xl">
          Delete this story?
        </h2>
        <p className="mt-3 text-sm text-on-surface-variant">
          “{title || "Untitled draft"}” will be permanently removed. This cannot
          be undone.
        </p>
        <form action={action} className="mt-5">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="version" value={version} />
          <label className="block text-sm">
            Type DELETE to confirm
            <input
              name="confirmation"
              required
              pattern="DELETE"
              autoComplete="off"
              className="field"
            />
          </label>
          {state.message && (
            <p role="alert" className="mt-3 text-sm text-error">
              {state.message}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              disabled={pending}
              className="button-secondary"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
            <button disabled={pending} className="button-primary bg-error!">
              {pending ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
