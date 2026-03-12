import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SHARE_TOKEN = process.env.REUNIOES_TOKEN || "r351-gov-2026";
const filepath = join(process.cwd(), "data", "reunioes-kanban.json");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== SHARE_TOKEN) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }
  const raw = readFileSync(filepath, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== SHARE_TOKEN) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }
  const body = await request.json();
  writeFileSync(filepath, JSON.stringify(body, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
