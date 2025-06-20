import type { NextApiRequest, NextApiResponse } from 'next';
import { JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";
import { serialize } from 'cookie';
import { APP_ENV, LIVE_SITE_MODE, LOCALHOST_MODE } from "@/lib/app/featureFlags";

const fnSignature = "tasks/v1 | BFF | user/logout.ts";
const customResponseMessage = async (fnName: string, customMsg: string) => {
    const msg = `${fnSignature} | ${fnName} | ${customMsg}`;
    console.log(msg);
    return msg;
}
const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
}

// for reference:
// for SPA: rely on BFF (the approach below) for any server-side operations
// for next.js pages: better use Page router's getServerSideProps or App router's server actions 
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case "GET" :
            try {
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
                const cookieStr = serialize(JWT_TOKEN_COOKIE_NAME, '', {
                    httpOnly: true,
                    secure,
                    path,
                    sameSite: 'strict',
                    maxAge: 0, // expire immediately
                });

                res.setHeader('Set-Cookie', cookieStr);
                
                // let client verify if the cookie has been deleted in a subsequent request
                return res.status(200).json({ 
                    error: false, 
                    message: await customResponseMessage("POST", `successful ${JWT_TOKEN_COOKIE_NAME} cookie deletion`) 
                });
            } catch (error) {
                const errorMsg = await catchedErrorMessage("POST", error as Error);
                return res.status(500).json({ error: errorMsg });
            }
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}  

export default handler;
