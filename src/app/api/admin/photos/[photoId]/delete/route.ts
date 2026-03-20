import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isAdminRequest } from "@/lib/auth";
import { getAppUrl } from "@/lib/config";
import { deletePhotoMedia } from "@/lib/media";
import { deletePhotoById, getGameById } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const appUrl = getAppUrl();

  if (!isAdminRequest(request)) {
    return NextResponse.redirect(new URL("/admin/login", appUrl));
  }

  const { photoId } = await params;
  const result = await deletePhotoById(photoId);

  if (result.status === "missing") {
    // We can't know which game it was, so just redirect back
    const redirectUrl = request.headers.get("referer") || `${appUrl}/admin`;
    return NextResponse.redirect(new URL(redirectUrl));
  }

  const game = await getGameById(result.photo.gameId);
  const redirectUrl = request.headers.get("referer") || (game ? `${appUrl}/games/${game.slug}` : `${appUrl}/admin`);

  if (result.status === "blocked") {
    const error = encodeURIComponent(
      `Cannot delete photo ${result.photo.sortOrder} because it is included in ${result.orderCount} paid order(s).`,
    );
    return NextResponse.redirect(new URL(`${redirectUrl}${redirectUrl.includes("?") ? "&" : "?"}error=${error}`));
  }

  if (game) {
    await deletePhotoMedia(game.slug, result.photo.originalFilename, result.photo.previewFilename);
  }

  return NextResponse.redirect(new URL(redirectUrl));
}
