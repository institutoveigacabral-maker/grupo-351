import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const SHARE_TOKEN = process.env.REUNIOES_TOKEN || "r351-gov-2026";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token !== SHARE_TOKEN) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  const filepath = join(process.cwd(), "data", "reunioes-roadmaps.json");
  const raw = readFileSync(filepath, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}
