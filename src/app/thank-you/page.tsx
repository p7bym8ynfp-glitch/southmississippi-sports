import Link from "next/link";

import { getOrderBundleBySessionId } from "@/lib/orders";
import { formatGameDate, formatMoney, padPhotoNumber } from "@/lib/utils";

import { RefreshHandler } from "@/components/refresh-handler";

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
    <main className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12 sm:px-8 lg:px-10 overflow-hidden">
      <RefreshHandler hasBundle={!!bundle} />
      
      {/* Subtle Stadium Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center brightness-[0.15] grayscale-[50%]" 
        style={{ backgroundImage: 'url("/hero-bg.png")' }}
      />
      
      <section className="relative z-10 w-full rounded-[40px] border border-white/10 bg-[var(--page-card)] p-10 shadow-2xl backdrop-blur-xl sm:p-14">
        {bundle ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-[var(--page-accent)]">Elite Access Granted</p>
              <h1 className="text-5xl font-bold tracking-tighter text-white sm:text-6xl uppercase italic leading-[1.1]">Your originals are ready for action</h1>
              <div className="space-y-1">
                <p className="text-xl font-bold text-slate-200">{bundle.game.title}</p>
                <p className="text-sm font-medium text-slate-400">{formatGameDate(bundle.game.date)} | {formatMoney(bundle.order.amountCents)}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#0a1b32,#1b4569)] p-10 shadow-2xl">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400">Download Center</h2>
              <div className="grid gap-4">
                {bundle.order.kind === "folder" ? (
                  <a
                    href={`/api/deliveries/${bundle.order.deliveryToken}/folder.zip`}
                    className="flex items-center justify-center rounded-2xl bg-[var(--page-accent)] py-5 text-lg font-black uppercase tracking-widest text-white shadow-xl transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Download Full Game Zip
                  </a>
                ) : (
                  bundle.photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={`/api/deliveries/${bundle.order.deliveryToken}/${photo.id}`}
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
                    >
                      <span className="flex items-center gap-4">
                        <span className="h-2 w-2 rounded-full bg-[var(--page-accent)] group-hover:animate-ping" />
                        Download photo {padPhotoNumber(photo.sortOrder)}
                      </span>
                      <span className="text-[10px] text-slate-500">ORIGINAL RESOLUTION</span>
                    </a>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl bg-white/5 border border-white/5 p-6 backdrop-blur-sm">
                <p className="text-sm leading-relaxed text-slate-300">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] mr-2">Digital Delivery:</span>
                  We&apos;ve also dispatched your order to <strong className="text-white font-black">{bundle.order.email}</strong>. If file sizes exceed attachment limits, please use the secure links above for immediate access.
                </p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="space-y-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-[var(--page-accent)]">Verifying Order</p>
              <h1 className="text-5xl font-bold tracking-tighter text-white sm:text-6xl uppercase italic leading-[1.1]">Secure Fulfillment in Progress</h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400 font-light leading-relaxed">
                Stripe has redirected successfully. We are currently finalizing your unwatermarked files. This page will update automatically in a few seconds.
              </p>
            </div>
            <div className="flex justify-center">
                <div className="h-1 lg:h-1 w-64 bg-white/10 overflow-hidden relative rounded-full">
                    <div className="absolute inset-0 bg-[var(--page-accent)] w-1/2 animate-pulse" />
                </div>
            </div>
          </div>
        )}

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/10 pt-10">
            <Link 
              href="/" 
              className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              Return to storefront
            </Link>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">SM SPORTS MEDIA ACCESS v2.0</p>
        </div>
      </section>
    </main>
  );
}
