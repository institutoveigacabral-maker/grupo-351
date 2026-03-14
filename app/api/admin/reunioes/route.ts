import { NextResponse } from "next/server";
import { getReuniaoDataset } from "@/lib/db";

export async function GET() {
  const data = await getReuniaoDataset("reunioes");
  return NextResponse.json(data);
}
