import { NextResponse } from "next/server";
import { getReuniaoDataset, upsertReuniaoDataset } from "@/lib/db";

const SHARE_TOKEN = process.env.REUNIOES_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== SHARE_TOKEN) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }
  const data = await getReuniaoDataset("kanban");
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== SHARE_TOKEN) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }
  const body = await request.json();
  await upsertReuniaoDataset("kanban", body);
  return NextResponse.json({ ok: true });
}
