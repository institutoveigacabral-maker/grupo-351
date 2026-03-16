import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    profilesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    beforeSend(event) {
      // Strip sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((b) => {
          if (b.data?.url) {
            try {
              const url = new URL(b.data.url);
              url.searchParams.delete("token");
              url.searchParams.delete("key");
              b.data.url = url.toString();
            } catch {
              // ignore invalid URLs
            }
          }
          return b;
        });
      }
      return event;
    },
  });
}
