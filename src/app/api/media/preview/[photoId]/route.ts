import { promises as fs } from "fs";

import { NextResponse } from "next/server";

import { getPreviewPath } from "@/lib/media";
import { getGameById, getPhotoById } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const { photoId } = await params;
  const photo = await getPhotoById(photoId);

  if (!photo) {
    return new NextResponse("Not found", { status: 404 });
  }

  const game = await getGameById(photo.gameId);

  if (!game || !game.published) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const buffer = await fs.readFile(getPreviewPath(game.slug, photo.previewFilename));
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
