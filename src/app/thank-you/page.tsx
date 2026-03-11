import Link from "next/link";

import { getOrderBundleBySessionId } from "@/lib/orders";
import { formatGameDate, formatMoney, padPhotoNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const bundle = sessionId ? await getOrderBundleBySessionId(sessionId) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12 sm:px-8 lg:px-10">
      <section className="w-full rounded-[36px] border border-[var(--page-line)] bg-[var(--page-card)] p-8 shadow-[0_24px_50px_rgba(8,18,32,0.08)] sm:p-10">
        {bundle ? (
          <>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--page-accent)]">Purchase complete</p>
            <h1 className="mt-3 text-4xl sm:text-5xl">Your originals are ready.</h1>
            <p className="mt-4 text-base leading-7 text-[var(--page-muted)]">
              {bundle.game.title} - {formatGameDate(bundle.game.date)}<br />
              Amount paid: {formatMoney(bundle.order.amountCents)}
            </p>

            <div className="mt-8 space-y-4 rounded-[28px] bg-[linear-gradient(135deg,#10253f,#1a4369)] p-7 text-[var(--page-paper)]">
              {bundle.order.kind === "folder" ? (
                <a
                  href={`/api/deliveries/${bundle.order.deliveryToken}/folder.zip`}
                  className="inline-flex rounded-full bg-[var(--page-accent-soft)] px-6 py-3 font-semibold text-[var(--page-ink)]"
                >
                  Download full game zip
                </a>
              ) : (
                bundle.photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={`/api/deliveries/${bundle.order.deliveryToken}/${photo.id}`}
                    className="inline-flex w-full items-center justify-between rounded-[22px] border border-white/16 px-5 py-4 font-semibold text-white transition hover:bg-white/8"
                  >
                    <span>Download photo {padPhotoNumber(photo.sortOrder)}</span>
                    <span>Original file</span>
                  </a>
                ))
              )}
            </div>

            <p className="mt-6 text-sm leading-6 text-[var(--page-muted)]">
              We also attempt to email the delivery right away. If the email attachment is too large, the secure links above still work immediately.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--page-accent)]">Payment received</p>
            <h1 className="mt-3 text-4xl sm:text-5xl">We are finishing delivery.</h1>
            <p className="mt-4 text-base leading-7 text-[var(--page-muted)]">
              Stripe has redirected back successfully. If your webhook has not finished yet, refresh this page in a few seconds and your download links will appear.
            </p>
          </>
        )}

        <Link href="/" className="mt-8 inline-flex rounded-full border border-[var(--page-line)] px-5 py-3 font-semibold text-[var(--page-ink)] transition hover:border-[var(--page-accent)] hover:text-[var(--page-accent)]">
          Return to storefront
        </Link>
      </section>
    </main>
  );
}
