import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { getDataDirectory } from "@/lib/config";
import type { Game, Order, Photo, StoreData, UploadedPhotoInput } from "@/lib/types";
import { slugify, sortByDateDesc } from "@/lib/utils";

const dataDirectory = path.resolve(process.cwd(), getDataDirectory());
const storePath = path.join(dataDirectory, "store.json");

const emptyStore: StoreData = {
  games: [],
  photos: [],
  orders: [],
};

async function ensureStoreFile() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    await writeStore(emptyStore);
  }
}

export async function readStore() {
  await ensureStoreFile();
  try {
    const raw = await fs.readFile(storePath, "utf8");
    if (raw.trim().length === 0) return structuredClone(emptyStore);
    
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      games: parsed.games || [],
      photos: parsed.photos || [],
      orders: parsed.orders || [],
    } as StoreData;
  } catch (error) {
    // If exact parsing fails (e.g. corrupted JSON string), fallback to empty store to prevent permanent 500 crashes
    console.error("Corrupted store.json detected. Falling back to empty store.", error);
    return structuredClone(emptyStore);
  }
}

export async function writeStore(store: StoreData) {
  await fs.mkdir(dataDirectory, { recursive: true });
  const tempPath = `${storePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tempPath, storePath);
}

// Global Mutex for atomic store updates
let storeLock = Promise.resolve();

async function updateStore<T>(mutator: (store: StoreData) => T | Promise<T>): Promise<T> {
  const release = await new Promise<() => void>((resolve) => {
    storeLock = storeLock.then(() => {
      resolve(() => {});
      return new Promise((r) => setTimeout(r, 0)); // Yield to event loop
    });
  });

  try {
    const store = await readStore();
    const result = await mutator(store);
    await writeStore(store);
    return result;
  } finally {
    release();
  }
}

export async function listGames(options?: { publishedOnly?: boolean }) {
  const publishedOnly = options?.publishedOnly ?? true;
  const store = await readStore();

  return sortByDateDesc(
    store.games.filter((game) => (publishedOnly ? game.published : true)),
  );
}

export async function getGameBySlug(
  slug: string,
  options?: { includeUnpublished?: boolean },
) {
  const store = await readStore();
  const game = store.games.find((entry) => entry.slug === slug);

  if (!game) {
    return null;
  }

  if (!options?.includeUnpublished && !game.published) {
    return null;
  }

  return game;
}

export async function getGameById(id: string) {
  const store = await readStore();
  return store.games.find((entry) => entry.id === id) ?? null;
}

export async function listPhotosForGame(gameId: string) {
  const store = await readStore();
  return [...store.photos]
    .filter((photo) => photo.gameId === gameId)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function getPhotoById(id: string) {
  const store = await readStore();
  return store.photos.find((entry) => entry.id === id) ?? null;
}

export async function getGameWithPhotosBySlug(
  slug: string,
  options?: { includeUnpublished?: boolean },
) {
  const game = await getGameBySlug(slug, options);

  if (!game) {
    return null;
  }

  const photos = await listPhotosForGame(game.id);
  return { game, photos };
}

export async function listAdminGames() {
  return listGames({ publishedOnly: false });
}

export async function getAdminGameSummaries() {
  const store = await readStore();
  const games = sortByDateDesc(store.games);

  return games.map((game) => ({
    game,
    photoCount: store.photos.filter((photo) => photo.gameId === game.id).length,
    orderCount: store.orders.filter((order) => order.gameId === game.id).length,
  }));
}

export async function getCatalogStats() {
  const store = await readStore();

  return {
    publishedGames: store.games.filter((game) => game.published).length,
    totalPhotos: store.photos.length,
  };
}

function createUniqueSlug(baseSlug: string, existingSlugs: Set<string>) {
  let candidate = baseSlug;
  let counter = 2;

  while (existingSlugs.has(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export async function addPhotosToGame(input: {
  existingGameSlug?: string;
  title?: string;
  sport?: string;
  opponent?: string;
  location?: string;
  description?: string;
  date?: string;
  published: boolean;
  uploadedPhotos: UploadedPhotoInput[];
}) {
  const store = await readStore();
  const now = new Date().toISOString();

  const existingGame = input.existingGameSlug
    ? store.games.find((entry) => entry.slug === input.existingGameSlug)
    : undefined;

  let game: Game;

  if (!existingGame) {
    const fallbackTitle = input.title?.trim() || "Game Gallery";
    const existingSlugs = new Set(store.games.map((entry) => entry.slug));
    const baseSlug = slugify(fallbackTitle) || "game-gallery";

    game = {
      id: randomUUID(),
      slug: createUniqueSlug(baseSlug, existingSlugs),
      title: fallbackTitle,
      sport: input.sport?.trim() || "Sports",
      opponent: input.opponent?.trim() || "",
      location: input.location?.trim() || "",
      description: input.description?.trim() || "",
      date: input.date?.trim() || now.slice(0, 10),
      published: input.published,
      createdAt: now,
      updatedAt: now,
    };

    store.games.push(game);
  } else {
    game = {
      ...existingGame,
      title: input.title?.trim() || existingGame.title,
      sport: input.sport?.trim() || existingGame.sport,
      opponent: input.opponent?.trim() || existingGame.opponent,
      location: input.location?.trim() || existingGame.location,
      description: input.description?.trim() || existingGame.description,
      date: input.date?.trim() || existingGame.date,
      published: input.published,
      updatedAt: now,
    };

    store.games = store.games.map((entry) =>
      entry.id === game.id ? game : entry,
    );
  }

  const lastSortOrder = store.photos
    .filter((photo) => photo.gameId === game.id)
    .reduce((highest, photo) => Math.max(highest, photo.sortOrder), 0);

  const photos: Photo[] = input.uploadedPhotos.map((photo, index) => ({
    id: randomUUID(),
    gameId: game.id,
    originalName: photo.originalName,
    originalFilename: photo.originalFilename,
    previewFilename: photo.previewFilename,
    width: photo.width,
    height: photo.height,
    sortOrder: lastSortOrder + index + 1,
    createdAt: now,
  }));

  store.photos.push(...photos);

  if (!game.coverPhotoId && photos[0]) {
    game.coverPhotoId = photos[0].id;
  }

  store.games = store.games.map((entry) =>
    entry.id === game.id ? { ...game, updatedAt: now } : entry,
  );

  await writeStore(store);
  return { game, photos };
}

export async function deleteGameBySlug(slug: string) {
  return updateStore((store) => {
    const game = store.games.find((entry) => entry.slug === slug);

    if (!game) {
      return { status: "missing" as const };
    }

    const orderCount = store.orders.filter((order) => order.gameId === game.id).length;

    if (orderCount > 0) {
      return {
        status: "blocked" as const,
        game,
        orderCount,
      };
    }

    const photos = store.photos.filter((photo) => photo.gameId === game.id);

    store.games = store.games.filter((entry) => entry.id !== game.id);
    store.photos = store.photos.filter((photo) => photo.gameId !== game.id);

    return {
      status: "deleted" as const,
      game,
      photos,
    };
  });
}

export async function deletePhotoById(photoId: string) {
  return updateStore((store) => {
    const photo = store.photos.find((entry) => entry.id === photoId);

    if (!photo) {
      return { status: "missing" as const };
    }

    const orderCount = store.orders.filter(
      (order) => order.photoIds.includes(photo.id) || (order.kind === "folder" && order.gameId === photo.gameId)
    ).length;

    if (orderCount > 0) {
      return {
        status: "blocked" as const,
        photo,
        orderCount,
      };
    }

    store.photos = store.photos.filter((entry) => entry.id !== photo.id);

    return {
      status: "deleted" as const,
      photo,
    };
  });
}

export async function findOrderBySessionId(sessionId: string) {
  const store = await readStore();
  return store.orders.find((order) => order.stripeSessionId === sessionId) ?? null;
}

export async function findOrderByToken(token: string) {
  const store = await readStore();
  return store.orders.find((order) => order.deliveryToken === token) ?? null;
}

export async function createFulfilledOrder(
  input: Omit<Order, "id" | "createdAt">,
) {
  return updateStore((store) => {
    const existing = store.orders.find(
      (order) => order.stripeSessionId === input.stripeSessionId,
    );

    if (existing) {
      return existing;
    }

    const order: Order = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };

    store.orders.unshift(order);
    return order;
  });
}
