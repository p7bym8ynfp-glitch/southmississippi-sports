import { createWriteStream } from "fs";
import { promises as fs } from "fs";
import path from "path";

import archiver from "archiver";
import sharp, { type OverlayOptions } from "sharp";

import { getStorageDirectory, getWatermarkLabel } from "@/lib/config";
import type { Game, Photo } from "@/lib/types";
import { padPhotoNumber, safeFileBase } from "@/lib/utils";

const storageRoot = path.resolve(process.cwd(), getStorageDirectory());
const originalsRoot = path.join(storageRoot, "originals");
const previewsRoot = path.join(storageRoot, "previews");
const deliveriesRoot = path.join(storageRoot, "deliveries");
const watermarkPath = path.join(storageRoot, "watermark.png");
const fallbackWatermarkPath = path.join(process.cwd(), "public", "watermark.png");
const supportedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const supportedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
]);

export function isSupportedUploadFile(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  const mimeType = file.type.toLowerCase();

  return supportedImageExtensions.has(extension) || supportedImageMimeTypes.has(mimeType);
}

function normalizeExtension(extension: string) {
  const normalized = extension.toLowerCase();
  return normalized || ".jpg";
}

async function ensureStorageDirectories() {
  await Promise.all([
    fs.mkdir(storageRoot, { recursive: true }),
    fs.mkdir(originalsRoot, { recursive: true }),
    fs.mkdir(previewsRoot, { recursive: true }),
    fs.mkdir(deliveriesRoot, { recursive: true }),
  ]);
}

function getTextWatermarkOverlay(width: number, height: number, hideRepeatingText = false) {
  const label = getWatermarkLabel();

  return Buffer.from(
    `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="wm" width="420" height="240" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
            <text
              x="16"
              y="120"
              fill="rgba(255,255,255,${hideRepeatingText ? "0" : "0.28"})"
              font-size="32"
              font-family="Impact, Haettenschweiler, Arial Narrow Bold, sans-serif"
              letter-spacing="4"
            >
              ${label}
            </text>
          </pattern>
        </defs>
        ${!hideRepeatingText ? `<rect x="0" y="0" width="${width}" height="${height}" fill="rgba(5, 13, 24, 0.08)" />` : ""}
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#wm)" />
        <rect x="${width / 2 - Math.min(width - 64, 480) / 2}" y="${height - 92}" width="${Math.min(width - 64, 480)}" height="54" rx="14" fill="rgba(5,13,24,0.58)" />
        <text
          x="${width / 2 - 96}"
          y="${height - 56}"
          fill="white"
          font-size="24"
          font-family="Aptos, Trebuchet MS, sans-serif"
          letter-spacing="2"
        >
          PREVIEW ONLY
        </text>
      </svg>
    `,
  );
}

async function getWatermarkLayers(
  width: number,
  height: number,
): Promise<OverlayOptions[]> {
  try {
    let finalWatermarkPath = watermarkPath;
    
    try {
      await fs.access(watermarkPath);
    } catch {
      await fs.access(fallbackWatermarkPath);
      finalWatermarkPath = fallbackWatermarkPath;
    }
    
    // Custom watermark logo (QR Code)
    const watermark = await sharp(finalWatermarkPath)
      .resize({
        width: Math.max(380, Math.floor(width * 0.50)), // Larger size
        withoutEnlargement: true,
      })
      .png()
      .ensureAlpha(0.45) // Better visibility
      .toBuffer();

    return [
      { input: getTextWatermarkOverlay(width, height, true) }, // Text layer (banner only)
      { input: watermark, gravity: "center" } // Centered Logo
    ];
  } catch {
    // Fallback to repeating text pattern
    return [{ input: getTextWatermarkOverlay(width, height, false) }];
  }
}

export async function saveUploadedPhoto(gameSlug: string, file: File) {
  await ensureStorageDirectories();

  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  const originalExtension = normalizeExtension(path.extname(file.name));
  const originalBase = safeFileBase(path.basename(file.name, originalExtension));
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  const originalFilename = `${stamp}-${originalBase}${originalExtension}`;
  const previewFilename = `${stamp}-${originalBase}.webp`;

  const originalsDirectory = path.join(originalsRoot, gameSlug);
  const previewsDirectory = path.join(previewsRoot, gameSlug);
  const originalPath = path.join(originalsDirectory, originalFilename);
  const previewPath = path.join(previewsDirectory, previewFilename);

  await Promise.all([
    fs.mkdir(originalsDirectory, { recursive: true }),
    fs.mkdir(previewsDirectory, { recursive: true }),
  ]);

  await fs.writeFile(originalPath, bytes);

  const image = sharp(bytes).rotate();
  let metadata;

  try {
    metadata = await image.metadata();
  } catch {
    throw new Error(
      `Unsupported image "${file.name}". Use JPG, PNG, WebP, or TIFF files.`,
    );
  }

  const width = metadata.width ?? 1600;
  const height = metadata.height ?? 900;
  const targetWidth = Math.min(width, 2200);
  const targetHeight =
    width > targetWidth ? Math.round(height * (targetWidth / width)) : height;

  await image
    .resize({ width: targetWidth, withoutEnlargement: true })
    .composite(await getWatermarkLayers(targetWidth, targetHeight))
    .webp({ quality: 82 })
    .toFile(previewPath);

  return {
    originalName: file.name,
    originalFilename,
    previewFilename,
    width,
    height,
  };
}

export function getOriginalPath(gameSlug: string, filename: string) {
  return path.join(originalsRoot, gameSlug, filename);
}

export function getPreviewPath(gameSlug: string, filename: string) {
  return path.join(previewsRoot, gameSlug, filename);
}

export async function deleteGameMedia(gameSlug: string) {
  await Promise.all([
    fs.rm(path.join(originalsRoot, gameSlug), { recursive: true, force: true }),
    fs.rm(path.join(previewsRoot, gameSlug), { recursive: true, force: true }),
  ]);
}

export async function deletePhotoMedia(gameSlug: string, originalFilename: string, previewFilename: string) {
  try {
    await Promise.all([
      fs.rm(path.join(originalsRoot, gameSlug, originalFilename), { force: true }),
      fs.rm(path.join(previewsRoot, gameSlug, previewFilename), { force: true }),
    ]);
  } catch {
    // Ignore if already deleted
  }
}

export function getDeliveryArchivePath(token: string) {
  return path.join(deliveriesRoot, `${token}.zip`);
}

export async function createGameArchive(
  deliveryToken: string,
  game: Game,
  photos: Photo[],
) {
  await ensureStorageDirectories();
  const archivePath = getDeliveryArchivePath(deliveryToken);

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(archivePath);
    const archive = archiver("zip", {
      zlib: { level: 0 }, // JPEGs are already compressed. Level 9 causes OOM on small instances.
    });

    output.on("close", () => resolve());
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);

    for (const photo of [...photos].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    )) {
      const originalPath = getOriginalPath(game.slug, photo.originalFilename);
      const originalExtension =
        path.extname(photo.originalName) || path.extname(photo.originalFilename);

      archive.file(originalPath, {
        name: `${padPhotoNumber(photo.sortOrder)}-${safeFileBase(
          path.basename(photo.originalName, originalExtension),
        )}${originalExtension || ".jpg"}`,
      });
    }

    void archive.finalize();
  });

  return archivePath;
}

export async function getFileSize(filePath: string) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

export async function hasWatermarkImage() {
  try {
    await fs.access(watermarkPath);
    return true;
  } catch {
    return false;
  }
}

export function getWatermarkPath() {
  return watermarkPath;
}
