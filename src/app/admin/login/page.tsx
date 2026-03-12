import Link from "next/link";

import { hasAdminPassword } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const ready = hasAdminPassword();

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-10 sm:px-8">
      <section className="w-full rounded-[32px] border border-[var(--page-line)] bg-[var(--page-card)] p-8 shadow-[0_22px_44px_rgba(8,18,32,0.08)]">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--page-accent)]">Admin login</p>
        <h1 className="mt-3 text-4xl">Upload game galleries</h1>
        <p className="mt-4 text-base leading-7 text-[var(--page-muted)]">
          This protected page is where you add photos, organize them by game folder, and control what goes live on the public site.
        </p>

        {!ready ? (
          <div className="mt-6 rounded-[24px] border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Set <code>ADMIN_PASSWORD</code> in <code>.env.local</code> before using the admin area.
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-6 rounded-[24px] border border-rose-300 bg-rose-50 p-5 text-sm leading-6 text-rose-800">
            {params.error}
          </div>
        ) : null}

        <form action="/api/admin/login" method="post" className="mt-8 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--page-ink)]">Password</span>
            <input
              type="password"
              name="password"
              className="w-full rounded-2xl border border-[var(--page-line)] bg-white px-4 py-3 outline-none ring-0 transition focus:border-[var(--page-accent)]"
              placeholder="Enter your admin password"
              required
            />
          </label>
          <button
            type="submit"
            disabled={!ready}
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--page-accent)] px-5 py-3 font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enter admin
          </button>
        </form>

        <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-[var(--page-muted)] hover:text-[var(--page-accent)]">
          Back to storefront
        </Link>
        <p className="mt-4 text-xs leading-5 text-[var(--page-muted)]">
          If this page ever says server action not found after an update, open{" "}
          <Link href="/api/reset-client" className="font-semibold text-[var(--page-accent)]">
            reset cached app
          </Link>{" "}
          once and then sign in again.
        </p>
      </section>
    </main>
  );
}
