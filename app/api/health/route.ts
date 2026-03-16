import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/cache";

type CheckStatus = "healthy" | "unhealthy";

interface HealthCheck {
  status: CheckStatus;
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: { status: CheckStatus; latency: number; error?: string };
    redis: { status: CheckStatus; latency: number; error?: string };
    memory: { rss: number; heapUsed: number; heapTotal: number };
  };
}

export async function GET() {
  const memoryUsage = process.memoryUsage();

  let dbStatus: CheckStatus = "healthy";
  let dbLatency = 0;
  let dbError: string | undefined;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - start;
  } catch (error) {
    dbStatus = "unhealthy";
    dbError = error instanceof Error ? error.message : "Erro desconhecido";
  }

  // Redis health check via cached() — if it works, Redis is up
  let redisStatus: CheckStatus = "healthy";
  let redisLatency = 0;
  let redisError: string | undefined;

  try {
    const start = Date.now();
    await cached("health:ping", async () => "pong", 10);
    redisLatency = Date.now() - start;
  } catch (error) {
    redisStatus = "unhealthy";
    redisError = error instanceof Error ? error.message : "Erro desconhecido";
  }

  const overallStatus: CheckStatus =
    dbStatus === "healthy" && redisStatus === "healthy" ? "healthy" : "unhealthy";

  const health: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
    checks: {
      database: {
        status: dbStatus,
        latency: dbLatency,
        ...(dbError ? { error: dbError } : {}),
      },
      redis: {
        status: redisStatus,
        latency: redisLatency,
        ...(redisError ? { error: redisError } : {}),
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
    },
  };

  return NextResponse.json(health, {
    status: overallStatus === "healthy" ? 200 : 503,
  });
}
