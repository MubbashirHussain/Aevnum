import type { Metadata } from "next";
import "./globals.css";
import AdsenseScript from "@/components/ui/ad-Script";
import { AppProvider } from "@/context/AppContext";
import { WebApplicationJsonLd } from "@/components/seo/json-ld";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  OG_IMAGE,
} from "@/config/seo";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Free Social Media Video Downloader`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <WebApplicationJsonLd />
        <AdsenseScript adId={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID!} />
      </head>
      <body className="min-h-full flex flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
