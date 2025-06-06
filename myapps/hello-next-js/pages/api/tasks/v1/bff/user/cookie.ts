import type { NextApiRequest, NextApiResponse } from 'next';
import { JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";
import cookie from 'cookie';

// for reference:
// for SPA: rely on BFF (the approach below) for any server-side operations
// for next.js pages: better use Page router's getServerSideProps or App router's server actions  
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case "GET" :
            try {
                const parsedCookies = cookie.parse(req.headers.cookie || '');
                const token = parsedCookies[JWT_TOKEN_COOKIE_NAME];

                // if token is either undefined or its value is an empty string, 
                // then it's no longer exist in the client browser
                return res.status(200).json({  outcome: token && token.length > 0 })    
            } catch (error) {
                console.error("User BFF - check auth_token cookie - Error: checking http-only cookie wasn't successful : ", error);
        
                throw error;
            }
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}  

export default handler;
