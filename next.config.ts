import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        // Restrict to the public AIDA bucket used by the design tool
        pathname: "/aida-public/**",
      },
    ],
  },
};

export default nextConfig;