import LegalLayout from "@/components/ui/LegalLayout";
import { SITE_NAME, SITE_URL } from "@/config/seo";

export const metadata = {
  title: "Terms and Conditions",
  description: `Terms and conditions of using ${SITE_NAME} stateless extraction service.`,
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

const TermsPage = () => (
  <LegalLayout title="Terms of Service">
    <p className="text-gray-500 mb-6">Last Updated: June 28, 2026</p>
    <section className="space-y-4">
      <h3 className="font-semibold text-lg">1. Use of Service</h3>
      <p>Welcome to downloadreels.site. By using our service, you agree to these terms...</p>
      <h3 className="font-semibold text-lg">2. User Conduct</h3>
      <p>You agree not to use our service for any illegal activities or to download copyrighted content without authorization.</p>
    </section>
  </LegalLayout>
);
export default TermsPage;