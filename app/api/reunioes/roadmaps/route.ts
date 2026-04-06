import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getReuniaoDataset } from "@/lib/db";

const SHARE_TOKEN = process.env.REUNIOES_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token || !SHARE_TOKEN) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  const actual = crypto.createHash('sha256').update(token).digest();
  const expected = crypto.createHash('sha256').update(SHARE_TOKEN).digest();

  if (!crypto.timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  const data = await getReuniaoDataset("roadmaps");
  return NextResponse.json(data);
}
