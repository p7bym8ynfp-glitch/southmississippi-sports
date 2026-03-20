"use client";

import type { FormEvent } from "react";

type DeletePhotoButtonProps = {
  photoId: string;
};

export function DeletePhotoButton({ photoId }: DeletePhotoButtonProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (
      !window.confirm(
        `Delete this photo permanently? This cannot be undone.`,
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={`/api/admin/photos/${photoId}/delete`}
      method="post"
      onSubmit={handleSubmit}
      className="absolute top-4 right-4 z-50"
    >
      <button
        type="submit"
        title="Delete Photo"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600/90 text-white shadow-lg backdrop-blur-md transition hover:scale-110 hover:bg-rose-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </form>
  );
}
