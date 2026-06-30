// src/api/client.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * apiClient — Cliente HTTP genérico con autenticación
 * ═══════════════════════════════════════════════════════════════
 *
 * Envuelve fetch con inyección automática del token JWT desde
 * authStore, serialización JSON y manejo centralizado de errores.
 * Lanza ApiError con status code para respuestas no-ok.
 *
 * Capa: service (API client)
 * Dependencias: authStore, fetch API
 * Exporta: apiClient<T>, ApiError
 *
 * @module apiClient
 */
import { useAuthStore } from "../shared/store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface RequestOptions extends Omit<RequestInit, "body" | "signal"> {
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  // 👇 token directamente desde el store de Zustand (sin importar React)
  const token = useAuthStore.getState().token;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (options.signal?.aborted) {
    throw new DOMException("Request aborted", "AbortError");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || "Error desconocido");
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
