"use client";

import {
  Download,
  ShieldCheck,
  Lock,
  TrendingUp,
  Info,
  AlertCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type VideoDownloaderProps = {
  videoUrl: string;
  detectedPlatform: string | null;
  isLoading: boolean;
  progress: number;
  errorMessage: string;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function VideoDownloader({
  videoUrl,
  detectedPlatform,
  isLoading,
  progress,
  errorMessage,
  onUrlChange,
  onAnalyze,
}: VideoDownloaderProps) {
  return (
    <section className="lg:col-span-8 space-y-6 sm:space-y-8">
      <section className="text-left py-2">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-mono tracking-wider uppercase border bg-white border-zinc-200 text-zinc-550 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
        >
          <TrendingUp className="w-3.5 h-3.5 text-zinc-500" /> Decentralized
          Fast Link Parser
        </div>

        <h2
          className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-2 leading-snug text-zinc-900 dark:text-white"
        >
          Extract Social Media Streams with Zero Compression
        </h2>

        <p
          className="text-xs sm:text-sm leading-relaxed max-w-xl text-zinc-505 dark:text-zinc-400"
        >
          Paste Instagram Reels, TikTok, YouTube Shorts, or Facebook URLs
          directly. We connect straight to uncompressed CDNs to extract clean
          raw formats.
        </p>
      </section>

      <section className="rounded-2xl p-4 sm:p-5 bg-white border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-850">
        <form onSubmit={onAnalyze} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={videoUrl}
                onChange={onUrlChange}
                placeholder="Paste your video, short, or reel link..."
                className="w-full text-xs sm:text-sm px-4 py-3.5 rounded-xl outline-none transition bg-zinc-55 text-zinc-800 placeholder:text-zinc-400 border border-zinc-200 focus:border-zinc-300 dark:bg-zinc-950 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:border-zinc-800 dark:focus:border-zinc-700"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition duration-150 disabled:opacity-50 shrink-0 shadow-sm bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950"
            >
              {isLoading ? (
                <>
                  <span
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin border-white dark:border-zinc-950"
                  />
                  Extracting...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  Search {detectedPlatform}
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <div
              className="flex items-center gap-2 text-xs p-3 rounded-lg border bg-red-50 text-red-700 border-red-100 dark:bg-zinc-955 dark:text-zinc-400 dark:border-zinc-850"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
          )}
        </form>

        {isLoading && (
          <div className="mt-4 p-4 rounded-xl border bg-zinc-50 border-zinc-200 dark:bg-zinc-955 dark:border-zinc-850">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-2 font-mono">
              <span
                className="text-zinc-500 flex items-center gap-1.5 truncate"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-ping" />
                Connecting with Edge Delivery CDN Nodes...
              </span>
              <span
                className="font-bold shrink-0 text-zinc-700 dark:text-zinc-300"
              >
                {progress}%
              </span>
            </div>
            <div
              className="w-full h-[3px] rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-900"
            >
              <div
                className="h-full rounded-full transition-all duration-200 bg-zinc-650 dark:bg-zinc-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 text-[9px] sm:text-[10px] font-mono pt-3 border-t border-zinc-100 text-zinc-500 dark:border-zinc-850/60 dark:text-zinc-550"
        >
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SSL
            Inspected Node
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Client Sandbox
          </span>
        </div>
      </section>
    </section>
  );
}

