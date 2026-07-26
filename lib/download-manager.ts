const API_BASE = process.env.NEXT_BACKEND_PUBLIC_API_URL;

/**
 * Stores incomplete download info in localStorage so the user can resume.
 */
const RESUME_STORAGE_KEY = "aevmum_resume_downloads";

export interface DownloadProgress {
  downloadId: string;
  status: "queued" | "downloading" | "completed" | "error";
  /** yt-dlp progress (0–100) */
  percent: number;
  /** Download speed string (e.g. "2.50 MiB/s") */
  speed: string;
  /** ETA string (e.g. "00:11") */
  eta: string;
  /** Total file size in bytes */
  totalSize: number;
  /** Bytes downloaded so far */
  downloadedBytes: number;
  /** Error message if status is "error" */
  error?: string;
  /** MIME type of the completed file */
  mimeType?: string;
}

export interface FileDownloadProgress {
  /** Bytes transferred to the browser */
  transferred: number;
  /** Total file size */
  total: number;
  /** Percentage (0–100) */
  percent: number;
}

export type ProgressCallback = (progress: DownloadProgress) => void;
export type FileProgressCallback = (progress: FileDownloadProgress) => void;

interface ResumeEntry {
  downloadId: string;
  downloadedBytes: number;
  totalSize: number;
  url: string;
  formatId: string;
  isAudioAvailable: boolean;
  platform?: string;
  startedAt: number;
}

/**
 * Initialize a video download.
 * Starts yt-dlp on the server and returns a downloadId.
 */
export async function initDownload(
  url: string,
  formatId: string,
  isAudioAvailable: boolean,
): Promise<string> {
  const res = await fetch(
    `${process.env.NEXT_BACKEND_PUBLIC_API_URL}/api/download/format/init`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, formatId, isAudioAvailable }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || `Failed to start download (${res.status})`);
  }

  const json = await res.json();
  return json.data.downloadId;
}

/**
 * Subscribe to real-time download progress via SSE and return a Promise.
 *
 * Resolves when the download is completed, or rejects on error/timeout.
 *
 * @param downloadId - The download ID from initDownload()
 * @param onProgress - Called with progress updates as they arrive
 * @param timeoutMs - Timeout in ms (default 5 min)
 * @returns A promise that resolves when the download is complete
 */
export function waitForDownload(
  downloadId: string,
  onProgress: ProgressCallback,
  timeoutMs = 5 * 60 * 1000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}/api/download/format/progress/${downloadId}`;
    const source = new EventSource(url);

    let settled = false;

    const done = (err?: Error) => {
      if (settled) return;
      settled = true;
      source.close();
      if (err) reject(err);
      else resolve();
    };

    // Timeout
    const timer = setTimeout(() => {
      done(new Error("Download timed out. The server took too long."));
    }, timeoutMs);

    source.onmessage = (event) => {
      try {
        const data: DownloadProgress = JSON.parse(event.data);
        onProgress(data);

        if (data.status === "completed") {
          clearTimeout(timer);
          done();
        } else if (data.status === "error") {
          clearTimeout(timer);
          done(new Error(data.error || "Download failed on server"));
        }
      } catch {
        // Ignore parse errors
      }
    };

    source.onerror = () => {
      // EventSource auto-reconnects, but if it permanently fails,
      // check if the download is still alive after a delay
      setTimeout(async () => {
        if (settled) return;
        try {
          const res = await fetch(
            `${API_BASE}/api/download/format/status/${downloadId}`,
          );
          const json = await res.json();
          if (!json.success) {
            clearTimeout(timer);
            done(
              new Error(
                "Download status check failed — download may have expired.",
              ),
            );
          } else if (json.data.status === "completed") {
            clearTimeout(timer);
            done();
          } else if (json.data.status === "error") {
            clearTimeout(timer);
            done(new Error(json.data.error || "Download failed on server."));
          }
          // If still downloading, EventSource will reconnect
        } catch {
          // Server might be temporarily unreachable
        }
      }, 3000);
    };
  });
}

/**
 * Download a completed file with real-time byte-level progress tracking and resume support.
 *
 * @param downloadId - The download ID
 * @param onProgress - Called with byte-level progress
 * @param signal - AbortSignal to cancel the download
 * @param startBytes - Resume from this byte offset (0 for fresh download)
 * @returns The downloaded Blob
 */
export async function downloadFile(
  downloadId: string,
  onProgress: FileProgressCallback,
  signal?: AbortSignal,
  startBytes = 0,
): Promise<Blob> {
  const url = `${API_BASE}/api/download/format/file/${downloadId}`;
  const headers: Record<string, string> = {};

  if (startBytes > 0) {
    headers["Range"] = `bytes=${startBytes}-`;
  }

  const res = await fetch(url, {
    headers,
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || `File download failed (${res.status})`);
  }

  const total = parseInt(res.headers.get("Content-Length") || "0", 10);
  const isResumed = res.status === 206;

  // If the server returned 206 (partial content), the Content-Range tells us what we got
  let transferred = startBytes;
  if (isResumed) {
    const contentRange = res.headers.get("Content-Range");
    if (contentRange) {
      const match = contentRange.match(/bytes\s+\d+-(\d+)\/(\d+)/);
      if (match) {
        transferred = startBytes;
      }
    }
  }

  if (!res.body) {
    throw new Error("Response body is empty");
  }

  const reader = res.body.getReader();
  const chunks: BlobPart[] = [];
  let totalBytes = startBytes;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    totalBytes += value.length;

    // Use the Content-Length or the total from the response headers
    const overallTotal = total || (await getDownloadTotalSize(downloadId));

    onProgress({
      transferred: totalBytes,
      total: overallTotal,
      percent:
        overallTotal > 0 ? Math.round((totalBytes / overallTotal) * 100) : 0,
    });
  }

  // Capture the Content-Type from the response for correct MIME type
  const contentType = res.headers.get("Content-Type") || "";

  // Combine all chunks into a single Blob with the correct MIME type
  const blob = new Blob(chunks, { type: contentType });
  return blob;
}

/**
 * Get the total file size for a download.
 */
async function getDownloadTotalSize(downloadId: string): Promise<number> {
  try {
    const res = await fetch(
      `${API_BASE}/api/download/format/status/${downloadId}`,
    );
    if (res.ok) {
      const json = await res.json();
      return json.data?.totalSize || 0;
    }
  } catch {
    // Ignore errors
  }
  return 0;
}

/**
 * Trigger a file download in the browser (creates a link element and clicks it).
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const element = document.createElement("a");
  element.href = url;
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(url);
}

// ─── Resume support ────────────────────────────────────────────────

/**
 * Save download state so it can be resumed later.
 */
export function saveResumeState(entry: ResumeEntry): void {
  try {
    const stored = JSON.parse(
      localStorage.getItem(RESUME_STORAGE_KEY) || "[]",
    ) as ResumeEntry[];
    const existing = stored.findIndex((e) => e.downloadId === entry.downloadId);
    if (existing >= 0) {
      stored[existing] = entry;
    } else {
      stored.push(entry);
    }
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // localStorage might be full
  }
}

/**
 * Get saved resume downloads.
 */
export function getResumeDownloads(): ResumeEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(RESUME_STORAGE_KEY) || "[]",
    ) as ResumeEntry[];
  } catch {
    return [];
  }
}

/**
 * Remove a resume entry (e.g., after successful download or user cancels).
 */
export function removeResumeState(downloadId: string): void {
  try {
    const stored = getResumeDownloads().filter(
      (e) => e.downloadId !== downloadId,
    );
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // ignore
  }
}

/**
 * Get a resume entry for a specific download.
 */
export function getResumeEntry(downloadId: string): ResumeEntry | undefined {
  return getResumeDownloads().find((e) => e.downloadId === downloadId);
}
