"use client";

import React, { useState } from "react";
import LegalLayout from "@/components/ui/LegalLayout";
import { Mail, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <LegalLayout title="Contact Webmaster">
      <p className="text-xs font-mono text-neutral-500 mb-8 uppercase tracking-widest">
        Inquiries and Legal Compliance
      </p>

      {submitted ? (
        <div className="bg-zinc-900/40 border border-emerald-500/20 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
          <h2 className="text-base font-semibold text-neutral-250">Message Submitted</h2>
          <p className="text-xs text-neutral-450 leading-relaxed max-w-sm">
            Thank you for contacting the Aevnum webmaster team. We evaluate compliance inquiries, 
            technical error notifications, and operational issues within 48 business hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 text-[10px] font-mono text-neutral-500 hover:text-neutral-350 transition-colors uppercase border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-lg"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm leading-relaxed text-neutral-400">
            For API access licenses, DMCA notifications, operational errors, or ad placement adjustments, 
            submit your message using our secure webmaster contact gateway.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-mono text-neutral-500 mb-1.5">
                FULL NAME
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
                className="w-full text-xs sm:text-sm bg-neutral-950/70 border border-neutral-900 focus:border-neutral-700 focus:outline-none text-neutral-200 rounded-xl px-4 py-3 transition duration-150"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-mono text-neutral-500 mb-1.5">
                EMAIL ADDRESS
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full text-xs sm:text-sm bg-neutral-950/70 border border-neutral-900 focus:border-neutral-700 focus:outline-none text-neutral-200 rounded-xl px-4 py-3 transition duration-150"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-mono text-neutral-500 mb-1.5">
                MESSAGE DETAILS
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                placeholder="Detail your operational or legal compliance inquiry here..."
                className="w-full text-xs sm:text-sm bg-neutral-950/70 border border-neutral-900 focus:border-neutral-700 focus:outline-none text-neutral-200 rounded-xl px-4 py-3 transition duration-150 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition duration-150 shadow-sm"
          >
            <Mail className="w-4 h-4" />
            Send Inquiries
          </button>
        </form>
      )}
    </LegalLayout>
  );
}
