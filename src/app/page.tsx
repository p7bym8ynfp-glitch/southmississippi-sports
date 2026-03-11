import Link from "next/link";

import { pricing, siteConfig } from "@/lib/config";
import { getCatalogStats, listGames, listPhotosForGame } from "@/lib/store";
import { formatGameDate, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const games = await listGames();
  const stats = await getCatalogStats();
  const featuredGames = await Promise.all(
    games.slice(0, 6).map(async (game) => {
      const photos = await listPhotosForGame(game.id);
      const cover =
        photos.find((photo) => photo.id === game.coverPhotoId) ?? photos[0] ?? null;

      return {
        game,
        cover,
        photoCount: photos.length,
      };
    }),
  );

  return (
    <main className="pb-20">
      <section className="mx-auto max-w-6xl px-6 pt-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 rounded-[32px] border border-[var(--page-line)] bg-[linear-gradient(135deg,rgba(8,18,32,0.96),rgba(31,56,87,0.95))] p-8 text-[var(--page-paper)] shadow-[0_24px_60px_rgba(8,18,32,0.18)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <p className="inline-flex w-fit rounded-full border border-white/20 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.3em] text-amber-100">
                {siteConfig.domain}
              </p>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl leading-none sm:text-5xl lg:text-6xl">
                  Sports photo sales built for quick game-night delivery.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
                  Upload each game into its own folder, show watermarked previews, and let parents buy a single image for {formatMoney(pricing.singlePhotoCents)} or the whole game folder for {formatMoney(pricing.fullGameCents)}.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--page-accent-soft)] px-6 py-3 font-semibold text-[var(--page-ink)] transition hover:translate-y-[-1px]"
                >
                  Upload a game
                </Link>
                <Link
                  href="#games"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/8"
                >
                  Browse live galleries
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
              <article className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Live games</p>
                <p className="mt-3 text-4xl font-semibold">{stats.publishedGames}</p>
              </article>
              <article className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Uploaded photos</p>
                <p className="mt-3 text-4xl font-semibold">{stats.totalPhotos}</p>
              </article>
              <article className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Delivery flow</p>
                <p className="mt-3 text-base leading-7 text-slate-100">Stripe checkout, instant unwatermarked downloads, and email fulfillment from one place.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-5 px-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-10">
        {[
          {
            title: "Parents find the right game fast",
            copy: "Every upload lands inside a game folder with date, opponent, and location so browsing stays simple on phones.",
          },
          {
            title: "Watermarked previews stay public",
            copy: "Previews are safe to browse, and the original files stay locked until purchase is complete.",
          },
          {
            title: "Fulfillment is immediate",
            copy: "After payment, the site unlocks the originals and emails a secure link or attachment whenever file size allows.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-[28px] border border-[var(--page-line)] bg-[var(--page-card)] p-6 shadow-[0_16px_32px_rgba(8,18,32,0.06)]"
          >
            <h2 className="text-2xl">{item.title}</h2>
            <p className="mt-3 text-base leading-7 text-[var(--page-muted)]">{item.copy}</p>
          </article>
        ))}
      </section>

      <section id="games" className="mx-auto mt-14 max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--page-accent)]">Live galleries</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Parents can browse by game folder and buy in seconds.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[var(--page-muted)]">
            The current pricing matches your request exactly, including the full-folder special at {formatMoney(pricing.fullGameCents)}.
          </p>
        </div>

        {featuredGames.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[var(--page-line)] bg-[var(--page-card)] p-10 text-center shadow-[0_16px_32px_rgba(8,18,32,0.05)]">
            <h3 className="text-2xl">No live game folders yet</h3>
            <p className="mt-3 text-base leading-7 text-[var(--page-muted)]">
              Log into the admin area, upload a batch of photos, and the public gallery will populate automatically.
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-flex rounded-full bg-[var(--page-accent)] px-5 py-3 font-semibold text-white"
            >
              Open admin
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredGames.map(({ game, cover, photoCount }) => (
              <article
                key={game.id}
                className="overflow-hidden rounded-[30px] border border-[var(--page-line)] bg-[var(--page-card)] shadow-[0_18px_40px_rgba(8,18,32,0.08)] transition hover:translate-y-[-2px]"
              >
                <Link href={`/games/${game.slug}`} className="block">
                  {cover ? (
                    <img
                      src={`/api/media/preview/${cover.id}`}
                      alt={`${game.title} preview`}
                      className="h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-72 items-center justify-center bg-[linear-gradient(135deg,#10253f,#a13b2f)] p-8 text-center text-xl text-white">
                      {game.title}
                    </div>
                  )}
                </Link>
                <div className="space-y-4 p-6">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--page-accent)]">{game.sport}</p>
                    <h3 className="text-2xl">{game.title}</h3>
                    <p className="text-sm text-[var(--page-muted)]">{formatGameDate(game.date)}{game.location ? ` - ${game.location}` : ""}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[var(--page-muted)]">
                    <span>{photoCount} photos</span>
                    <span>Full folder {formatMoney(pricing.fullGameCents)}</span>
                  </div>
                  <Link
                    href={`/games/${game.slug}`}
                    className="inline-flex rounded-full border border-[var(--page-line)] px-5 py-3 font-semibold text-[var(--page-ink)] transition hover:border-[var(--page-accent)] hover:text-[var(--page-accent)]"
                  >
                    Open gallery
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
