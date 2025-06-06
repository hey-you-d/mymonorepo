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
                cookieStore.delete(JWT_TOKEN_COOKIE_NAME);
                
                // verify cookie deletion is successful before returning 
                const token = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
                // if token is either undefined or its value is an empty string, 
                // then it's no longer exist in the client browser, which what we want
                return token && token.value.length > 0 
                    ? res.status(500).json({ 
                        error: true, message: 'User BFF - user logout process - http-only cookie deletion failed' 
                    }) 
                    : res.status(200).json({ 
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
