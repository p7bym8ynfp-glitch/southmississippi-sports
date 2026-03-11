import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
