import { NextResponse } from "next/server";
import crypto from "crypto";
import { setAdminCookie } from "@/lib/adminAuth";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const password = body?.password || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server" },
      { status: 500 }
    );
  }

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!match) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  setAdminCookie();
  return NextResponse.json({ ok: true });
}
