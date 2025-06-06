import type { NextApiRequest, NextApiResponse } from 'next';
import argon2 from 'argon2';
import { createAuthCookie } from './register';
import { UserModelType } from '@/types/Task';
import { TASKS_SQL_BASE_API_URL, TASKS_API_HEADER } from "@/lib/app/common";

const handler = async (req: NextApiRequest, res: NextApiResponse, overrideFetchUrl?: string): Promise<void> => {
    switch (req.method) {
        case "POST" :
            try {
                const { email, password } : { email: string, password: string } = req.body;
                if (!email || email.trim().length < 1) {
                    return res.status(400).json(
                        { error: true, message: 'BFF user login error - Email is required' }
                    );
                }
                if (!password || password.trim().length < 1) {
                    return res.status(400).json(
                        { error: true, message: 'BFF user login error - Password is required' }
                    );
                }

                // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
                // In this case, we must supply an absolute URL  
                const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
                const response = await fetch(`${finalUrl}/user/lookup`, {
                    method: 'POST',
                    headers: await TASKS_API_HEADER(),
                    body: JSON.stringify({
                        email,
                    }),
                });

                if (!response.ok) {
                    console.error("User BFF - Error checking user credential: ", `${response.status} - ${response.statusText}`);
                    // If the response isn't OK, throw an error to be caught in the catch block
                    throw new Error(`User BFF - Error checking user credential in db: ${response.status} ${response.statusText}`);
                } 
            
                const outcome: UserModelType = await response.json();

                // confirm the site visitor entered the correct password
                if (!outcome.error && outcome.email && outcome.password && outcome.jwt) {
                    const hashedPwd = outcome.password;
                    const pwdOk = await argon2.verify(hashedPwd, password);
                    if (pwdOk && outcome.jwt) {
                        // store JWT in a http-only cookie
                        // for reference: since the cookie is meant for storing a sensitive data (JWT), then we have to create the cookie
                        // on the server-side 
                        await createAuthCookie(res, outcome.jwt);

                        return res.status(200).json({
                            error: false,
                            message: "User BFF - successful user login process" 
                        });
                    }
                }

                return res.status(500).json({
                    error: true,
                    message: "User BFF - user login error - jwt is undefined"
                });
            } catch(error) {
                console.error("User BFF - Error registering user credential: ", error );
                throw error;
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);                      
    } 
}

export default handler;
                                