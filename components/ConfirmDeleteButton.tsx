"use client";
export function ConfirmDeleteButton() {
  return (
    <button
      className="text-red-700"
      type="submit"
      onClick={(event) => {
        if (!window.confirm("Delete this article permanently?"))
          event.preventDefault();
      }}
    >
      Delete
    </button>
  );
}
