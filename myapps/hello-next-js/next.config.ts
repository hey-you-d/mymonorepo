import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    assetPrefix: '/hello-next-js',
    trailingSlash: true,
};

export default nextConfig;
