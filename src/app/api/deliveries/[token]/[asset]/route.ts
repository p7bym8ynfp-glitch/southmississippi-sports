import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";

import { getDeliveryArchivePath, getOriginalPath } from "@/lib/media";
import { getOrderBundleByToken } from "@/lib/orders";

export const runtime = "nodejs";

function buildAttachmentHeader(filename: string) {
  return `attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; asset: string }> },
) {
  const { token, asset } = await params;
  const bundle = await getOrderBundleByToken(token);

  if (!bundle) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (new Date(bundle.order.expiresAt).getTime() < Date.now()) {
    return new NextResponse("Download expired", { status: 410 });
  }

  if (asset === "folder.zip") {
    if (bundle.order.kind !== "folder") {
      return new NextResponse("Not found", { status: 404 });
    }

    try {
      const archivePath = getDeliveryArchivePath(token);
      const buffer = await fs.readFile(archivePath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": buildAttachmentHeader(`${bundle.game.slug}.zip`),
        },
      });
    } catch {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const photo = bundle.photos.find((entry) => entry.id === asset);

  if (!photo) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const originalPath = getOriginalPath(bundle.game.slug, photo.originalFilename);
    const buffer = await fs.readFile(originalPath);
    const extension = path.extname(photo.originalFilename).toLowerCase();
    const contentType =
      extension === ".png"
        ? "image/png"
        : extension === ".webp"
          ? "image/webp"
          : "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": buildAttachmentHeader(photo.originalName),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
