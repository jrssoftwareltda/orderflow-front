import { logger } from "@/shared/logging/logger";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly path: string,
    public readonly correlationId?: string,
    public readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface HttpOptions extends RequestInit {
  timeoutMs?: number;
}

function createCorrelationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => undefined);
  }
  return response.text().catch(() => undefined);
}

function errorMessage(status: number, body: unknown): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const value = record.message ?? record.error ?? record.detail;
    if (typeof value === "string" && value.trim()) return value;
  }
  if (typeof body === "string" && body.trim()) return body.slice(0, 500);
  return `Request failed with status ${status}`;
}

export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const correlationId = createCorrelationId();
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 15_000;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Correlation-Id", correlationId);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  logger.debug("api", "HTTP request started", {
    method,
    path,
    correlationId,
    timeoutMs,
    ...(logger.debugApi ? { body: options.body } : {}),
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const body = await parseBody(response);
    const responseCorrelationId = response.headers.get("X-Correlation-Id") ?? correlationId;
    const durationMs = Math.round(performance.now() - startedAt);

    if (!response.ok) {
      logger.error("api", "HTTP request failed", {
        method,
        path,
        status: response.status,
        durationMs,
        correlationId: responseCorrelationId,
        body,
      });
      throw new ApiError(
        errorMessage(response.status, body),
        response.status,
        path,
        responseCorrelationId,
        body,
      );
    }

    logger.debug("api", "HTTP request completed", {
      method,
      path,
      status: response.status,
      durationMs,
      correlationId: responseCorrelationId,
      ...(logger.debugApi ? { body } : {}),
    });

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const durationMs = Math.round(performance.now() - startedAt);
    if (error instanceof DOMException && error.name === "AbortError") {
      logger.error("api", "HTTP request timed out", { method, path, timeoutMs, durationMs, correlationId });
      throw new ApiError(`Request timed out after ${timeoutMs}ms`, 0, path, correlationId);
    }

    logger.error("api", "HTTP request could not reach backend", {
      method,
      path,
      durationMs,
      correlationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new ApiError("Unable to reach the OrderFlow API Gateway", 0, path, correlationId);
  } finally {
    window.clearTimeout(timeout);
  }
}

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
