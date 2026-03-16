import { z } from "zod";

/**
 * Runtime environment validation.
 * Fails fast at startup if critical env vars are missing.
 */

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ADMIN_SECRET: z.string().min(16, "ADMIN_SECRET must be at least 16 characters"),

  // Email
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  ADMIN_NOTIFICATION_EMAIL: z.string().email().optional(),

  // AI
  AI_PROVIDER: z.enum(["google", "anthropic", "openai"]).optional(),
  GOOGLE_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().optional(),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function validateEnv() {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");

    console.error("─── Environment validation failed ───");
    console.error(formatted);
    console.error("────────────────────────────────────");

    // In production, fail hard. In dev, warn only.
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing or invalid environment variables:\n${formatted}`);
    }
  }

  return parsed.success ? parsed.data : (process.env as unknown as ServerEnv);
}

/** Validated server environment. Access via `env.DATABASE_URL` etc. */
export const env = validateEnv();
