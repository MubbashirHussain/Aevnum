import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/config/seo";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact the ${SITE_NAME} webmaster team for API access inquiries, DMCA notifications, operational errors, and ad placement adjustments.`,
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
