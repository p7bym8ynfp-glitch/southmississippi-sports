export type ProductKind = "single" | "folder";

export type Game = {
  id: string;
  slug: string;
  title: string;
  sport: string;
  opponent: string;
  location: string;
  description: string;
  date: string;
  coverPhotoId?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Photo = {
  id: string;
  gameId: string;
  originalName: string;
  originalFilename: string;
  previewFilename: string;
  width: number;
  height: number;
  sortOrder: number;
  createdAt: string;
};

export type OrderStatus = "fulfilled";

export type Order = {
  id: string;
  stripeSessionId: string;
  kind: ProductKind;
  status: OrderStatus;
  gameId: string;
  photoIds: string[];
  email: string;
  customerName?: string;
  amountCents: number;
  deliveryToken: string;
  expiresAt: string;
  createdAt: string;
  fulfilledAt?: string;
};

export type StoreData = {
  games: Game[];
  photos: Photo[];
  orders: Order[];
};

export type UploadedPhotoInput = {
  originalName: string;
  originalFilename: string;
  previewFilename: string;
  width: number;
  height: number;
};
