import LegalLayout from "@/components/ui/LegalLayout";
import { SITE_URL } from "@/config/seo";

export const metadata = {
  title: "Terms of Service | Aevnum",
  description: "Terms and conditions of using Aether Downloader stateless extraction service.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p className="text-xs font-mono text-neutral-500 mb-8 uppercase tracking-widest">
        Last Updated: July 7, 2026
      </p>
      
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            1. Agreement to Terms
          </h2>
          <p className="leading-relaxed">
            Welcome to Aether Downloader. By accessing or utilizing our web-based streaming extraction services 
            and application routes (the "Service"), you acknowledge that you have read, understood, and agreed to 
            be bound by these Terms of Service. If you disagree with any section of these terms, you must discontinue 
            your access to the platform immediately.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            2. Scope of Service
          </h2>
          <p className="leading-relaxed">
            Aether Downloader operates as a high-bandwidth, stateless parser. The platform translates public URL addresses 
            from third-party social media networks (including Instagram, TikTok, YouTube, and Facebook) into direct CDN link 
            locations to facilitate browser-level media stream acquisition.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            3. Stateless Processing and Zero Hosting
          </h2>
          <p className="leading-relaxed">
            We adhere to a strict stateless utility model. No media files, video records, metadata database references, 
            or personal profile parameters are hosted, archived, or stored on our servers. All query resolutions 
            and audio-merging processes occur dynamically in-memory on-the-fly, returning stream pointers directly back 
            to the client. We do not act as a hosting provider or host any content.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            4. Intellectual Property & Fair Compliance
          </h2>
          <p className="leading-relaxed">
            All media content remains the exclusive property of its respective content creators and hosting social platform 
            operators. Users are strictly responsible for confirming that their extractions comply with fair use and copyright 
            statutes. Aevnum does not authorize, endorse, or promote any intellectual property infringements.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            5. Limitation of Liability
          </h2>
          <p className="leading-relaxed">
            The Service is provided on an "as-is" and "as-available" basis without representations, warranties, or 
            guarantees of any kind. Aether Downloader assumes no responsibility for network outages, CDN route alterations, 
            or third-party API changes that may render the service temporarily unavailable.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
