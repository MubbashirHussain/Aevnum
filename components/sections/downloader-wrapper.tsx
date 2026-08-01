"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

import {
  Notification,
  AdBanner,
  VideoDownloader,
  FormatSelector,
  VideoPlayer,
  PlatformSelector,
  AdSenseSlot,
  Terminal,
} from "@/components/ui";
import { useAdConfig } from "@/config/zustand";
import { cn } from "@/lib/utils";
import { logInfo, logSuccess, logWarn, logError, logDebug } from "@/lib/logger";
import {
  analyzeUrl,
  startSession,
  unlockSession,
  getStreamUrl,
  UnlockData,
} from "@/lib/api";

// Lazy-load AdInspector in the same wrapper if needed, or define/import it
import { useBottomAd } from "@/context/AppContext";

interface Format {
  quality: string;
  resolution: string;
  size: string;
  label: string;
}

interface VideoPreview {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  likes: string;
  formats: Format[];
}

interface ParsedVideo extends VideoPreview {
  id: string;
  platform: string;
  originalUrl: string;
  formats: {
    quality: string;
    resolution: string;
    size: string;
    label: string;
    formatId: string;
    isAudioAvailable: boolean;
  }[];
}

interface DownloadHistoryItem {
  id: string;
  title: string;
  platform: string;
  url: string;
  thumbnail: string;
  timestamp: string;
  formatId: string;
  isAudioAvailable: boolean;
}

/** Convert a Blob to a base64 data string for Filesystem.writeFile. */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // FileReader returns "data:<mime>;base64,<payload>" — strip the prefix
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error("Blob read failed"));
    reader.readAsDataURL(blob);
  });
}

export default function DownloaderWrapper() {
  const {
    adsenseClientId,
    topBannerSlotId,
    sidebarSlotId,
    bottomAnchorSlotId,
  } = useAdConfig();

  useEffect(() => {
    if (typeof window !== "undefined" && adsenseClientId) {
      const existingScript = document.querySelector(
        'script[src*="pagead2.googlesyndication.com"]',
      );
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, [adsenseClientId]);

  const [videoUrl, setVideoUrl] = useState<string>("");
  const [activePlatform, setActivePlatform] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [parsedVideo, setParsedVideo] = useState<ParsedVideo | null>(null);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>(
    [],
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);

  const [showAdInspector, setShowAdInspector] = useState<boolean>(true);
  const [highlightAds, setHighlightAds] = useState<boolean>(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<
    "overview" | "adsense_code"
  >("overview");
  const [selectedAdForCode, setSelectedAdForCode] =
    useState<string>("leaderboard");
  const { setShowStickyBottomAd, showStickyBottomAd } = useBottomAd();

  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [activeFormatId, setActiveFormatId] = useState<string | null>(null);
  const [unlockCountdown, setUnlockCountdown] = useState<number>(0);

  // Stream download state
  const [isDownloadingStream, setIsDownloadingStream] = useState(false);
  const [streamProgress, setStreamProgress] = useState<{
    total: number;
    downloaded: number;
  } | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const bootstrapLogged = useRef(false);
  useEffect(() => {
    if (bootstrapLogged.current) return;
    bootstrapLogged.current = true;
    logInfo("terminal initialized", {
      apiBase: process.env.NEXT_PUBLIC_BACKEND_PUBLIC_API_URL || "(unset)",
      env: process.env.NEXT_PUBLIC_TERMINAL_DEBUG || "(unset)",
    });
  }, []);

  const triggerNotification = (
    message: string,
    type: "success" | "info" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setVideoUrl(val);
    setErrorMessage("");

    if (!val) {
      setDetectedPlatform(null);
      return;
    }

    if (val.includes("instagram.com")) {
      setDetectedPlatform("instagram");
      logInfo("platform detected", { platform: "instagram" });
    } else if (val.includes("tiktok.com")) {
      setDetectedPlatform("tiktok");
      logInfo("platform detected", { platform: "tiktok" });
    } else if (val.includes("youtube.com") || val.includes("youtu.be")) {
      setDetectedPlatform("youtube");
      logInfo("platform detected", { platform: "youtube" });
    } else if (val.includes("facebook.com") || val.includes("fb.watch")) {
      setDetectedPlatform("facebook");
      logInfo("platform detected", { platform: "facebook" });
    } else {
      setDetectedPlatform(null);
      logWarn("unrecognized URL — no platform matched", { url: val });
    }
  };

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoUrl) {
      setErrorMessage("Please input a valid media link first.");
      logWarn("analyze aborted — empty URL");
      return;
    }

    const matchedPlatform = detectedPlatform || getFallbackPlatform(videoUrl);

    if (!matchedPlatform) {
      setErrorMessage(
        "Provide a valid Instagram, TikTok, YouTube, or Facebook link.",
      );
      logWarn("analyze aborted — unsupported platform", { url: videoUrl });
      return;
    }

    setIsLoading(true);
    setProgress(15);
    setErrorMessage("");
    setParsedVideo(null);
    setStreamToken(null);

    logInfo("analyzing URL", { platform: matchedPlatform, url: videoUrl });

    try {
      const { data: result, error } = await analyzeUrl(videoUrl);
      setProgress(100);
      setIsLoading(false);

      if (error && !result) {
        setErrorMessage(error || "No result found");
        logError("analysis failed", { error, url: videoUrl });
        return;
      }

      if (result) {
        setParsedVideo({
          title: result.title,
          thumbnail: result.thumbnail,
          duration: `${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, "0")}`,
          author: result.author,
          likes: "N/A",
          formats: result.formats.map((f, idx) => ({
            quality: f.quality || f.resolution,
            resolution: f.resolution,
            size: f.filesize
              ? `${(f.filesize / 1024 / 1024).toFixed(2)} MB`
              : `${(f.filesize || 0).toLocaleString()} bytes`,
            label: idx === 0 ? "Best Quality" : "Alternative",
            formatId: f.formatId,
            isAudioAvailable: f.isAudioAvailable,
          })),
          id: result.id,
          platform: result.platform,
          originalUrl: videoUrl,
        });

        logSuccess("video parsed successfully", {
          id: result.id,
          platform: result.platform,
          title: result.title,
          formats: result.formats.length,
        });

        triggerNotification(
          "CDN stream decrypted and formats loaded successfully!",
          "success",
        );
      }
    } catch (error: any) {
      setIsLoading(false);
      setProgress(0);
      setErrorMessage(error.message || "Failed to analyze video URL");
      logError("analysis threw", {
        message: error.message || String(error),
        url: videoUrl,
      });
    }
  };

  const getFallbackPlatform = (url: string): string | null => {
    const lower = url.toLowerCase();
    if (lower.includes("insta")) return "instagram";
    if (lower.includes("tik") || lower.includes("tok")) return "tiktok";
    if (lower.includes("you") || lower.includes("yt")) return "youtube";
    if (lower.includes("face") || lower.includes("fb")) return "facebook";
    return null;
  };

  const handleStartSession = async (
    format: Format,
    formatId: string,
    _isAudioAvailable: boolean,
  ) => {
    if (!parsedVideo) return;

    try {
      setActiveFormatId(formatId);
      setErrorMessage("");
      setStreamToken(null);
      setDownloadError(null);

      // 1. Start session — gets unlockAfter
      logInfo("starting download session", { formatId });
      const session = await startSession(videoUrl, formatId);
      logInfo("session created", {
        sessionId: session.sessionId,
        unlockAfter: session.unlockAfter,
      });

      // 2. Show countdown on the button while waiting for unlockAfter
      setUnlockCountdown(session.unlockAfter);
      const tick = setInterval(() => {
        setUnlockCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(tick);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 3. Poll unlock after the initial wait
      const pollUnlock = async (sid: string) => {
        try {
          logDebug("polling unlock", { sessionId: sid });
          const result = await unlockSession(sid);
          // Check if still locked
          if ("unlocked" in result) {
            const wait = Math.max(result.unlockAfter, 1);
            logWarn("session still locked, retrying", { waitSeconds: wait });
            setTimeout(() => pollUnlock(sid), wait * 1000);
            return;
          }
          // Unlocked — result is UnlockData
          setStreamToken((result as UnlockData).streamToken);
          setActiveFormatId(null);
          clearInterval(tick);
          logSuccess("download unlocked", {
            streamToken: (result as UnlockData).streamToken.slice(0, 12) + "…",
          });
          triggerNotification("Download unlocked successfully!", "success");
        } catch (error: any) {
          setActiveFormatId(null);
          clearInterval(tick);
          setErrorMessage(error.message || "Failed to unlock download");
          logError("unlock failed", {
            message: error.message || String(error),
            sessionId: sid,
          });
        }
      };

      setTimeout(
        () => pollUnlock(session.sessionId),
        session.unlockAfter * 1000,
      );
    } catch (error: any) {
      setActiveFormatId(null);
      setErrorMessage(error.message || "Failed to start download session");
      logError("session creation failed", {
        message: error.message || String(error),
        formatId,
      });
    }
  };

  const handleDownload = async () => {
    if (!streamToken) {
      setErrorMessage("No stream token available. Please try again.");
      return;
    }

    const capacitorObj =
      typeof window !== "undefined" ? (window as any).Capacitor : undefined;
    const isNative =
      capacitorObj && typeof capacitorObj.isNativePlatform === "function"
        ? capacitorObj.isNativePlatform()
        : false;

    setIsDownloadingStream(true);
    setStreamProgress(null);
    setDownloadError(null);

    logInfo("download started", { mode: isNative ? "native" : "web" });

    if (isNative) {
      let progressListener: any = null;
      let downloadSucceeded = false;
      try {
        // Dynamically import @capacitor/filesystem (No need for @capacitor/file-transfer)
        const { Filesystem, Directory } = await import("@capacitor/filesystem");
        logInfo("native download — capacitor filesystem loaded");
        logDebug("capabilities", {
          platform: capacitorObj?.getPlatform
            ? capacitorObj.getPlatform()
            : "unknown",
        });

        const streamUrl = getStreamUrl(streamToken, true);
        const absoluteUrl = streamUrl.startsWith("http")
          ? streamUrl
          : `${process.env.NEXT_PUBLIC_BACKEND_PUBLIC_API_URL || ""}${streamUrl}`;

        // 1. Verify backend status & inspect headers BEFORE touching the filesystem.
        //    Native HTTP (Capacitor) silently saves HTTP error pages (text/plain /
        //    application/json) to disk, so we must reject them here with a clear error.
        let ext = "mp4";
        let contentType = "video/mp4";
        let contentLength = 0;
        let verifyRes: Response | null = null;
        try {
          verifyRes = await fetch(absoluteUrl, {
            method: "GET",
            headers: { Range: "bytes=0-" },
          });
          if (!verifyRes.ok) {
            // Backend or proxy returned a real error status — surface it descriptively
            let errBody = "";
            try {
              errBody = (await verifyRes.text()).slice(0, 300);
            } catch {
              // ignore body read failure
            }
            logError("backend stream verification failed", {
              status: verifyRes.status,
              contentType: verifyRes.headers.get("content-type") || "(none)",
              body: errBody || "(empty)",
            });
            throw new Error(
              `Backend stream error (HTTP ${verifyRes.status})${
                errBody ? `: ${errBody}` : ""
              }. The stream may be invalid or expired.`,
            );
          }

          contentType = verifyRes.headers.get("content-type") || "video/mp4";
          contentLength = parseInt(
            verifyRes.headers.get("content-length") || "0",
            10,
          );

          // Reject text/html, text/plain, application/json error pages
          const ct = contentType.toLowerCase();
          if (
            ct.includes("text/html") ||
            ct.includes("text/plain") ||
            ct.includes("application/json")
          ) {
            logError("backend returned non-media content type", {
              contentType,
            });
            throw new Error(
              `Backend returned ${contentType} instead of a video stream — this is an error page, not media.`,
            );
          }

          if (ct.includes("webm")) ext = "webm";
          else if (ct.includes("mp3")) ext = "mp3";
          else if (ct.includes("m4a")) ext = "m4a";
          logInfo("backend stream verified", {
            status: verifyRes.status,
            contentType,
            contentLength,
            ext,
          });

          // Release the verify body so we don't hold the stream open on mobile
          verifyRes.body?.cancel().catch(() => {});
        } catch (verifyErr: any) {
          // Distinguish our own descriptive errors from network failures
          if (
            verifyErr?.message?.startsWith?.("Backend stream") ||
            verifyErr?.message?.startsWith?.("Backend returned")
          ) {
            throw verifyErr;
          }
          logWarn("stream verification failed — retrying via native download", {
            message: verifyErr?.message || String(verifyErr),
          });
          // Fall through; Filesystem.downloadFile will surface its own error
        }

        // 2. Platform & Directory Setup (Android 10+ Scoped Storage friendly)
        const platform = capacitorObj?.getPlatform
          ? capacitorObj.getPlatform()
          : "web";
        const isAndroid = platform === "android";
        const directory = isAndroid
          ? Directory.ExternalStorage
          : Directory.Documents;
        const filename = `media-${Date.now()}.${ext}`;
        const path = isAndroid ? `Download/${filename}` : filename;
        logInfo("native download — target configured", {
          platform,
          directory: isAndroid ? "ExternalStorage/Download" : "Documents",
          filename,
        });

        // 3. Android Permissions Check (only needed for ExternalStorage)
        if (isAndroid) {
          const status = await Filesystem.checkPermissions();
          if (status.publicStorage !== "granted") {
            const req = await Filesystem.requestPermissions();
            if (req.publicStorage !== "granted") {
              logWarn("storage permission denied — will try without it");
            }
          }
        }

        // 4. Progress Listener directly on Filesystem
        progressListener = await Filesystem.addListener(
          "progress",
          (progress: any) => {
            setStreamProgress({
              total: progress.contentLength || 0,
              downloaded: progress.bytes || 0,
            });
            logDebug("native download progress", {
              downloaded: progress.bytes || 0,
              total: progress.contentLength || 0,
            });
          },
        );

        // 5. Direct HTTP Native Download using Filesystem.downloadFile
        try {
          await Filesystem.downloadFile({
            url: absoluteUrl,
            path, // filename relative to the Directory below
            directory,
            recursive: true, // create missing parent dirs (Download/ on Android)
            progress: true,
          });
          downloadSucceeded = true;
        } catch (nativeErr: any) {
          // Fall back to a manual byte-stream download via fetch + writeFile
          logWarn("Filesystem.downloadFile failed — falling back to manual stream", {
            message: nativeErr?.message || String(nativeErr),
          });

          if (verifyRes && !verifyRes.ok) {
            throw new Error(
              `Backend stream error (HTTP ${verifyRes.status}) — verify the stream is valid.`,
            );
          }

          // Re-fetch as a stream (the HEAD/verify fetch body is already consumed)
          const manualRes = await fetch(absoluteUrl, {
            headers: { Range: "bytes=0-" },
          });
          if (!manualRes.ok) {
            const body = (await manualRes.text().catch(() => "")).slice(0, 300);
            throw new Error(
              `Backend stream error (HTTP ${manualRes.status})${
                body ? `: ${body}` : ""
              }.`,
            );
          }

          const manualContentType =
            manualRes.headers.get("content-type") || "video/mp4";
          if (
            manualContentType.includes("text/html") ||
            manualContentType.includes("text/plain") ||
            manualContentType.includes("application/json")
          ) {
            throw new Error(
              `Backend returned ${manualContentType} instead of a video stream.`,
            );
          }

          const manualReader = manualRes.body?.getReader();
          if (!manualReader) {
            throw new Error("Backend returned an empty response body.");
          }

          const chunks: Uint8Array[] = [];
          let downloadedBytes = 0;
          const manualTotal = parseInt(
            manualRes.headers.get("content-length") || "0",
            10,
          );

          while (true) {
            const { done, value } = await manualReader.read();
            if (done) break;
            chunks.push(value);
            downloadedBytes += value.length;
            setStreamProgress({
              total: manualTotal || downloadedBytes,
              downloaded: downloadedBytes,
            });
          }

          // Write the assembled bytes to the same target path
          const blob = new Blob(chunks as BlobPart[], {
            type: manualContentType,
          });
          const base64 = await blobToBase64(blob);
          await Filesystem.writeFile({
            path: path, // same relative path convention
            directory,
            data: base64,
            recursive: true,
          });
          logSuccess("manual stream fallback completed", {
            path,
            bytes: downloadedBytes,
          });
          downloadSucceeded = true;
        }

        if (downloadSucceeded) {
          logSuccess("native download completed", { path, filename });

          // 6. Update Download History
          if (parsedVideo) {
            const entry: DownloadHistoryItem = {
              id: parsedVideo.id,
              title: parsedVideo.title,
              platform: parsedVideo.platform,
              url: videoUrl,
              thumbnail: parsedVideo.thumbnail,
              timestamp: "Just now",
              formatId: "",
              isAudioAvailable: true,
            };
            const updated = [entry, ...downloadHistory]
              .filter(
                (item, idx, arr) =>
                  idx === arr.findIndex((h) => h.url === item.url),
              )
              .slice(0, 6);
            setDownloadHistory(updated);
            localStorage.setItem(
              "vdl_premium_history",
              JSON.stringify(updated),
            );
          }

          triggerNotification(
            `Saved to ${isAndroid ? "Downloads" : "Documents"}!`,
            "success",
          );
        }
      } catch (error: any) {
        setStreamProgress(null);
        setDownloadError(error.message || "Native download failed");
        logError("native download failed", {
          message: error.message || String(error),
        });
        triggerNotification(error.message || "Native download failed");
      } finally {
        if (progressListener && typeof progressListener.remove === "function") {
          await progressListener.remove();
        }
        setIsDownloadingStream(false);
      }
      return;
    }

    // --- Web / Browser Fallback Stream Download ---
    try {
      const streamUrl = getStreamUrl(streamToken, true);
      const res = await fetch(streamUrl);

      if (!res.ok) {
        throw new Error(`Stream failed (${res.status})`);
      }

      const contentLength = parseInt(
        res.headers.get("content-length") || "0",
        10,
      );
      const contentType = res.headers.get("content-type") || "video/mp4";

      const ext = contentType.includes("mp4")
        ? "mp4"
        : contentType.includes("webm")
          ? "webm"
          : "mp4";

      if (!res.body) {
        throw new Error("Response has no body stream");
      }

      logInfo("web download — stream opened", {
        status: res.status,
        contentType,
        contentLength,
      });

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let downloaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        downloaded += value.length;

        setStreamProgress({
          total: contentLength || downloaded,
          downloaded,
        });
      }

      logSuccess("web download completed", {
        bytes: downloaded,
        ext,
      });

      const blob = new Blob(chunks as BlobPart[], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video_${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);

      if (parsedVideo) {
        const entry: DownloadHistoryItem = {
          id: parsedVideo.id,
          title: parsedVideo.title,
          platform: parsedVideo.platform,
          url: videoUrl,
          thumbnail: parsedVideo.thumbnail,
          timestamp: "Just now",
          formatId: "",
          isAudioAvailable: true,
        };
        const updated = [entry, ...downloadHistory]
          .filter(
            (item, idx, arr) =>
              idx === arr.findIndex((h) => h.url === item.url),
          )
          .slice(0, 6);
        setDownloadHistory(updated);
        localStorage.setItem("vdl_premium_history", JSON.stringify(updated));
      }

      triggerNotification("Download complete!", "success");
    } catch (error: any) {
      setStreamProgress(null);
      setDownloadError(error.message || "Download failed");
      logError("web download failed", {
        message: error.message || String(error),
      });
    } finally {
      setIsDownloadingStream(false);
    }
  };

  const handleCopyHistory = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    logInfo("copied history link", { index, url });
    triggerNotification("Copied link back to clipboard", "success");
  };

  const handleReFetch = (url: string, platform: string) => {
    setVideoUrl(url);
    setDetectedPlatform(platform);
    logInfo("re-fetching history link", { platform, url });
    triggerNotification(
      "Transferred stream link back into query field.",
      "info",
    );
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const clearHistory = () => {
    setDownloadHistory([]);
    localStorage.removeItem("vdl_premium_history");
    logInfo("download history purged");
    triggerNotification("Cache purged successfully", "info");
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type as "success" | "info"}
          onClose={() => setNotification(null)}
        />
      )}

      <Terminal />

      <AdBanner
        highlightAds={highlightAds}
        onHighlightToggle={() => setHighlightAds(!highlightAds)}
        clientId={adsenseClientId}
        slotId={topBannerSlotId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Main Downloader Field */}
        <div className="lg:col-span-8">
          <VideoDownloader
            videoUrl={videoUrl}
            detectedPlatform={detectedPlatform}
            isLoading={isLoading}
            progress={progress}
            errorMessage={errorMessage}
            onUrlChange={handleUrlChange}
            onAnalyze={handleAnalyze}
          />
        </div>

        {/* Sidebar Banner Ad */}
        <div className="lg:col-span-4 rounded-2xl p-4 sm:p-6 backdrop-blur-sm min-h-[300px] h-full flex items-center justify-center skeleton-shimmer-light dark:skeleton-shimmer-dark">
          <AdSenseSlot
            slotId={sidebarSlotId}
            format="auto"
            responsive={true}
            style={{
              display: "inline-block",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>

      {/* Format Selector Overlay */}
      {parsedVideo && !streamToken && (
        <div className="mt-6">
          <FormatSelector
            parsedVideo={parsedVideo}
            onDownload={handleStartSession}
            loadingFormatId={activeFormatId}
            countdown={unlockCountdown}
          />
        </div>
      )}

      {/* Player and Progress Panel */}
      {streamToken && (
        <div className="mt-6">
          <VideoPlayer
            parsedVideo={parsedVideo}
            streamToken={streamToken}
            onOpenInNewTab={() => {
              const element = document.createElement("a");
              element.href = getStreamUrl(streamToken);
              element.target = "_blank";
              element.rel = "noopener noreferrer";
              element.click();
            }}
            onDownload={handleDownload}
            isDownloading={isDownloadingStream}
            streamProgress={streamProgress}
            downloadError={downloadError}
            onRetryDownload={handleDownload}
          />
        </div>
      )}

      {/* Platform quick list selector */}
      <div className="mt-6">
        <PlatformSelector
          activePlatform={activePlatform}
          onPlatformChange={setActivePlatform}
        />
      </div>

      {/* Sticky Bottom anchor banner */}
      {showStickyBottomAd && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t py-3.5 backdrop-blur-md transition-colors duration-300 bg-white/95 border-zinc-200 dark:bg-black/95 dark:border-neutral-900">
          <div className="max-w-5xl mx-auto px-4 relative flex flex-col items-center">
            <button
              onClick={() => {
                setShowStickyBottomAd(false);
              }}
              className="absolute -top-7.5 right-4 border text-[9px] font-mono flex items-center gap-1 cursor-pointer p-1 rounded-full shadow-md z-50 bg-white border-zinc-200 text-zinc-550 hover:text-zinc-800 dark:bg-zinc-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white"
              title="Close Sponsor"
            >
              <X className="w-3 h-3" /> Close Ad
            </button>

            <div className="w-full flex justify-center rounded-lg overflow-hidden transition-all rounded-xl skeleton-shimmer-light dark:skeleton-shimmer-dark">
              <AdSenseSlot
                clientId={adsenseClientId}
                slotId={bottomAnchorSlotId || "5678901234"}
                format="horizontal"
                style={{
                  display: "inline-block",
                  width: "100%",
                  height: "90px",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
