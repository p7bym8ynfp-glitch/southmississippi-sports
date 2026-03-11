import Stripe from "stripe";

import { getAppUrl, pricing, siteConfig } from "@/lib/config";
import type { Game, Photo, ProductKind } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export async function createCheckoutSession(input: {
  kind: ProductKind;
  game: Game;
  photo?: Photo;
  photoCount: number;
}) {
  const stripe = getStripeClient();

  if (!stripe) {
    throw new Error("Stripe is not configured yet.");
  }

  const isSingle = input.kind === "single";
  const unitAmount = isSingle
    ? pricing.singlePhotoCents
    : pricing.fullGameCents;
  const lineDescription = isSingle
    ? `${input.game.title} - Photo ${input.photo?.sortOrder ?? ""}`.trim()
    : `${input.game.title} - ${input.photoCount} unwatermarked photos`;

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_creation: "always",
    billing_address_collection: "auto",
    success_url: `${getAppUrl()}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getAppUrl()}/games/${input.game.slug}`,
    metadata: {
      kind: input.kind,
      gameId: input.game.id,
      photoId: input.photo?.id ?? "",
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: isSingle
              ? `${siteConfig.name} single photo`
              : `${siteConfig.name} full game folder`,
            description: `${lineDescription} - ${formatMoney(unitAmount)}`,
          },
        },
      },
    ],
  });
}

export function verifyStripeEvent(payload: Buffer, signature: string) {
  const stripe = getStripeClient();

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe webhook is not configured yet.");
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );
}
