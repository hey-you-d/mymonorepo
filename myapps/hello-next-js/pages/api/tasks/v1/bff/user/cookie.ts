import type { NextApiRequest, NextApiResponse } from 'next';
import { JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";
import { cookies } from 'next/headers';

// for reference: instead of creating a BFF endpoint that doesn't fetch any data from the API endpoint,
// creating a server-side component is considered to be a better approach. However, since the server-side variant MVVM
// has already demonstrated the implementation of user logout process via the server component, and also 
// for the sake of consistency, we'll stick with this implementation.  
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case "GET" :
            try {
                const cookieStore = await cookies();
                
                const token = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
                // if token is either undefined or its value is an empty string, 
                // then it's no longer exist in the client browser
                return res.status(200).json({  outcome: token && token.value.length > 0 })    
            } catch (error) {
                console.error("User BFF - user logout process - checking http-only cookie wasn't successful : ", error);
        
                throw error;
            }
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}  

export default handler;
