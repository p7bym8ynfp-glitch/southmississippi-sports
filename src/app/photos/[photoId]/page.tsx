import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BuyButton } from "@/components/buy-button";
import { pricing } from "@/lib/config";
import { getGameById, getPhotoById } from "@/lib/store";
import { formatGameDate, formatMoney, padPhotoNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ photoId: string }>;
}): Promise<Metadata> {
  const { photoId } = await params;
  const photo = await getPhotoById(photoId);
  if (!photo) return {};

  const game = await getGameById(photo.gameId);
  return {
    title: `Photo ${padPhotoNumber(photo.sortOrder)} | ${game?.title || "South Mississippi Sports"}`,
    description: `Purchase high-resolution action shots from ${game?.title || "this game"}.`,
  };
}

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
      <div className="mb-10 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-slate-500">
        <Link href="/" className="hover:text-[var(--page-accent)] transition">
          Home
        </Link>
        <span className="opacity-30">/</span>
        <Link href={`/games/${game.slug}`} className="hover:text-[var(--page-accent)] transition">
          {game.title}
        </Link>
        <span className="opacity-30">/</span>
        <span className="text-slate-300">Photo {padPhotoNumber(photo.sortOrder)}</span>
      </div>

      <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="overflow-hidden rounded-[40px] border border-white/10 bg-[var(--page-card)] shadow-2xl backdrop-blur-md">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={`/api/media/preview/${photo.id}`}
              alt={`${game.title} photo ${photo.sortOrder}`}
              fill
              unoptimized
              priority
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover grayscale-[10%] transition-all duration-700 hover:grayscale-0 hover:scale-105"
            />
            <div className="absolute top-6 left-6 inline-flex rounded-full bg-black/60 backdrop-blur-md px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
              {game.sport} | PREVIEW
            </div>
          </div>
        </article>

        <aside className="rounded-[40px] border border-white/10 bg-[var(--page-card)] p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-[var(--page-accent)] opacity-10 blur-[80px]" />
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--page-accent)] font-bold">Individual Purchase</p>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Photo {padPhotoNumber(photo.sortOrder)}</h1>
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-200">{game.title}</p>
                <p className="text-sm text-slate-400 font-medium">{formatGameDate(game.date)}</p>
              </div>
            </div>

            <div className="space-y-6 rounded-[24px] border border-white/5 bg-[linear-gradient(135deg,#0a1b32,#1b4569)] p-8">
              <div className="space-y-1">
                <p className="text-5xl font-bold tracking-tighter text-white">{formatMoney(pricing.singlePhotoCents)}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Standard Resolution Download</p>
              </div>
              <p className="text-sm leading-7 text-slate-300">Instantly unlock the unwatermarked original file. Secure download link sent immediately to your email after checkout.</p>
              <BuyButton
                kind="single"
                gameId={game.id}
                photoId={photo.id}
                className="w-full rounded-2xl bg-[var(--page-accent)] py-5 text-lg font-bold uppercase tracking-widest text-white shadow-lg shadow-[var(--page-accent)/20] transition hover:scale-[1.02] active:scale-[0.98]"
              >
                Buy this photo
              </BuyButton>
            </div>

            <Link
              href={`/games/${game.slug}`}
              className="flex w-full items-center justify-center rounded-2xl border border-white/10 py-5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/5"
            >
              Back to local gallery
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
