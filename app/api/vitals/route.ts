import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, value, rating, id, page } = body;

    if (!name || value === undefined) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    logger.info(
      `${name}=${Math.round(value)}ms (${rating || "n/a"})`,
      "web-vitals",
      { name, value, rating, id, page },
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
