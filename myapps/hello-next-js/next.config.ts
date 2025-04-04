import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    assetPrefix: '/hello-next-js',
    // prevent 308 redirects on API routes. This is needed for the standalone mode's /api/health to work 
    trailingSlash: false, 
};

export default nextConfig;
