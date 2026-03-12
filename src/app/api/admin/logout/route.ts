import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME } from "@/lib/auth";
import { getAppUrl } from "@/lib/config";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.redirect(new URL("/admin/login", getAppUrl()));
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
