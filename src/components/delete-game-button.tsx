"use client";

import type { FormEvent } from "react";

type DeleteGameButtonProps = {
  gameSlug: string;
  gameTitle: string;
  orderCount: number;
};

export function DeleteGameButton({
  gameSlug,
  gameTitle,
  orderCount,
}: DeleteGameButtonProps) {
  const disabled = orderCount > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (disabled) {
      event.preventDefault();
      return;
    }

    if (
      !window.confirm(
        `Delete "${gameTitle}" and all of its photos? This cannot be undone.`,
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={`/api/admin/games/${encodeURIComponent(gameSlug)}/delete`}
      method="post"
      onSubmit={handleSubmit}
      className="space-y-2"
    >
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
      >
        Delete
      </button>
      <p className="text-xs leading-5 text-[var(--page-muted)]">
        {disabled
          ? `Delete disabled because ${orderCount} paid order${orderCount === 1 ? "" : "s"} depend on this gallery.`
          : "Deletes the gallery and its original + preview files."}
      </p>
    </form>
  );
}
