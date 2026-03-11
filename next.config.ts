import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["archiver", "nodemailer", "sharp", "stripe"],
};

export default nextConfig;
