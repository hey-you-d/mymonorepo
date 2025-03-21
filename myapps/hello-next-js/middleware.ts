import { NextRequest, NextResponse } from "next/server";

export const middleware = (req: NextRequest) => {
    const url = req.nextUrl;
    const prefix = '/hello-next-js';

    /***
     * Handle assets in the public folder
     */
    if (url.pathname.match(new RegExp(`${prefix}/.*\.(ico|svg|png|webp|jpg|jpeg)$`))) {
        const newUrl = url.clone();
        newUrl.pathname = url.pathname.replace(prefix, '');
        return NextResponse.rewrite(newUrl);
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
     * Goal: rewrite pages so...
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

    return NextResponse.next();
} 
