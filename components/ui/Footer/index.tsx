import { Video } from "lucide-react";
import { cn } from "@/lib/utils";

function Footer({ isDark }: { isDark: boolean }) {
  return (
    <footer
      className={cn(
        `border-t py-8 relative z-10 ${
          isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200"
        }`,
      )}
    >
      <div className="max-w-6xl mx-auto px-4 text-center space-y-6">
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b ${
            isDark ? "border-zinc-900" : "border-zinc-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                isDark ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5 stroke-[2]" />
            </div>
            <span
              className={`text-xs font-bold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}
            >
              Aevnum Studio
            </span>
          </div>

          <p className="text-[10px] text-zinc-550 max-w-sm text-center sm:text-right leading-relaxed font-mono">
            Independent utility platform. Not affiliated with Instagram, TikTok,
            YouTube, or Facebook. No media assets are hosted locally on our
            nodes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[10px] text-zinc-500 font-mono">
          <a href="#" className="hover:text-zinc-300 transition">
            Terms & Service
          </a>
          <a href="#" className="hover:text-zinc-300 transition">
            Privacy Settings
          </a>
          <a href="#" className="hover:text-zinc-300 transition">
            Cookie Settings
          </a>
          <a href="#" className="hover:text-zinc-300 transition">
            Contact Webmaster
          </a>
        </div>

        <div className="text-[9px] text-zinc-500 font-mono">
          <p>
            © {new Date().getFullYear()} Aether Downloader. Engineered for
            hyper-speed downloads and clean monetization.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
