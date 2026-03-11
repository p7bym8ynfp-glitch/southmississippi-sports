import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  getAdminCookieValue,
  validateAdminPassword,
} from "@/lib/auth";
import { hasAdminPassword } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!hasAdminPassword()) {
    return NextResponse.redirect(
      new URL("/admin/login?error=Set%20ADMIN_PASSWORD%20first", request.url),
    );
  }

  if (!validateAdminPassword(password)) {
    return NextResponse.redirect(
      new URL("/admin/login?error=Incorrect%20password", request.url),
    );
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(ADMIN_COOKIE_NAME, getAdminCookieValue(), adminCookieOptions);
  return response;
}
