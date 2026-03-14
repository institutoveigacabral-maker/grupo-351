import { NextResponse } from "next/server";
import { getReuniaoDataset } from "@/lib/db";

const SHARE_TOKEN = process.env.REUNIOES_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token !== SHARE_TOKEN) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  const data = await getReuniaoDataset("analise");
  return NextResponse.json(data);
}
