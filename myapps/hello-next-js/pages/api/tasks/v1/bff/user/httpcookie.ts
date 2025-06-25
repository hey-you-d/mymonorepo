import type { NextApiRequest, NextApiResponse } from 'next';
import { JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";
import * as cookie from 'cookie';
import { VERIFY_JWT_STRING, verifyJwtErrorMsgs } from '@/lib/app/common';
import { APP_ENV, LIVE_SITE_MODE, LOCALHOST_MODE } from "@/lib/app/featureFlags";
import { customResponseMessage, catchedErrorMessage } from '@/lib/app/error';

const fnSignature = "tasks/v1 | BFF | user/httpcookie.ts";

// for reference:
// for SPA: rely on BFF (the approach below) for any server-side operations
// for next.js pages: better use Page router's getServerSideProps or App router's server actions  
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET" :
            try {
                const rawCookieHeader = req.headers.cookie;
                if (!rawCookieHeader) {
                    return res.status(200).json({ 
                        outcome: false,
                        message: await customResponseMessage(fnSignature, "GET", "No cookies received in req.headers.cookie") 
                    });
                }
                
                const parsedCookies = cookie.parse(rawCookieHeader);
                const token = parsedCookies[JWT_TOKEN_COOKIE_NAME];

                // if token is either undefined or its value is an empty string, 
                // then it's no longer exist in the client browser

                // check if token has already expired or not
                if (token && token.length > 0) {
                    const result = await VERIFY_JWT_STRING(token);
                    if(!result.valid) {
                        await customResponseMessage(fnSignature, "GET", `VERIFY_JWT_STRING | ${result.error}`)
                    }

                    // if the token is already expired, set the cookie value to an empty string, therefore invalidating it
                    if(!result.valid && result.error === verifyJwtErrorMsgs.TokenExpiredError) {
                        // for reference: you can't actually delete a cookie, you can only:
                        // Set its value to empty (or null), & Set Max-Age=0 or Expires=<past date>,
        
                        // Invalidate cookie by setting it to empty with maxAge = 0
                        //res.setHeader('Set-Cookie', `${JWT_TOKEN_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict`);
                        const path = APP_ENV == "LIVE" 
                                ? LIVE_SITE_MODE.cookie.path 
                                : LOCALHOST_MODE.cookie.path;
                            const secure = APP_ENV == "LIVE" 
                                ? LIVE_SITE_MODE.cookie.secure
                                : LOCALHOST_MODE.cookie.secure;
                        
                        // for reference: cookie.serialize() ensures safe encoding and formatting, avoiding issues with special characters.        
                        const cookieStr = cookie.serialize(JWT_TOKEN_COOKIE_NAME, '', {
                            httpOnly: true,
                            secure,
                            path,
                            sameSite: 'strict',
                            maxAge: 0, // expire immediately
                        });

                        res.setHeader('Set-Cookie', cookieStr);
                    }

                    return res.status(200).json({  
                        outcome: result.valid, 
                        message: result.valid ? result.payload : result.error, 
                    });
                }
                
                return res.status(500).json({  
                    outcome: false,
                    message: await customResponseMessage(fnSignature, "POST", "Error: unknown server error") 
                });    
            } catch (error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "GET", error as Error);
                return res.status(500).json({ error: errorMsg });
            }
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}  

export default handler;
