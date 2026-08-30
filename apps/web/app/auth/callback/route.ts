import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/today";
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
