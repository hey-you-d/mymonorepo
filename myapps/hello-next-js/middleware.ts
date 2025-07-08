import { NextRequest, NextResponse } from "next/server";
import { APP_ENV } from "@/lib/app/featureFlags";

const prefix = '/hello-next-js';

export const middleware = (req: NextRequest) => {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1');
    const isHttps = req.headers.get('x-forwarded-proto') === 'https';

    /***
     * handle healthcheck rewrite (ALB hits hello-next-js/api/health)
     */
    if (url.pathname === `${prefix}/api/health`) {
        url.pathname = "/api/health";
        return NextResponse.rewrite(url);
    }

    // re-evaluate isHealthCheck after potential rewrite
    const isHealthCheck = isLocalhost 
        ? url.pathname.startsWith('/api/health') 
        : url.pathname.startsWith(`${prefix}/api/health`);

    /***
     * bypass next.js static assets
     */
    if (url.pathname.startsWith(`${prefix}/_next`) || 
        url.pathname.startsWith(`${prefix}/static`)) {
        return NextResponse.next();
    }

    // Redirect HTTP to HTTPS — except for health check
    if (!isLocalhost && !isHttps && !isHealthCheck) {
        url.protocol = "https:";
        console.log('MIDDLEWARE DEBUG: redirecting to HTTPS');
        return NextResponse.redirect(url, 301);
    }

    /***
     * handle static assets (_next, static) so they load correctly
     */
    if (url.pathname.startsWith(`${prefix}/_next`) || 
        url.pathname.startsWith(`${prefix}/static`)) {
        const newUrl = url.clone();
        newUrl.pathname = url.pathname.replace(prefix, '');
        return NextResponse.rewrite(newUrl);
    }

    /*** 
     * Goal: rewrite pages so... (recall, no basePath option in next.config.js)
     * / -> see the homepage
     * /hello-next-js -> rewritten to / -> see the homepage
     * /about -> see the about page
     * /hello-next-js/about -> rewritten to /about -> see the about page
     * /foo/bar -> see the bar page
     * /hello-next-js/foo/bar -> rewritten to /foo/bar -> see the bar page
     */
    if (url.pathname.startsWith(prefix)) {
        const newUrl = url.clone();
        newUrl.pathname = url.pathname.replace(prefix, '') || '/';
        return NextResponse.rewrite(newUrl);
    }

    /***
     * CORS
     */
    NextResponse.next().headers.set('Access-Control-Allow-Origin', '*');
    NextResponse.next().headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    NextResponse.next().headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

    return NextResponse.next();
} 


/*** 
 * Only run the middleware for any path that starts with /hello-next-js/ (and everything under it) 
 * & /api/ (and everything under it).
 * 
 * Since this app is not using basePath anymore, but the hello-next-js app  is still served behind 
 * a path prefix via ALB, the middleware needs to handle rewriting and asset loading cleanly only for 
 * /hello-next-js/*.
 * 
 * This keeps your middleware from running on unrelated routes like / or /api/something from your other apps 
 * (like hello-react-js). 
 */
export const config = {
    matcher: ['/hello-next-js/:path*', '/api/:path*'],
}
