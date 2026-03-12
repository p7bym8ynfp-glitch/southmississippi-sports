import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/config";

export const runtime = "nodejs";

export async function GET() {
  const response = NextResponse.redirect(new URL("/admin/login", getAppUrl()));
  response.headers.set(
    "Clear-Site-Data",
    '"cache", "storage", "executionContexts"',
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
