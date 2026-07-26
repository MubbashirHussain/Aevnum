"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Does Aevnum store copies of downloaded videos?",
      answer:
        "No. Aevnum operates as a stateless streaming engine. We process the platform's API signals and hand direct CDN stream links directly back to your browser client. No media is stored on our servers.",
    },
    {
      question: "Is there a daily limit on the number of extractions?",
      answer:
        "Our service is completely unlimited and free to use. We maintain a stateless caching layer to minimize server loading while ensuring rapid generation for all visitors.",
    },
    {
      question: "How do you download videos on mobile devices (iOS/Android)?",
      answer:
        "Simply access Aevnum through your mobile browser (Safari, Chrome, or Firefox). Paste the link, generate the download path, and use your native browser file manager to save the media to your local camera roll.",
    },
    {
      question: "Why does the site require an interstitial countdown screen?",
      answer:
        "This verification mechanism helps protect our APIs from automated scraping bots, ensuring we can maintain high bandwidth extraction speeds for real users completely free of charge.",
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq-accordion"
      className="py-12 border-t border-neutral-900/60 max-w-3xl mx-auto"
    >
      <div className="px-6">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
            Support Panel
          </h2>
          <h3
            className="text-2xl sm:text-3xl font-light tracking-tight mt-2 text-neutral-900 dark:text-neutral-100"
          >
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "border rounded-2xl overflow-hidden transition-all duration-300 border-zinc-200 dark:border-neutral-900",
                  isOpen ? "bg-zinc-50/50 dark:bg-neutral-950/30" : "bg-transparent",
                )}
              >
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 select-none hover:bg-neutral-900/20 transition-colors"
                >
                  <span
                    className="text-xs sm:text-sm font-semibold tracking-tight text-neutral-850 dark:text-neutral-200"
                  >
                    {faq.question}
                  </span>
                  {/* Clean sharp vector expand arrow */}
                  <svg
                    className={cn(
                      "w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-300",
                      isOpen ? "rotate-180" : "",
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Animated expand panel */}
                <div
                  className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    isOpen ? "max-h-[200px]" : "max-h-0",
                  )}
                >
                  <div
                    className="px-6 pb-6 text-[11px] sm:text-xs leading-relaxed font-light text-neutral-500 dark:text-neutral-450"
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

