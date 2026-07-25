import LegalLayout from "@/components/ui/LegalLayout";
import { SITE_URL } from "@/config/seo";

export const metadata = {
  title: "Privacy Policy | Aether Downloader",
  description: "Privacy Policy for Aether Downloader, explaining our stateless processing and third-party advertising cookies.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="text-xs font-mono text-neutral-500 mb-8 uppercase tracking-widest">
        Last Updated: July 7, 2026
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            1. Zero-Retention & Stateless Privacy
          </h2>
          <p className="leading-relaxed">
            At Aether Downloader, user privacy is our highest priority. Our extraction engine operates as a 100% 
            stateless service. We do not store, log, cache, or archive any media files, download records, or search queries. 
            All extraction processes are performed transiently in active server memory and delivered directly to your client 
            web browser interface.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            2. Personal Identifiable Information (PII)
          </h2>
          <p className="leading-relaxed">
            The platform does not require account creation, registration, email sign-ups, or payment configurations. 
            As a result, Aether Downloader does not collect, sell, or distribute personal identifiable information.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            3. Server Logs & Rate Limiting
          </h2>
          <p className="leading-relaxed">
            To prevent bot abuse, malicious scraping, and DDoS vectors, our backend systems run transient connection 
            trackers in-memory. These trackers monitor incoming IP addresses and request rates. The logs do not compile 
            profile databases and are cleared automatically within standard web server cache rotation windows.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            4. Google AdSense & Third-Party Cookies
          </h2>
          <p className="leading-relaxed">
            This platform uses Google AdSense to serve contextual and personalized advertisements. Google, as a third-party vendor, 
            uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve 
            ads to our visitors based on their visit to Aether and other websites on the Internet. 
          </p>
          <p className="leading-relaxed mt-2">
            You may opt out of personalized advertising by visiting Google's ad settings, or configure your browser's cookie settings 
            to decline third-party ad networks.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            5. Client Storage Preferences
          </h2>
          <p className="leading-relaxed">
            We use localized client-side cookies and standard web storage objects (e.g. `vdl_theme` for styling selections 
            and `vdl_premium_history` to store recent parsed links) directly within your own browser. This data never exits 
            your local machine and can be purged at any time by clearing your browser cache.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
