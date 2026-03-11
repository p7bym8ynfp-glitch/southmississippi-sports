import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyButton } from "@/components/buy-button";
import { pricing } from "@/lib/config";
import { getGameWithPhotosBySlug } from "@/lib/store";
import { formatGameDate, formatMoney, padPhotoNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = await getGameWithPhotosBySlug(slug);

  if (!bundle) {
    notFound();
  }

  const { game, photos } = bundle;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[var(--page-muted)]">
        <Link href="/" className="hover:text-[var(--page-accent)]">
          Home
        </Link>
        <span>/</span>
        <span>{game.title}</span>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
        <article className="rounded-[30px] border border-[var(--page-line)] bg-[var(--page-card)] p-8 shadow-[0_18px_40px_rgba(8,18,32,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-[var(--page-accent)]">{game.sport}</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{game.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--page-muted)]">
            {game.description || "Watermarked preview gallery for this game. Parents can buy one image or unlock the whole folder instantly."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--page-muted)]">
            <span className="rounded-full border border-[var(--page-line)] px-4 py-2">{formatGameDate(game.date)}</span>
            {game.opponent ? (
              <span className="rounded-full border border-[var(--page-line)] px-4 py-2">Opponent: {game.opponent}</span>
            ) : null}
            {game.location ? (
              <span className="rounded-full border border-[var(--page-line)] px-4 py-2">{game.location}</span>
            ) : null}
          </div>
        </article>

        <aside className="rounded-[30px] border border-[var(--page-line)] bg-[linear-gradient(145deg,#10253f,#193b5f)] p-8 text-[var(--page-paper)] shadow-[0_18px_40px_rgba(8,18,32,0.12)]">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-100">Purchase options</p>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-4xl">{formatMoney(pricing.fullGameCents)}</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">Unlock the entire folder of {photos.length} original images at once.</p>
            </div>
            <BuyButton
              kind="folder"
              gameId={game.id}
              className="w-full rounded-full bg-[var(--page-accent-soft)] px-6 py-3 font-semibold text-[var(--page-ink)] transition hover:translate-y-[-1px]"
            >
              Buy full folder
            </BuyButton>
            <p className="text-sm leading-6 text-slate-200">Single image checkout stays available on every photo card for {formatMoney(pricing.singlePhotoCents)}.</p>
          </div>
        </aside>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <article
            key={photo.id}
            className="overflow-hidden rounded-[28px] border border-[var(--page-line)] bg-[var(--page-card)] shadow-[0_16px_30px_rgba(8,18,32,0.07)]"
          >
            <Link href={`/photos/${photo.id}`} className="block">
              <img
                src={`/api/media/preview/${photo.id}`}
                alt={`${game.title} photo ${photo.sortOrder}`}
                className="h-80 w-full object-cover"
              />
            </Link>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl">Photo {padPhotoNumber(photo.sortOrder)}</h2>
                <span className="text-sm text-[var(--page-muted)]">{photo.width} x {photo.height}</span>
              </div>
              <BuyButton
                kind="single"
                gameId={game.id}
                photoId={photo.id}
                className="w-full rounded-full bg-[var(--page-accent)] px-5 py-3 font-semibold text-white transition hover:brightness-105"
              >
                Buy this photo for {formatMoney(pricing.singlePhotoCents)}
              </BuyButton>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
