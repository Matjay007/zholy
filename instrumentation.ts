export async function register() {
  if (!process.env.NEXT_RUNTIME || process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.SENTRY_DSN) {
      const Sentry = await import("@sentry/nextjs");
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV ?? "production",
        tracesSampleRate: 0.1,
        ignoreErrors: [
          "ResizeObserver loop limit exceeded",
          "Non-Error exception captured",
        ],
      });
    }
  }
}

export const onRequestError = process.env.SENTRY_DSN
  ? async (err: unknown) => {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(err);
    }
  : undefined;
