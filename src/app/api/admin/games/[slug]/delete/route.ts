import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isAdminRequest } from "@/lib/auth";
import { getAppUrl } from "@/lib/config";
import { deleteGameMedia } from "@/lib/media";
import { deleteGameBySlug } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const appUrl = getAppUrl();

  if (!isAdminRequest(request)) {
    return NextResponse.redirect(new URL("/admin/login", appUrl));
  }

  const { slug } = await params;
  const result = await deleteGameBySlug(slug);

  if (result.status === "missing") {
    return NextResponse.redirect(
      new URL("/admin?error=Game%20folder%20not%20found", appUrl),
    );
  }

  if (result.status === "blocked") {
    const error = encodeURIComponent(
      `Cannot delete "${result.game.title}" because ${result.orderCount} paid order${result.orderCount === 1 ? "" : "s"} still depend on it.`,
    );
    return NextResponse.redirect(new URL(`/admin?error=${error}`, appUrl));
  }

  try {
    await deleteGameMedia(result.game.slug);
  } catch {
    // The gallery is already removed from the catalog; leftover files can be cleaned up later.
  }

  return NextResponse.redirect(
    new URL(`/admin?deleted=${encodeURIComponent(result.game.title)}`, appUrl),
  );
}
