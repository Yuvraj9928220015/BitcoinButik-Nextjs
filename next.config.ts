import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ output: "export" HATA DIYA
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
};

export default nextConfig;