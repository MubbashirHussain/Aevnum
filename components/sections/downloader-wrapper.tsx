"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

import {
  Notification,
  AdBanner,
  VideoDownloader,
  FormatSelector,
  VideoPlayer,
  PlatformSelector,
  AdSenseSlot,
} from "@/components/ui";
import { useAdConfig } from "@/config/zustand";
import { cn } from "@/lib/utils";
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
    } else if (val.includes("tiktok.com")) {
      setDetectedPlatform("tiktok");
    } else if (val.includes("youtube.com") || val.includes("youtu.be")) {
      setDetectedPlatform("youtube");
    } else if (val.includes("facebook.com") || val.includes("fb.watch")) {
      setDetectedPlatform("facebook");
    } else {
      setDetectedPlatform(null);
    }
  };

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoUrl) {
      setErrorMessage("Please input a valid media link first.");
      return;
    }

    const matchedPlatform = detectedPlatform || getFallbackPlatform(videoUrl);

    if (!matchedPlatform) {
      setErrorMessage(
        "Provide a valid Instagram, TikTok, YouTube, or Facebook link.",
      );
      return;
    }

    setIsLoading(true);
    setProgress(15);
    setErrorMessage("");
    setParsedVideo(null);
    setStreamToken(null);

    try {
      const { data: result, error } = await analyzeUrl(videoUrl);
      setProgress(100);
      setIsLoading(false);

      if (error && !result) {
        setErrorMessage(error || "No result found");
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

        triggerNotification(
          "CDN stream decrypted and formats loaded successfully!",
          "success",
        );
      }
    } catch (error: any) {
      setIsLoading(false);
      setProgress(0);
      setErrorMessage(error.message || "Failed to analyze video URL");
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
      const session = await startSession(videoUrl, formatId);

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
          const result = await unlockSession(sid);
          // Check if still locked
          if ("unlocked" in result) {
            const wait = Math.max(result.unlockAfter, 1);
            setTimeout(() => pollUnlock(sid), wait * 1000);
            return;
          }
          // Unlocked — result is UnlockData
          setStreamToken((result as UnlockData).streamToken);
          setActiveFormatId(null);
          clearInterval(tick);
          triggerNotification("Download unlocked successfully!", "success");
        } catch (error: any) {
          setActiveFormatId(null);
          clearInterval(tick);
          setErrorMessage(error.message || "Failed to unlock download");
        }
      };

      setTimeout(
        () => pollUnlock(session.sessionId),
        session.unlockAfter * 1000,
      );
    } catch (error: any) {
      setActiveFormatId(null);
      setErrorMessage(error.message || "Failed to start download session");
    }
  };

  const handleDownload = async () => {
    if (!streamToken) {
      setErrorMessage("No stream token available. Please try again.");
      return;
    }

    try {
      setIsDownloadingStream(true);
      setStreamProgress(null);
      setDownloadError(null);

      // Fetch the stream with ?download=1
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

      // Determine extension from content type
      const ext = contentType.includes("mp4")
        ? "mp4"
        : contentType.includes("webm")
          ? "webm"
          : "mp4";

      if (!res.body) {
        throw new Error("Response has no body stream");
      }

      // Stream the response body, tracking progress
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

      // All bytes received — build blob and trigger download
      const blob = new Blob(chunks as BlobPart[], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video_${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);

      setIsDownloadingStream(false);

      // Update download history
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
      setIsDownloadingStream(false);
      setStreamProgress(null);
      setDownloadError(error.message || "Download failed");
    }
  };

  const handleCopyHistory = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    triggerNotification("Copied link back to clipboard", "success");
  };

  const handleReFetch = (url: string, platform: string) => {
    setVideoUrl(url);
    setDetectedPlatform(platform);
    triggerNotification(
      "Transferred stream link back into query field.",
      "info",
    );
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const clearHistory = () => {
    setDownloadHistory([]);
    localStorage.removeItem("vdl_premium_history");
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
