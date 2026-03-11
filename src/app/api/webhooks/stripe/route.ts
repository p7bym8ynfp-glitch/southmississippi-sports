import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { fulfillCheckoutSession } from "@/lib/orders";
import { verifyStripeEvent } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  const payload = Buffer.from(await request.arrayBuffer());

  try {
    const event = verifyStripeEvent(payload, signature);

    if (event.type === "checkout.session.completed") {
      await fulfillCheckoutSession(event.data.object as Stripe.Checkout.Session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed.";
    return new NextResponse(message, { status: 400 });
  }
}
