import { NextResponse } from "next/server";

/**
 * Standardized API response helpers.
 * All API routes should use these instead of raw NextResponse.json().
 */

/** Success response (200) */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Created response (201) */
export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

/** No content (204) */
export function noContent() {
  return new NextResponse(null, { status: 204 });
}

/** Validation error (400) — never expose Zod internals */
export function badRequest(message = "Dados invalidos") {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Extract first human-readable validation message from Zod error */
export function validationMessage(zodError: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }): string {
  const fields = zodError.flatten().fieldErrors;
  const first = Object.entries(fields).find(([, msgs]) => msgs && msgs.length > 0);
  if (first) return `Campo "${first[0]}" invalido`;
  return "Dados invalidos";
}

/** Unauthorized (401) */
export function unauthorized(message = "Nao autorizado") {
  return NextResponse.json({ error: message }, { status: 401 });
}

/** Forbidden (403) */
export function forbidden(message = "Sem permissao", extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status: 403 });
}

/** Not found (404) */
export function notFound(message = "Recurso nao encontrado") {
  return NextResponse.json({ error: message }, { status: 404 });
}

/** Rate limited (429) */
export function tooManyRequests(message = "Muitas requisicoes. Tente novamente em breve.") {
  return NextResponse.json({ error: message }, { status: 429 });
}

/** Server error (500) — never expose internal details */
export function serverError(message = "Erro interno") {
  return NextResponse.json({ error: message }, { status: 500 });
}

/** Safe JSON parse — returns null instead of throwing */
export async function safeJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
