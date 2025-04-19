import type { NextConfig } from "next";

// I don't implement "basePath: '/hello-next-js'," config option because the AWS ALB has a listener
// rule that handles the target group for /hello-next-js & /hello-next-js/* paths.  
// The middleware.ts has been set up to address this condition as well.
const nextConfig: NextConfig = {
    output: "standalone",
    assetPrefix: '/hello-next-js',
    trailingSlash: false, // prevent 308 redirects on API routes. This is needed for the standalone mode's /api/health to work 
    reactStrictMode: true,
};

export default nextConfig;
