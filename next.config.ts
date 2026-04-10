import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.bitcoinbutik.com',
      },
    ],
  },

  // ❌ rewrites() nahi chalega — hatao completely
};

export default nextConfig;