import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  getAdminCookieValue,
  validateAdminPassword,
} from "@/lib/auth";
import { getAppUrl, hasAdminPassword } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const appUrl = getAppUrl();

  if (!hasAdminPassword()) {
    return NextResponse.redirect(
      new URL("/admin/login?error=Set%20ADMIN_PASSWORD%20first", appUrl),
    );
  }

  if (!validateAdminPassword(password)) {
    return NextResponse.redirect(
      new URL("/admin/login?error=Incorrect%20password", appUrl),
    );
  }

  const response = NextResponse.redirect(new URL("/admin", appUrl));
  response.cookies.set(ADMIN_COOKIE_NAME, getAdminCookieValue(), adminCookieOptions);
  return response;
}
