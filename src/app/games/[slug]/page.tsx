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
      <div className="mb-10 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-slate-500">
        <Link href="/" className="hover:text-[var(--page-accent)] transition">
          Home
        </Link>
        <span className="opacity-30">/</span>
        <span className="text-slate-300">{game.title}</span>
      </div>

      <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-[40px] border border-white/10 bg-[var(--page-card)] p-10 backdrop-blur-md shadow-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--page-accent)] font-bold mb-4">{game.sport}</p>
          <h1 className="text-5xl font-bold tracking-tighter text-white sm:text-6xl">{game.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400 font-light italic">
            {game.description || "Watermarked preview gallery for this game. Parents can buy one image or unlock the whole folder instantly."}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
            <span className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-slate-300">{formatGameDate(game.date)}</span>
            {game.opponent ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-slate-300">Vs. {game.opponent}</span>
            ) : null}
            {game.location ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-slate-300">{game.location}</span>
            ) : null}
          </div>
        </article>

        <aside className="flex flex-col justify-center rounded-[40px] border border-white/10 bg-[linear-gradient(145deg,#0a1b32,#1b4569)] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-[var(--page-accent)] opacity-20 blur-[100px] transition-all duration-700 group-hover:opacity-30" />
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-400 font-bold">Recommended Option</p>
              <h2 className="text-3xl font-bold tracking-tight">Full Gallery Access</h2>
            </div>
            <div className="space-y-4">
              <p className="text-6xl font-bold tracking-tighter">{formatMoney(pricing.fullGameCents)}</p>
              <p className="text-sm leading-7 text-slate-300">Get every photograph ({photos.length} total) from this game in high resolution with no watermarks.</p>
            </div>
            <BuyButton
              kind="folder"
              gameId={game.id}
              className="w-full rounded-2xl bg-[var(--page-accent)] py-5 text-lg font-bold uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--page-accent)/20]"
            >
              Unlock Entire Folder
            </BuyButton>
            <p className="text-[10px] text-center uppercase tracking-widest text-slate-500">Instant email delivery & secure download link</p>
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
