import React from "react";

export default function StepGuide() {
  const steps = [
    {
      step: 1,
      title: "Copy Source Link",
      copy: "Navigate to your target social application. Press the share button on the video or post, and copy the absolute link URL to your system clipboard.",
      svg: (
        <svg
          className="w-5 h-5 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      ),
    },
    {
      step: 2,
      title: "Execute Processing Request",
      copy: "Insert the clean URL into the input field above. Aevnum’s cloud parsers automatically evaluate platform metadata signatures.",
      svg: (
        <svg
          className="w-5 h-5 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      ),
    },
    {
      step: 3,
      title: "Verify and Export",
      copy: "Once parsed, select your desired resolution stream from the generated options to start your direct high-speed download instantly.",
      svg: (
        <svg
          className="w-5 h-5 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ];

  return (
    <section id="step-guide" className="py-12 border-t border-neutral-900/60">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
            Extraction Protocol
          </h2>
          <h3
            className="text-2xl sm:text-3xl font-light tracking-tight mt-2 text-neutral-900 dark:text-neutral-100"
          >
            Step-by-Step Guide
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-2xl border transition-all duration-300 relative bg-white border-zinc-200 hover:border-zinc-350 dark:bg-zinc-950/40 dark:border-neutral-900 dark:hover:border-neutral-800 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className="w-8 h-8 rounded-lg text-xs font-bold font-mono flex items-center justify-center border shadow-sm bg-zinc-50 border-zinc-200 text-zinc-650 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300"
                >
                  {String(s.step).padStart(2, "0")}
                </div>
                <div className="p-2 bg-neutral-900 border border-neutral-850 rounded-lg">
                  {s.svg}
                </div>
              </div>
              <h4
                className="text-base font-semibold mb-2 tracking-tight text-neutral-900 dark:text-neutral-100"
              >
                {s.title}
              </h4>
              <p
                className="text-xs leading-relaxed font-light text-neutral-500 dark:text-neutral-450"
              >
                {s.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

