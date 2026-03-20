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
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#a13b2f",
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
