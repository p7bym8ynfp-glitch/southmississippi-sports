import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isAdminRequest } from "@/lib/auth";
import { saveUploadedPhoto } from "@/lib/media";
import { addPhotosToGame, readStore } from "@/lib/store";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

function uniqueSlug(baseSlug: string, existingSlugs: Set<string>) {
  let candidate = baseSlug;
  let counter = 2;

  while (existingSlugs.has(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const formData = await request.formData();
  const existingGameSlug = String(formData.get("existingGameSlug") ?? "").trim() || undefined;
  const title = String(formData.get("title") ?? "").trim();
  const sport = String(formData.get("sport") ?? "").trim();
  const opponent = String(formData.get("opponent") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const published = formData.get("published") === "on";

  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return NextResponse.redirect(
      new URL("/admin?error=Select%20at%20least%20one%20image", request.url),
    );
  }

  if (!existingGameSlug && !title) {
    return NextResponse.redirect(
      new URL("/admin?error=Enter%20a%20game%20title%20for%20new%20folders", request.url),
    );
  }

  if (files.some((file) => !file.type.startsWith("image/"))) {
    return NextResponse.redirect(
      new URL("/admin?error=Only%20image%20uploads%20are%20supported", request.url),
    );
  }

  const store = await readStore();
  const uploadGameSlug = existingGameSlug
    ? existingGameSlug
    : uniqueSlug(
        slugify(title) || "game-gallery",
        new Set(store.games.map((game) => game.slug)),
      );

  const uploadedPhotos = [];

  for (const file of files) {
    uploadedPhotos.push(await saveUploadedPhoto(uploadGameSlug, file));
  }

  const { game } = await addPhotosToGame({
    existingGameSlug,
    title,
    sport,
    opponent,
    location,
    description,
    date,
    published,
    uploadedPhotos,
  });

  return NextResponse.redirect(
    new URL(`/admin?uploaded=${uploadedPhotos.length}&game=${game.slug}`, request.url),
  );
}
