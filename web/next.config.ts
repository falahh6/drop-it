import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";
    console.log("NODE ENV : ", process.env.NODE_ENV);
    return [
      {
        source: "/ws",
        destination: isProd
          ? `https://${process.env.NEXT_PUBLIC_WS_DOMAIN}/ws` // Use the production WebSocket URL (wss://)
          : `http://localhost:${process.env.NEXT_PUBLIC_WS_PORT}/ws`, // Use local WebSocket for development
      },
    ];
  },
};

export default nextConfig;
