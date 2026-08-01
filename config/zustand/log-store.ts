import { create } from "zustand";

export type LogLevel = "info" | "success" | "warn" | "error" | "debug";

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

const TERMINAL_DEBUG_ENV = process.env.NEXT_PUBLIC_TERMINAL_DEBUG;
export const TERMINAL_DEBUG_ENABLED = TERMINAL_DEBUG_ENV === "true";

const LOG_STORAGE_KEY = "aether_terminal_logs";
const MAX_LOG_ENTRIES = 200;

/** Server-safe id generator (avoids crypto.randomUUID on non-secure contexts). */
function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Load persisted logs (client-only). */
function loadLogs(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface LogState {
  enabled: boolean;
  logs: LogEntry[];
  addLog: (
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ) => void;
  clearLogs: () => void;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

export const useLogStore = create<LogState>((set, get) => ({
  enabled: TERMINAL_DEBUG_ENABLED,
  logs: TERMINAL_DEBUG_ENABLED ? loadLogs() : [],

  addLog: (level, message, context) => {
    if (!get().enabled) return;

    const entry: LogEntry = {
      id: makeId(),
      timestamp: Date.now(),
      level,
      message,
      context,
    };

    set((state) => ({
      logs: [...state.logs, entry].slice(-MAX_LOG_ENTRIES),
    }));

    // Debounced persistence so rapid progress logs don't thrash localStorage
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      try {
        window.localStorage.setItem(
          LOG_STORAGE_KEY,
          JSON.stringify(get().logs.slice(-MAX_LOG_ENTRIES)),
        );
      } catch {
        // localStorage may be full/unavailable — ignore
      }
    }, 300);
  },

  clearLogs: () => {
    set({ logs: [] });
    try {
      window.localStorage.removeItem(LOG_STORAGE_KEY);
    } catch {
      // ignore
    }
  },
}));
