"use client";

export function AddPhotosButton({ gameSlug }: { gameSlug: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const select = document.querySelector('select[name="existingGameSlug"]') as HTMLSelectElement;
        if (select) {
          select.value = gameSlug;
          select.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the form briefly to show it was selected
          const form = select.closest('form');
          if (form) {
            form.classList.add('ring-2', 'ring-[var(--page-accent)]', 'ring-offset-4', 'ring-offset-[var(--page-card)]', 'rounded-3xl', 'transition-all', 'duration-500');
            setTimeout(() => form.classList.remove('ring-2', 'ring-[var(--page-accent)]', 'ring-offset-4', 'ring-offset-[var(--page-card)]'), 1500);
          }
        }
      }}
      className="inline-flex items-center justify-center rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
    >
      Add Photos
    </button>
  );
}
