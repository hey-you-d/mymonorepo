import type { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';
import argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import { UserModelType } from '@/types/Task';
import { getSecret } from '@/lib/app/awsSecretManager';
import { JWT_TOKEN_COOKIE_NAME, TASKS_SQL_BASE_API_URL, TASKS_API_HEADER } from "@/lib/app/common";
import { APP_ENV, LOCALHOST_MODE, LIVE_SITE_MODE } from '@/lib/app/featureFlags';

export const getJwtSecret = async () => {
    try {
        if (!process.env.AWS_REGION) {
            throw new Error("AWS Region is missing");
        }

        // obtain jwt secret from the AWS secret manager
        const secret: { jwtSecret: string } = await getSecret(
            "dev/hello-next-js/jwt-secret", // or prod/hello-next-js/jwt-secret for prod ENV
            process.env.AWS_REGION
        );

        return secret;
    } catch(err) {
        console.error("Error: failed to obtain JWT from AWS Secret Manager ", err);
        throw err;
    }  
}

export const createAuthCookie = async (res: NextApiResponse, jwt: string) => {
    const path = APP_ENV == "LIVE" 
        ? LIVE_SITE_MODE.cookie.path 
        : LOCALHOST_MODE.cookie.path;
    const secure = APP_ENV == "LIVE" 
        ? LIVE_SITE_MODE.cookie.secure
        : LOCALHOST_MODE.cookie.secure;

    const cookieParts = [
        `${JWT_TOKEN_COOKIE_NAME}=${jwt}`,
        `Path=${path}`,
        'HttpOnly',
        'Max-Age=3600',
        'SameSite=Strict',
    ];
    if (secure) cookieParts.push('Secure'); // Append 'Secure' only if true

    res.setHeader('Set-Cookie', cookieParts.join('; '));
}

export const generateHashedPassword = async (password: string) => {
    // generate salted & hashed password string  with argon2id encryption.
    // for reference: just like bcrypt, Argon2 hashes include salt & parameters inside the hash string,
    // so we don't need to store those separately
    return await argon2.hash(password, {
        type: argon2.argon2id, 
        memoryCost: 2 ** 16, // RAM usage in KiB (e.g, 65536 = 64 MB) - RAM resistance: makes GPU attacks expensive
        timeCost: 5, // number of iterations - higher = slower = safer
        parallelism: 1, // can increase if needed - match your server's CPU capabilities
    });
}

export const generateJWT = async (email: string, hashedPwd: string, jwtSecret: string) => {
    return await sign(
        { email, hashedPassword: hashedPwd  },
        jwtSecret,
        { expiresIn: '1h' }
    );
}

const handler = async (req: NextApiRequest, res: NextApiResponse, overrideFetchUrl?: string): Promise<void> => {
    switch (req.method) {
        case "POST" :
            try {
                const { email, password } : { email: string, password: string } = req.body;
                if (!email || email.trim().length < 1) {
                    return res.status(400).json(
                        { error: true, message: 'BFF user registration error - Email is required' }
                    );
                }
                if (!password || password.trim().length < 1) {
                    return res.status(400).json(
                        { error: true, message: 'BFF user registration error - Email is required' }
                    );  
                }
                // generate salted & hashed password string  with argon2id encryption.
                const hashedPwd = await generateHashedPassword(password);
            
                // generate JTW token
                const jwtSecret: { jwtSecret: string } = await getJwtSecret();
                const jwt = await generateJWT(email, hashedPwd, jwtSecret.jwtSecret);
                
                // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
                // In this case, we must supply an absolute URL  
                const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
                
                const response = await fetch(`${finalUrl}/user/register`, {
                    method: 'POST',
                    headers: await TASKS_API_HEADER(),
                    body: JSON.stringify({
                        email,
                        password: hashedPwd,
                        jwt,
                    }),
                });
            
                if (!response.ok) {
                    console.error("User BFF - Error registering user credential: ", `${response.status} - ${response.statusText}`);
                    // If the response isn't OK, throw an error to be caught in the catch block
                    throw new Error(`User BFF - Error registering user credential in DB: ${response.status} ${response.statusText}`);
                } 
            
                const outcome: UserModelType = await response.json();
                
                // store JWT in a http-only cookie
                if (outcome.jwt) {
                    await createAuthCookie(res, outcome.jwt);
                    
                    return res.status(200).json({
                        error: false,
                        message: "User BFF - successful user registration process" 
                    });
                }

                return res.status(500).json({
                    error: true,
                    message: "User BFF - user registration error - jwt is undefined"
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
