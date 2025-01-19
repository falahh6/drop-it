import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ws",
        destination: `http://localhost:${process.env.NEXT_PUBLIC_WS_PORT}/ws`,
      },
    ];
  },
};

export default nextConfig;
