import { createReadStream } from "fs";
import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";

import { getDeliveryArchivePath, getOriginalPath } from "@/lib/media";
import { getOrderBundleByToken } from "@/lib/orders";

export const runtime = "nodejs";

function buildAttachmentHeader(filename: string) {
  return `attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

function streamFile(filePath: string): ReadableStream {
  const nodeStream = createReadStream(filePath);
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk as Buffer)));
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      nodeStream.destroy();
    },
  });
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
      const stat = await fs.stat(archivePath);
      const stream = streamFile(archivePath);
      
      return new NextResponse(stream, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": buildAttachmentHeader(`${bundle.game.slug}.zip`),
          "Content-Length": stat.size.toString(),
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
    const stat = await fs.stat(originalPath);
    const stream = streamFile(originalPath);
    
    const extension = path.extname(photo.originalFilename).toLowerCase();
    const contentType =
      extension === ".png"
        ? "image/png"
        : extension === ".webp"
          ? "image/webp"
          : "image/jpeg";

    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": buildAttachmentHeader(photo.originalName),
        "Content-Length": stat.size.toString(),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
