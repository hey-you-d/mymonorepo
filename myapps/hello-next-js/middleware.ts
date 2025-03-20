import { NextRequest, NextResponse } from "next/server";

/*** 
 * Goal:
 * / -> see the homepage
 * /hello-next-js -> rewritten to / -> see the homepage
 * /about -> see the about page
 * /hello-next-js/about -> rewritten to /about -> see the about page
 * /foo/bar -> see the bar page
 * /hello-next-js/foo/bar -> rewritten to /foo/bar -> see the bar page
 ***/
export const middleware = (req: NextRequest) => {
    const url = req.nextUrl;
    const prefix = '/hello-next-js';

    if (url.pathname.startsWith(prefix)) {
        const newUrl = url.clone();
        newUrl.pathname = url.pathname.replace(prefix, '') || '/';
        return NextResponse.rewrite(newUrl);
    }

    return NextResponse.next();
} 
