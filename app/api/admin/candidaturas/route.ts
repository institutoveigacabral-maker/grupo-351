import { NextResponse } from "next/server";
import { getCandidaturas } from "@/lib/db";

export async function GET() {
  const data = await getCandidaturas();
  return NextResponse.json(data);
}
