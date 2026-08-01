import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Static public assets had no cache headers at all, so every visit
        // re-downloaded them in full — including the ~180KB hero cover
        // photo on every single homepage load. 1 day + revalidate gives
        // real repeat-visit savings without permanently locking in a stale
        // file if one of them is ever replaced.
        source: "/:path(jose\\.jpg|hero-office\\.jpg|icon\\.svg)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
