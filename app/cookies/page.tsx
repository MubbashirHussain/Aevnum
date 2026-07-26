import LegalLayout from "@/components/ui/LegalLayout";
import { SITE_URL } from "@/config/seo";

export const metadata = {
  title: "Cookie Policy | Aether Downloader",
  description: "Cookie Policy and settings matrix for Aether Downloader service, explaining how advertising and preference cookies are handled.",
  alternates: {
    canonical: `${SITE_URL}/cookies`,
  },
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy">
      <p className="text-xs font-mono text-neutral-500 mb-8 uppercase tracking-widest">
        Last Updated: July 7, 2026
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            1. Understanding Cookies & Web Storage
          </h2>
          <p className="leading-relaxed">
            Cookies and Web Storage (such as localStorage) are small text files or key-value pairs stored on your browser when 
            you visit a website. They allow the website to recognize your browser, retain choices (like theme options), and analyze 
            traffic parameters for better responsiveness.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            2. Classification of Cookies & Storage Used
          </h2>
          <p className="leading-relaxed">
            Aether Downloader utilizes two main classes of cookies and storage tools:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 text-neutral-400 pl-2">
            <li>
              <strong>Functional Storage:</strong> Built-in client local storage fields (like `vdl_theme` for switching 
              between dark/light views, and `vdl_premium_history` for listing recent download items). These are strictly 
              stored in your local browser sandbox and never transmitted to our servers.
            </li>
            <li>
              <strong>Advertising Cookies (Google AdSense):</strong> Used by Google to display relevant contextual or personalized ads, 
              prevent fraudulent ad clicks, and optimize revenue structures. These cookies compile anonymous browsing patterns 
              across multiple websites.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            3. Detailed Storage and Cookie Matrix
          </h2>
          <div className="overflow-x-auto my-4 border border-neutral-900 rounded-xl">
            <table className="min-w-full text-xs font-mono divide-y divide-neutral-900">
              <thead className="bg-neutral-950 text-neutral-300">
                <tr>
                  <th className="px-4 py-3 text-left">Key / Cookie Name</th>
                  <th className="px-4 py-3 text-left">Provider</th>
                  <th className="px-4 py-3 text-left">Duration</th>
                  <th className="px-4 py-3 text-left">Primary Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 bg-black/40 text-neutral-400">
                <tr>
                  <td className="px-4 py-3 font-semibold text-neutral-300">vdl_theme</td>
                  <td className="px-4 py-3">Aether (Local)</td>
                  <td className="px-4 py-3">Persistent</td>
                  <td className="px-4 py-3">Remembers user preference for Dark or Light mode configuration.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-neutral-300">vdl_premium_history</td>
                  <td className="px-4 py-3">Aevnum (Local)</td>
                  <td className="px-4 py-3">Persistent</td>
                  <td className="px-4 py-3">Stores recent links you parsed so you can access them again quickly.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-neutral-300">__gads / __gac</td>
                  <td className="px-4 py-3">Google AdSense</td>
                  <td className="px-4 py-3">13 Months</td>
                  <td className="px-4 py-3">Delivers personalized advertising and counts unique visitors.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-neutral-300">IDE / DSID</td>
                  <td className="px-4 py-3">DoubleClick (Google)</td>
                  <td className="px-4 py-3">1 Year</td>
                  <td className="px-4 py-3">Tracks user conversion rates and monitors ad effectiveness.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-light tracking-tight text-neutral-200 mb-2">
            4. Managing Consent & Disabling Cookies
          </h2>
          <p className="leading-relaxed">
            You are in full control of your cookie preferences. You can configure your browser to decline all cookies, block third-party 
            tracking, or alert you when a cookie is placed. To adjust advertising personalization settings or opt-out of 
            Google's interest-based tracking, please modify your settings at Google's Ad Settings center.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
