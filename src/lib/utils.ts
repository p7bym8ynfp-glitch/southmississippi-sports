import { pricing } from "@/lib/config";

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function safeFileBase(value: string) {
  return slugify(value || "photo") || "photo";
}

export function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

export function formatGameDate(date: string) {
  if (!date) {
    return "Date coming soon";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function padPhotoNumber(value: number) {
  return String(value).padStart(3, "0");
}

export function sortByDateDesc<T extends { date: string; createdAt: string }>(
  values: T[],
) {
  return [...values].sort((left, right) => {
    const rightDate = new Date(right.date || right.createdAt).getTime();
    const leftDate = new Date(left.date || left.createdAt).getTime();
    return rightDate - leftDate;
  });
}

export function priceLabel(kind: "single" | "folder") {
  return formatMoney(
    kind === "single" ? pricing.singlePhotoCents : pricing.fullGameCents,
  );
}
