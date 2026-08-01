"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormatSelectorProps = {
  parsedVideo: {
    title: string;
    thumbnail: string;
    duration: string;
    author: string;
    formats: {
      quality: string;
      resolution: string;
      size: string;
      label: string;
      formatId: string;
      isAudioAvailable: boolean;
    }[];
  } | null;
  onDownload: (
    format: any,
    formatId: string,
    isAudioAvailable: boolean,
  ) => void;
  loadingFormatId?: string | null;
  countdown?: number;
};

export function FormatSelector({
  parsedVideo,
  onDownload,
  loadingFormatId,
  countdown,
}: FormatSelectorProps) {
  if (!parsedVideo) return null;
  return (
    <section className="border rounded-2xl overflow-hidden animate-fade-in bg-white border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
      <div className="px-4 py-3 border-b flex items-center justify-between gap-2 bg-zinc-50 border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850">
        <span className="text-[9px] sm:text-[10px] font-mono tracking-wider truncate text-zinc-600 dark:text-zinc-400">
          Resolved node author:{" "}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {parsedVideo.author}
          </span>
        </span>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-5 space-y-3">
          <div className="relative aspect-video rounded-xl overflow-hidden border bg-zinc-100 border-zinc-250 shadow-sm dark:bg-zinc-950 dark:border-zinc-850">
            <img
              src={parsedVideo.thumbnail}
              alt="video preview"
              crossOrigin="anonymous"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-zinc-950/90 border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 shadow-sm">
              {parsedVideo.duration}
            </div>
          </div>
        </div>

        <div className="md:col-span-7 space-y-4">
          <h3 className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Select Available Quality:
          </h3>

          <div className="space-y-2.5">
            {parsedVideo.formats.map((format, idx) => {
              return (
                <div
                  key={idx}
                  className="p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition border bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm dark:bg-zinc-950 dark:border-zinc-850 dark:hover:border-zinc-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold truncate text-zinc-850 dark:text-zinc-200">
                      {format.resolution}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      No Watermark CDN Link
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0">
                    <span className="text-[9px] font-mono px-2 py-1 rounded border bg-white border-zinc-200 text-zinc-500 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
                      {format.size}
                    </span>
                    <button
                      onClick={() =>
                        onDownload(
                          format,
                          parsedVideo.formats[idx].formatId,
                          parsedVideo.formats[idx].isAudioAvailable,
                        )
                      }
                      disabled={!!loadingFormatId}
                      className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer",
                        loadingFormatId === parsedVideo.formats[idx].formatId
                          ? "bg-zinc-300 text-zinc-500 cursor-wait dark:bg-zinc-800 dark:text-zinc-400"
                          : loadingFormatId
                            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-850 dark:text-zinc-500"
                            : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950",
                      )}
                      title={
                        loadingFormatId === parsedVideo.formats[idx].formatId
                          ? `Unlocking... ${countdown || ""}`
                          : "Download to system"
                      }
                    >
                      {loadingFormatId === parsedVideo.formats[idx].formatId ? (
                        <>
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" />
                          <span>{countdown ? `${countdown}s` : "Wait"}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
