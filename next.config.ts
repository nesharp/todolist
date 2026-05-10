import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Lets dev tools / alternate hosts talk to Turbopack HMR without noisy blocks. */
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
