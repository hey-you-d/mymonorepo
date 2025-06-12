import type { NextApiRequest, NextApiResponse } from 'next';
import { JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";
import * as cookie from 'cookie';

// for reference:
// for SPA: rely on BFF (the approach below) for any server-side operations
// for next.js pages: better use Page router's getServerSideProps or App router's server actions  
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case "GET" :
            try {
                const rawCookieHeader = req.headers.cookie;
                if (!rawCookieHeader) {
                    console.warn("Notification: User BFF - get JWT from auth_token cookie - No cookies received in request headers");

                    return res.status(200).json({ jwt: "" });
                }
                
                const parsedCookies = cookie.parse(rawCookieHeader);
                const token = parsedCookies[JWT_TOKEN_COOKIE_NAME];
                console.log("BFF JWT", token);
                // if token is either undefined or its value is an empty string, 
                // then it's no longer exist in the client browser
                return res.status(200).json({  jwt: token })    
            } catch (error) {
                console.error("User BFF - check auth_token cookie - Error: getting JWT from http-only cookie wasn't successful : ", error);
        
                throw error;
            }
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}  

export default handler;
