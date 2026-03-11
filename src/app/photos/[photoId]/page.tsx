import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyButton } from "@/components/buy-button";
import { pricing } from "@/lib/config";
import { getGameById, getPhotoById } from "@/lib/store";
import { formatGameDate, formatMoney, padPhotoNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ photoId: string }>;
}) {
  const { photoId } = await params;
  const photo = await getPhotoById(photoId);

  if (!photo) {
    notFound();
  }

  const game = await getGameById(photo.gameId);

  if (!game || !game.published) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[var(--page-muted)]">
        <Link href="/" className="hover:text-[var(--page-accent)]">
          Home
        </Link>
        <span>/</span>
        <Link href={`/games/${game.slug}`} className="hover:text-[var(--page-accent)]">
          {game.title}
        </Link>
        <span>/</span>
        <span>Photo {padPhotoNumber(photo.sortOrder)}</span>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="overflow-hidden rounded-[32px] border border-[var(--page-line)] bg-[var(--page-card)] shadow-[0_18px_40px_rgba(8,18,32,0.08)]">
          <img
            src={`/api/media/preview/${photo.id}`}
            alt={`${game.title} photo ${photo.sortOrder}`}
            className="h-full min-h-[420px] w-full object-cover"
          />
        </article>

        <aside className="rounded-[32px] border border-[var(--page-line)] bg-[var(--page-card)] p-8 shadow-[0_18px_40px_rgba(8,18,32,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-[var(--page-accent)]">Single photo purchase</p>
          <h1 className="mt-3 text-4xl">Photo {padPhotoNumber(photo.sortOrder)}</h1>
          <p className="mt-4 text-base leading-7 text-[var(--page-muted)]">
            {game.title}<br />
            {formatGameDate(game.date)}
          </p>
          <div className="mt-8 rounded-[24px] bg-[linear-gradient(135deg,#10253f,#1b4569)] p-6 text-[var(--page-paper)]">
            <p className="text-4xl">{formatMoney(pricing.singlePhotoCents)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">Checkout unlocks the original image immediately and emails the customer right away.</p>
            <div className="mt-6">
              <BuyButton
                kind="single"
                gameId={game.id}
                photoId={photo.id}
                className="w-full rounded-full bg-[var(--page-accent-soft)] px-5 py-3 font-semibold text-[var(--page-ink)] transition hover:translate-y-[-1px]"
              >
                Buy this photo
              </BuyButton>
            </div>
          </div>
          <Link
            href={`/games/${game.slug}`}
            className="mt-6 inline-flex rounded-full border border-[var(--page-line)] px-5 py-3 font-semibold text-[var(--page-ink)] transition hover:border-[var(--page-accent)] hover:text-[var(--page-accent)]"
          >
            Back to full gallery
          </Link>
        </aside>
      </section>
    </main>
  );
}
