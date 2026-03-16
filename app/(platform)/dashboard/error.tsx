"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function DashboardError({
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
    <div className="flex items-center justify-center h-64">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-red-100 flex items-center justify-center">
          <span className="text-lg text-red-600 font-bold">!</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Erro na página</h2>
          <p className="text-sm text-muted mt-1">
            Não foi possível carregar esta secção.
          </p>
        </div>
        <button
          onClick={reset}
          className="px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
