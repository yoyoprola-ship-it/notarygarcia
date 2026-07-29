import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Static public assets (jose.jpg, icon.svg) had no cache headers at
        // all, so every visit re-downloaded them in full. 1 day + revalidate
        // gives real repeat-visit savings without permanently locking in a
        // stale file if it's ever replaced.
        source: "/:path(jose\\.jpg|icon\\.svg)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
