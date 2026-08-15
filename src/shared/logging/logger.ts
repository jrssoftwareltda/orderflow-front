export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "silent";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: Exclude<LogLevel, "silent">;
  scope: string;
  message: string;
  data?: unknown;
}

type LogListener = (entry: LogEntry) => void;

const levelWeight: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 100,
};

const configuredLevel = normalizeLevel(import.meta.env.VITE_LOG_LEVEL);
const debugApi = String(import.meta.env.VITE_DEBUG_API).toLowerCase() === "true";
const debugUi = String(import.meta.env.VITE_DEBUG_UI).toLowerCase() === "true";
const listeners = new Set<LogListener>();
const buffer: LogEntry[] = [];
const MAX_ENTRIES = 200;

function normalizeLevel(value: unknown): LogLevel {
  const normalized = String(value || "info").toLowerCase() as LogLevel;
  return normalized in levelWeight ? normalized : "info";
}

function id(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function shouldLog(level: Exclude<LogLevel, "silent">): boolean {
  return levelWeight[level] >= levelWeight[configuredLevel];
}

function emit(level: Exclude<LogLevel, "silent">, scope: string, message: string, data?: unknown): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    id: id(),
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    data,
  };

  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer.shift();
  listeners.forEach((listener) => listener(entry));

  const method = level === "trace" ? "debug" : level;
  const prefix = `[OrderFlow][${scope}] ${message}`;
  if (data === undefined) {
    console[method](prefix);
  } else {
    console[method](prefix, data);
  }
}

export const logger = {
  level: configuredLevel,
  debugApi,
  debugUi,
  trace: (scope: string, message: string, data?: unknown) => emit("trace", scope, message, data),
  debug: (scope: string, message: string, data?: unknown) => emit("debug", scope, message, data),
  info: (scope: string, message: string, data?: unknown) => emit("info", scope, message, data),
  warn: (scope: string, message: string, data?: unknown) => emit("warn", scope, message, data),
  error: (scope: string, message: string, data?: unknown) => emit("error", scope, message, data),
  subscribe(listener: LogListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  entries(): LogEntry[] {
    return [...buffer];
  },
};

export function installGlobalErrorLogging(): void {
  window.addEventListener("error", (event) => {
    logger.error("browser", "Unhandled window error", {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error instanceof Error ? event.error.stack : event.error,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logger.error("browser", "Unhandled promise rejection", {
      reason: event.reason instanceof Error ? event.reason.stack : event.reason,
    });
  });
}
