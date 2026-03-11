import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "SMS Sports",
    description: siteConfig.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f0e5",
    theme_color: "#a13b2f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
