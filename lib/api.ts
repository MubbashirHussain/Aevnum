const API_BASE = process.env.NEXT_PUBLIC_BACKEND_PUBLIC_API_URL;

import { logInfo, logWarn, logError } from "@/lib/logger";

interface FormatItem {
  formatId: string;
  ext: string;
  resolution: string;
  filesize?: number;
  quality?: string;
  isAudioAvailable: boolean;
}

interface SafeVideoMetadata {
  data?: {
    platform: string;
    id: string;
    title: string;
    thumbnail: string;
    duration: number;
    author: string;
    formats: FormatItem[];
  };
  error?: string;
}

interface SessionResponse {
  sessionId: string;
  unlockAfter: number;
}

export interface UnlockData {
  selectedFormat: FormatItem;
  streamToken: string;
}

export async function fetchAPI(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  if (!API_BASE) {
    logError("missing API base URL env", {
      env: "NEXT_PUBLIC_BACKEND_PUBLIC_API_URL",
    });
    throw new Error("Missing NEXT_PUBLIC_BACKEND_PUBLIC_API_URL");
  }
  logInfo("http request", {
    method: options?.method || "GET",
    path: url.split("?")[0], // strip query strings/tokens
  });
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    logWarn("http response", {
      status: response.status,
      ok: response.ok,
      path: url.split("?")[0],
    });
  } else {
    logInfo("http response", {
      status: response.status,
      ok: response.ok,
      path: url.split("?")[0],
    });
  }
  return response;
}

export async function analyzeUrl(url: string): Promise<SafeVideoMetadata> {
  if (!API_BASE) {
    return { error: "Missing NEXT_PUBLIC_BACKEND_PUBLIC_API_URL" };
  }
  const res = await fetchAPI("/api/download", {
    method: "POST",
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    return {
      error: err?.errors?.[0]?.message || `Analysis failed (${res.status})`,
    };
  }

  const json = await res.json();
  return { data: json.data };
}

export async function startSession(
  url: string,
  formatId: string,
): Promise<SessionResponse> {
  const res = await fetchAPI("/api/download/session", {
    method: "POST",
    body: JSON.stringify({ url, formatId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || `Session creation failed (${res.status})`);
  }

  return res.json();
}

/**
 * Attempt to unlock a session.
 * Returns unlock data (with streamToken) on success.
 * Returns the raw data object when still locked: { unlocked: false, unlockAfter }.
 * Throws on network/parsing errors.
 */
export async function unlockSession(
  sessionId: string,
): Promise<UnlockData | { unlocked: false; unlockAfter: number }> {
  const res = await fetchAPI("/api/download/unlock", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || `Unlock failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

export function getStreamUrl(streamToken: string, download = false): string {
  const base = `/api/video?streamToken=${streamToken}`;
  return download ? `${base}&download=1` : base;
}

export async function downloadFormat(
  url: string,
  formatId: string,
  isAudioAvailable = false,
): Promise<Blob> {
  const res = await fetchAPI("/api/download/format", {
    method: "POST",
    body: JSON.stringify({ url, formatId, isAudioAvailable }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || `Format download failed (${res.status})`);
  }

  return res.blob();
}
