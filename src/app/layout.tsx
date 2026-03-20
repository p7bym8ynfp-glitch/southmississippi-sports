import type { Metadata, Viewport } from "next";

import { PwaRegistration } from "@/components/pwa-registration";
import { AccessGate } from "@/components/access-gate";
import { getConfiguredAppUrl, getSiteAccessCode, siteConfig } from "@/lib/config";

import "./globals.css";

let metadataBase: URL | undefined;
const configuredAppUrl = getConfiguredAppUrl();

try {
  metadataBase = configuredAppUrl ? new URL(configuredAppUrl) : undefined;
} catch {
  metadataBase = undefined;
}

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "South Mississippi Sports | Professional Athlete Photography",
    template: `%s | ${siteConfig.name}`,
  },
  description: "High-impact sports photography from South Mississippi. Instant digital delivery of professional unwatermarked action shots.",
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "South Mississippi Sports",
    description: "Professional Athlete Photography & Instant Delivery",
  },
  twitter: {
    card: "summary_large_image",
    title: "South Mississippi Sports",
    description: "Professional Athlete Photography & Instant Delivery",
  },
};

export const viewport: Viewport = {
  themeColor: "#050d18",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accessCode = getSiteAccessCode() || siteConfig.domain;

  return (
    <html lang="en">
      <body>
        <PwaRegistration />
        <AccessGate requiredCode={accessCode}>
          {children}
        </AccessGate>
      </body>
    </html>
  );
}
