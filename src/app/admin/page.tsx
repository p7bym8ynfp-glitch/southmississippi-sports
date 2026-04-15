import Link from "next/link";
import { redirect } from "next/navigation";

import { AddPhotosButton } from "@/components/add-photos-button";
import { DeleteGameButton } from "@/components/delete-game-button";
import { isAdminSession } from "@/lib/auth";
import { hasAdminPassword, isStripeConfigured, isEmailConfigured } from "@/lib/config";
import { getWatermarkPath, hasWatermarkImage } from "@/lib/media";
import { getAdminGameSummaries, getCatalogStats, listAdminGames } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    uploaded?: string;
    error?: string;
    game?: string;
    deleted?: string;
  }>;
}) {
  if (!hasAdminPassword()) {
    redirect("/admin/login?error=Set%20ADMIN_PASSWORD%20first");
  }

  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const games = await listAdminGames();
  const stats = await getCatalogStats();
  const watermarkReady = await hasWatermarkImage();
  const gameSummaries = await getAdminGameSummaries();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--page-line)] bg-[linear-gradient(135deg,#10253f,#1a4369)] p-8 text-[var(--page-paper)] shadow-[0_20px_40px_rgba(8,18,32,0.12)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-amber-100">Admin workspace</p>
          <h1 className="mt-3 text-4xl">Upload and publish game galleries</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
            Add photos to a new or existing game folder. Previews are watermarked automatically and the originals stay private until purchase.
          </p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="inline-flex rounded-full border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/8"
          >
            Log out
          </button>
        </form>
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className="rounded-[28px] border border-[var(--page-line)] bg-[var(--page-card)] p-6 shadow-[0_16px_30px_rgba(8,18,32,0.06)]">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--page-accent)]">Published games</p>
          <p className="mt-3 text-4xl">{stats.publishedGames}</p>
        </article>
        <article className="rounded-[28px] border border-[var(--page-line)] bg-[var(--page-card)] p-6 shadow-[0_16px_30px_rgba(8,18,32,0.06)]">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--page-accent)]">Total photos</p>
          <p className="mt-3 text-4xl">{stats.totalPhotos}</p>
        </article>
        <article className="rounded-[28px] border border-[var(--page-line)] bg-[var(--page-card)] p-6 shadow-[0_16px_30px_rgba(8,18,32,0.06)]">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--page-accent)]">Watermark image</p>
          <p className="mt-3 text-lg font-semibold">{watermarkReady ? "Custom watermark loaded" : "Using text watermark fallback"}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--page-muted)]">Optional file path: <code>{getWatermarkPath()}</code></p>
        </article>
      </section>

      {params.error ? (
        <div className="mt-8 rounded-[24px] border border-rose-300 bg-rose-50 p-5 text-sm leading-6 text-rose-800">
          {params.error}
        </div>
      ) : null}

      {params.uploaded ? (
        <div className="mt-8 rounded-[24px] border border-emerald-300 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
          Uploaded {params.uploaded} photo(s) successfully to <strong>{params.game}</strong>.
        </div>
      ) : null}

      {params.deleted ? (
        <div className="mt-8 rounded-[24px] border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          Deleted <strong>{params.deleted}</strong>.
        </div>
      ) : null}

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[32px] border border-[var(--page-line)] bg-[var(--page-card)] p-8 shadow-[0_18px_40px_rgba(8,18,32,0.08)]">
          <h2 className="text-3xl">Upload photos</h2>
          <p className="mt-3 text-base leading-7 text-[var(--page-muted)]">
            Leave the game selector blank to create a new folder. If you choose an existing game, any blank fields keep the current values.
          </p>

          <form action="/api/admin/upload" method="post" encType="multipart/form-data" className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Existing game folder</span>
              <select name="existingGameSlug" className="w-full rounded-2xl border border-[var(--page-line)] bg-white px-4 py-3 outline-none focus:border-[var(--page-accent)]">
                <option value="">Create a new game folder</option>
                {games.map((game) => (
                  <option key={game.id} value={game.slug}>
                    {game.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Game title</span>
                <input type="text" name="title" className="w-full rounded-2xl border border-[var(--page-line)] bg-white px-4 py-3 outline-none focus:border-[var(--page-accent)]" placeholder="Varsity vs. Gulfport" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Date</span>
                <input type="date" name="date" className="w-full rounded-2xl border border-[var(--page-line)] bg-white px-4 py-3 outline-none focus:border-[var(--page-accent)]" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Sport</span>
                <input type="text" name="sport" defaultValue="Football" className="w-full rounded-2xl border border-[var(--page-line)] bg-white px-4 py-3 outline-none focus:border-[var(--page-accent)]" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Opponent</span>
                <input type="text" name="opponent" className="w-full rounded-2xl border border-[var(--page-line)] bg-white px-4 py-3 outline-none focus:border-[var(--page-accent)]" placeholder="Opponent name" />
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold">Location</span>
                <input type="text" name="location" className="w-full rounded-2xl border border-[var(--page-line)] bg-white px-4 py-3 outline-none focus:border-[var(--page-accent)]" placeholder="Stadium, field, or gym" />
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold">Description</span>
                <textarea name="description" rows={3} className="w-full rounded-2xl border border-[var(--page-line)] bg-white px-4 py-3 outline-none focus:border-[var(--page-accent)]" placeholder="Optional details shown on the gallery page" />
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold">Photos</span>
                <input type="file" name="files" multiple accept=".jpg,.jpeg,.png,.webp,.tif,.tiff" required className="w-full rounded-2xl border border-[var(--page-line)] bg-white px-4 py-3" />
                <p className="text-xs leading-5 text-[var(--page-muted)]">Supported upload formats: JPG, PNG, WebP, and TIFF.</p>
              </label>
            </div>

            <label className="flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" name="published" defaultChecked className="h-4 w-4" />
              Publish this folder on the public site right away
            </label>

            <button
              type="submit"
              className="inline-flex rounded-full bg-[var(--page-accent)] px-6 py-3 font-semibold text-white transition hover:brightness-105"
            >
              Upload photos
            </button>
          </form>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[32px] border border-[var(--page-line)] bg-[var(--page-card)] p-8 shadow-[0_18px_40px_rgba(8,18,32,0.08)]">
            <h2 className="text-3xl">Current game folders</h2>
            <div className="mt-6 space-y-4">
              {gameSummaries.length === 0 ? (
                <p className="text-base leading-7 text-[var(--page-muted)]">No games uploaded yet.</p>
              ) : (
                gameSummaries.map(({ game, photoCount, orderCount }) => (
                  <div key={game.id} className="rounded-[24px] border border-[var(--page-line)] bg-white/70 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl">{game.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--page-muted)]">{photoCount} photos - {game.published ? "Published" : "Draft"}</p>
                        {orderCount > 0 ? (
                          <p className="mt-1 text-xs leading-5 text-[var(--page-muted)]">
                            {orderCount} paid order{orderCount === 1 ? "" : "s"} attached
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-end gap-3 text-right">
                        {game.published ? (
                          <Link href={`/games/${game.slug}`} className="text-sm font-semibold text-[var(--page-accent)]">
                            View
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-[var(--page-muted)]">Draft only</span>
                        )}
                        <div className="flex gap-2">
                          <AddPhotosButton gameSlug={game.slug} />
                          <DeleteGameButton
                            gameSlug={game.slug}
                            gameTitle={game.title}
                            orderCount={orderCount}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-[32px] border border-[var(--page-line)] bg-[var(--page-card)] p-8 shadow-[0_18px_40px_rgba(8,18,32,0.08)]">
            <h2 className="text-3xl">Setup reminders</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--page-muted)]">
              {!isStripeConfigured() && <li>Set Stripe keys before testing live checkout.</li>}
              {!isEmailConfigured() && <li>Set SMTP details to email buyers immediately after payment.</li>}
              <li>Drop your watermark PNG at <code>{getWatermarkPath()}</code> if you want your own logo instead of the text fallback.</li>
            </ul>
          </article>
        </aside>
      </section>
    </main>
  );
}

