/**
 * Structured logger for ZHOLY.
 * Outputs JSON-compatible lines to stdout so systemd/journald can ingest them.
 *
 * Usage:
 *   log.info("request", { method, path, status, durationMs, userId });
 *   log.error("db_error", { error: e.message, query });
 */

type Level = "info" | "warn" | "error" | "debug";

function emit(level: Level, event: string, data: Record<string, unknown> = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    service: "zholy-app",
    ...data,
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const log = {
  info: (event: string, data?: Record<string, unknown>) => emit("info", event, data),
  warn: (event: string, data?: Record<string, unknown>) => emit("warn", event, data),
  error: (event: string, data?: Record<string, unknown>) => emit("error", event, data),
  debug: (event: string, data?: Record<string, unknown>) => {
    if (process.env.LOG_LEVEL === "debug") emit("debug", event, data);
  },
};

/** Generate a short random request ID. */
export function newRequestId(): string {
  return Math.random().toString(36).slice(2, 10);
}
