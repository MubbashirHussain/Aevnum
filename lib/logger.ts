import { TERMINAL_DEBUG_ENABLED, useLogStore, type LogLevel } from "@/config/zustand/log-store";

/**
 * Terminal debug logger.
 *
 * Enable it with one env var:
 *
 *   # .env.local
 *   NEXT_PUBLIC_TERMINAL_DEBUG=true   # shows the staging terminal UI + logs (default: off)
 *
 * When disabled (or unset) every call is a no-op and nothing renders.
 */
export function getTerminalEnabled(): boolean {
  return TERMINAL_DEBUG_ENABLED;
}

export function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): void {
  if (!TERMINAL_DEBUG_ENABLED) return;

  useLogStore.getState().addLog(level, message, context);

  const consoleFn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : level === "debug"
          ? console.debug
          : level === "success"
            ? console.info
            : console.log;

  consoleFn(`[terminal:${level}] ${message}`, context ?? "");
}

export const logInfo = (message: string, context?: Record<string, unknown>) =>
  log("info", message, context);

export const logSuccess = (message: string, context?: Record<string, unknown>) =>
  log("success", message, context);

export const logWarn = (message: string, context?: Record<string, unknown>) =>
  log("warn", message, context);

export const logError = (message: string, context?: Record<string, unknown>) =>
  log("error", message, context);

export const logDebug = (message: string, context?: Record<string, unknown>) =>
  log("debug", message, context);
