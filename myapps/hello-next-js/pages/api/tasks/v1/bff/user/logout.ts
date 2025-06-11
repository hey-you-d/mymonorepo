import type { NextApiRequest, NextApiResponse } from 'next';
import { JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";

// for reference:
// for SPA: rely on BFF (the approach below) for any server-side operations
// for next.js pages: better use Page router's getServerSideProps or App router's server actions 
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case "GET" :
            try {
                // Invalidate cookie by setting it to empty with maxAge = 0
                res.setHeader('Set-Cookie', `${JWT_TOKEN_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict`);
                
                // let client verify if the cookie has been deleted in a subsequent request
                return res.status(200).json({ 
                    error: false, message: 'User BFF - user logout process - successfully deleting http-only cookie' 
                });
            } catch (error) {
                console.error("User BFF - user logout process - http-only cookie deletion failed : ", error);
        
                throw error;
            }
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}  

export default handler;
