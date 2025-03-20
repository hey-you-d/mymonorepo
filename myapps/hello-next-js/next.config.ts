import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/hello-next-js',
  output: "standalone",
  env: {
    PORT: '3000',
  },
};

export default nextConfig;
