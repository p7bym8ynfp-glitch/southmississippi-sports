import { randomUUID } from "crypto";

import type Stripe from "stripe";

import { deliveryWindowDays, pricing } from "@/lib/config";
import { sendDeliveryEmail } from "@/lib/email";
import { createGameArchive } from "@/lib/media";
import {
  createFulfilledOrder,
  findOrderBySessionId,
  findOrderByToken,
  getGameById,
  getPhotoById,
  listPhotosForGame,
} from "@/lib/store";
import type { Photo } from "@/lib/types";

function isPhoto(photo: Photo | null): photo is Photo {
  return Boolean(photo);
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return null;
  }

  const existing = await findOrderBySessionId(session.id);

  if (existing) {
    return existing;
  }

  const kind = session.metadata?.kind === "folder" ? "folder" : "single";
  const gameId = session.metadata?.gameId;

  if (!gameId) {
    throw new Error("Stripe checkout is missing the game id.");
  }

  const game = await getGameById(gameId);

  if (!game) {
    throw new Error("The purchased game could not be found.");
  }

  const photos =
    kind === "folder"
      ? await listPhotosForGame(game.id)
      : [await getPhotoById(session.metadata?.photoId ?? "")].filter(isPhoto);

  if (photos.length === 0) {
    throw new Error("The purchased photo set is empty.");
  }

  const deliveryToken = randomUUID();

  if (kind === "folder") {
    await createGameArchive(deliveryToken, game, photos);
  }

  const order = await createFulfilledOrder({
    stripeSessionId: session.id,
    kind,
    status: "fulfilled",
    gameId: game.id,
    photoIds: photos.map((photo) => photo.id),
    email: session.customer_details?.email || session.customer_email || "",
    customerName: session.customer_details?.name || undefined,
    amountCents:
      kind === "folder" ? pricing.fullGameCents : pricing.singlePhotoCents,
    deliveryToken,
    fulfilledAt: new Date().toISOString(),
    expiresAt: new Date(
      Date.now() + deliveryWindowDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
  });

  try {
    await sendDeliveryEmail({ order, game, photos });
  } catch (error) {
    // If SMTP fails, the customer can still access downloads via the thank-you page.
    console.error("SMTP failed to deliver receipt, but order was fulfilled:", error);
  }

  return order;
}

export async function getOrderBundleBySessionId(sessionId: string) {
  const order = await findOrderBySessionId(sessionId);

  if (!order) {
    return null;
  }

  const game = await getGameById(order.gameId);

  if (!game) {
    return null;
  }

  const photos = (
    await Promise.all(order.photoIds.map((photoId) => getPhotoById(photoId)))
  ).filter(isPhoto);

  return { order, game, photos };
}

export async function getOrderBundleByToken(token: string) {
  const order = await findOrderByToken(token);

  if (!order) {
    return null;
  }

  const game = await getGameById(order.gameId);

  if (!game) {
    return null;
  }

  const photos = (
    await Promise.all(order.photoIds.map((photoId) => getPhotoById(photoId)))
  ).filter(isPhoto);

  return { order, game, photos };
}
