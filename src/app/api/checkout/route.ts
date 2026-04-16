import { NextResponse } from "next/server";

import { createCheckoutSession } from "@/lib/stripe";
import { getGameById, getPhotoById, listPhotosForGame } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      kind?: "single" | "folder";
      gameId?: string;
      photoId?: string;
    };

    if (!body.gameId || !body.kind) {
      return NextResponse.json(
        { error: "Missing checkout details." },
        { status: 400 },
      );
    }

    const game = await getGameById(body.gameId);

    if (!game || !game.published) {
      return NextResponse.json(
        { error: "That game is not available for purchase." },
        { status: 404 },
      );
    }

    const photos = await listPhotosForGame(game.id);

    if (body.kind === "folder") {
      if (photos.length === 0) {
        return NextResponse.json(
          { error: "This game folder has no photos yet." },
          { status: 400 },
        );
      }

      const session = await createCheckoutSession({
        kind: "folder",
        game,
        photoCount: photos.length,
      });

      return NextResponse.json({ url: session.url });
    }

    const photo = body.photoId ? await getPhotoById(body.photoId) : null;

    if (!photo || photo.gameId !== game.id) {
      return NextResponse.json(
        { error: "That photo could not be found." },
        { status: 404 },
      );
    }

    const session = await createCheckoutSession({
      kind: "single",
      game,
      photo,
      photoCount: photos.length,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
export async function GET() {
  const { getStripeClient } = await import("@/lib/stripe");
  return NextResponse.json({ configured: !!getStripeClient() });
}
