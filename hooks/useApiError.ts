"use client";

import { useState, useCallback } from "react";
import { ApiError } from "@/lib/api-client";

/** Standardized error handling for mutations */
export function useApiError() {
  const [error, setError] = useState("");

  const handleError = useCallback((err: unknown, fallback = "Erro inesperado") => {
    if (err instanceof ApiError) {
      setError(err.message);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError(fallback);
    }
  }, []);

  const clearError = useCallback(() => setError(""), []);

  return { error, setError, handleError, clearError };
}
