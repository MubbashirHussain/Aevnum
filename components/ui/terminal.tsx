"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Minus, TerminalSquare, Trash2 } from "lucide-react";
import { useLogStore, type LogEntry, type LogLevel } from "@/config/zustand/log-store";
import { cn } from "@/lib/utils";

const COLLAPSE_STORAGE_KEY = "aether_terminal_collapsed";

const LEVEL_STYLES: Record<LogLevel, { symbol: string; className: string }> = {
  success: { symbol: "✓", className: "text-emerald-500" },
  error: { symbol: "✕", className: "text-red-500" },
  warn: { symbol: "⚠", className: "text-amber-500" },
  info: { symbol: "›", className: "text-zinc-400" },
  debug: { symbol: "…", className: "text-zinc-600 italic" },
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => n.toString().padStart(2, "0"))
    .join(":");
}

function TerminalLine({ entry }: { entry: LogEntry }) {
  const style = LEVEL_STYLES[entry.level];
  return (
    <div className="leading-relaxed break-words">
      <span className="text-zinc-600">[{formatTime(entry.timestamp)}]</span>{" "}
      <span className={cn("font-semibold", style.className)}>
        {style.symbol} {entry.level.toUpperCase()}
      </span>{" "}
      <span className="text-zinc-300">{entry.message}</span>
      {entry.context && (
        <span className="block text-zinc-600">
          {JSON.stringify(entry.context)}
        </span>
      )}
    </div>
  );
}

export function Terminal() {
  const { logs, enabled, clearLogs } = useLogStore();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    // Restore collapsed state once (client-only). Lazy initializer runs in the
    // browser after hydration, so this avoids a setState-in-effect lint error.
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest line
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs.length, collapsed]);

  if (!enabled) return null;

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleCopy = async () => {
    const text = logs
      .map(
        (entry) =>
          `[${formatTime(entry.timestamp)}] ${entry.level.toUpperCase()} ${
            entry.message
          }${entry.context ? ` ${JSON.stringify(entry.context)}` : ""}`,
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[320px] sm:w-[420px] rounded-xl border shadow-2xl overflow-hidden backdrop-blur-md bg-zinc-950/95 border-zinc-800">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/80">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/90" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90" />
        </div>
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 truncate">
          Staging://Terminal
        </span>
        <span className="ml-auto flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={clearLogs}
            title="Clear logs"
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            onClick={handleCopy}
            title="Copy logs"
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={toggleCollapsed}
            title={collapsed ? "Expand" : "Minimize"}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            {collapsed ? (
              <TerminalSquare className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div
          ref={bodyRef}
          className="max-h-64 overflow-y-auto px-3 py-2 space-y-0.5 text-[10px] font-mono bg-zinc-950"
        >
          {logs.length === 0 ? (
            <div className="text-zinc-600">&gt; awaiting commands...</div>
          ) : (
            logs.map((entry) => <TerminalLine key={entry.id} entry={entry} />)
          )}
          <div className="flex items-center gap-0.5 pt-0.5">
            <span className="text-zinc-500">&gt;</span>
            <span className="inline-block w-2 h-3 bg-emerald-500/80 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
