import { createHash, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { getAdminPassword } from "@/lib/config";

export const ADMIN_COOKIE_NAME = "smsports-admin";

function hashValue(value: string) {
  return createHash("sha256").update(`southmsports:${value}`).digest("hex");
}

export function validateAdminPassword(password: string) {
  const expected = getAdminPassword();

  if (!expected) {
    return false;
  }

  const provided = Buffer.from(hashValue(password));
  const actual = Buffer.from(hashValue(expected));

  return provided.length === actual.length && timingSafeEqual(provided, actual);
}

export function getAdminCookieValue() {
  const password = getAdminPassword();
  return password ? hashValue(password) : "";
}

export function isValidAdminCookieValue(value?: string | null) {
  const expected = getAdminCookieValue();

  if (!expected || !value) {
    return false;
  }

  const provided = Buffer.from(value);
  const actual = Buffer.from(expected);

  return provided.length === actual.length && timingSafeEqual(provided, actual);
}

export async function isAdminSession() {
  const cookieStore = await cookies();
  return isValidAdminCookieValue(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export function isAdminRequest(request: NextRequest) {
  return isValidAdminCookieValue(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
