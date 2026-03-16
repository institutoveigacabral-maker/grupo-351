"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center">
          <span className="text-2xl text-red-600 font-bold">!</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Algo correu mal</h1>
          <p className="text-sm text-muted mt-2">
            Ocorreu um erro inesperado. A equipa foi notificada.
          </p>
          {error.digest && (
            <p className="text-xs text-muted/60 mt-1 font-mono">
              Ref: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
