import type { NextApiRequest, NextApiResponse } from 'next';
import { JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";
import * as cookie from 'cookie';
import { VERIFY_JWT_STRING } from '@/lib/app/common';

// for reference:
// for SPA: rely on BFF (the approach below) for any server-side operations
// for next.js pages: better use Page router's getServerSideProps or App router's server actions  
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET" :
            try {
                const rawCookieHeader = req.headers.cookie;
                if (!rawCookieHeader) {
                    console.warn("Notification: User BFF - check auth_token cookie - No cookies received in request headers");
                    return res.status(200).json({ outcome: false });
                }
                
                const parsedCookies = cookie.parse(rawCookieHeader);
                const token = parsedCookies[JWT_TOKEN_COOKIE_NAME];

                // if token is either undefined or its value is an empty string, 
                // then it's no longer exist in the client browser

                // check if token has already expired or not
                if (token && token.length > 0) {
                    const result = await VERIFY_JWT_STRING(token);
                    console.log("BFF httpCookie ", result);

                    return res.status(200).json({  
                        outcome: result.valid, 
                        message: result.valid ? result.payload : result.error, 
                    });
                }
                
                return res.status(500).json({  outcome: false, message: "User BFF - check auth_token cookie - unknown server error" });    
            } catch (error) {
                
                console.error("User BFF - check auth_token cookie - Error: unsuccessfully checking http-only cookie : ", error);
        
                throw error;
            }
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}  

export default handler;
