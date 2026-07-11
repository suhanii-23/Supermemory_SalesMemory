import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root -- otherwise Next.js/Turbopack finds the stray
  // lockfile at ~/package-lock.json (unrelated to this project) and infers
  // the wrong root, which can pull unrelated files into tracing.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
