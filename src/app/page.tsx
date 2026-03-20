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
      {/* Dynamic Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.4]" 
          style={{ backgroundImage: 'url("/hero-bg.png")' }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[var(--page-stadium)] via-transparent to-transparent" />
        
        <div className="relative z-10 w-full max-w-6xl px-6 text-center space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
           <div className="flex flex-col items-center gap-4">
              <p className="inline-flex rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-5 py-2 text-xs uppercase tracking-[0.4em] text-amber-400">
                {siteConfig.domain}
              </p>
              <h1 className="max-w-4xl text-5xl leading-[1.1] font-bold tracking-tighter sm:text-7xl lg:text-8xl drop-shadow-2xl">
                ELITE GAME DAY PHOTOGRAPHY
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-2xl font-light">
                Professional action shots from local fields, delivered instantly to your device.
              </p>
           </div>

           <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <Link
                href="#games"
                className="inline-flex items-center justify-center rounded-full bg-[var(--page-accent)] px-10 py-4 text-lg font-bold text-white shadow-[0_10px_30px_rgba(255,59,59,0.3)] transition hover:scale-105 active:scale-95"
              >
                Browse Galleries
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 backdrop-blur-md px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
              >
                Admin Access
              </Link>
           </div>
        </div>
      </section>

      {/* Stats Line */}
      <div className="relative z-20 mx-auto -mt-10 max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-px rounded-[32px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl sm:grid-cols-4 shadow-2xl">
              <div className="p-8 text-center border-r border-white/10">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Galleries</p>
                  <p className="text-4xl font-bold text-white tracking-tight">{stats.publishedGames}</p>
              </div>
              <div className="p-8 text-center sm:border-r border-white/10">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Total Photos</p>
                  <p className="text-4xl font-bold text-white tracking-tight">{stats.totalPhotos.toLocaleString()}</p>
              </div>
              <div className="p-8 text-center border-r border-white/10">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Photo Price</p>
                  <p className="text-4xl font-bold text-[var(--page-accent)] tracking-tight">{formatMoney(pricing.singlePhotoCents)}</p>
              </div>
              <div className="p-8 text-center">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Full Access</p>
                  <p className="text-4xl font-bold text-white tracking-tight">{formatMoney(pricing.fullGameCents)}</p>
              </div>
          </div>
      </div>

      <section id="games" className="mx-auto mt-24 max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--page-accent)] font-bold mb-3">Live Now</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white italic underline decoration-[var(--page-accent)] decoration-4 underline-offset-8">LATEST GAME GALLERIES</h2>
          </div>
        </div>

        {featuredGames.length === 0 ? (
          <div className="rounded-[40px] border border-dashed border-white/10 bg-white/5 p-20 text-center backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-white">No game folders yet</h3>
            <p className="mt-4 text-lg text-slate-400">
              Check back soon for latest tournament and friday night coverage.
            </p>
            <Link
              href="/admin"
              className="mt-8 inline-flex rounded-full bg-[var(--page-accent)] px-8 py-3 font-bold text-white shadow-lg"
            >
              Open admin
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
            {featuredGames.map(({ game, cover, photoCount }) => (
              <article
                key={game.id}
                className="group relative overflow-hidden rounded-[40px] border border-white/10 bg-[var(--page-card)] backdrop-blur-md shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-[var(--page-accent)/30]"
              >
                <Link href={`/games/${game.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                  {cover ? (
                    <img
                      src={`/api/media/preview/${cover.id}`}
                      alt={`${game.title} preview`}
                      className="h-full w-full object-cover grayscale-[30%] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#0a1b32,#ff3b3b)] p-8 text-center text-xl text-white">
                      {game.title}
                    </div>
                  )}
                  <div className="absolute top-6 left-6 inline-flex rounded-full bg-black/60 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    {game.sport}
                  </div>
                </Link>
                <div className="space-y-6 p-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-white tracking-tight">{game.title}</h3>
                    <p className="text-sm font-medium text-slate-400">{formatGameDate(game.date)}{game.location ? ` - ${game.location}` : ""}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-6 text-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500">Photographs</span>
                        <span className="text-lg font-bold text-white">{photoCount}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500">Bundle Price</span>
                        <span className="text-lg font-bold text-[var(--page-accent)]">{formatMoney(pricing.fullGameCents)}</span>
                    </div>
                  </div>
                  <Link
                    href={`/games/${game.slug}`}
                    className="flex w-full items-center justify-center rounded-2xl bg-white/5 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[var(--page-accent)] group-hover:shadow-[0_4px_20px_rgba(255,59,59,0.2)]"
                  >
                    Open Gallery
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
