/**
 * Structured logging utility.
 * Centralizes all production logging with consistent format.
 * Easy to swap for Pino/Winston/Sentry later.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function formatEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const ctx = entry.context ? ` [${entry.context}]` : "";
  const data = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
  return `${prefix}${ctx} ${entry.message}${data}`;
}

function createEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };
}

export const logger = {
  info(message: string, context?: string, data?: Record<string, unknown>) {
    const entry = createEntry("info", message, context, data);
    console.log(formatEntry(entry));
  },

  warn(message: string, context?: string, data?: Record<string, unknown>) {
    const entry = createEntry("warn", message, context, data);
    console.warn(formatEntry(entry));
  },

  error(message: string, context?: string, data?: Record<string, unknown>) {
    const entry = createEntry("error", message, context, data);
    console.error(formatEntry(entry));
  },
};
