import type { NextApiRequest, NextApiResponse } from 'next';
import argon2 from 'argon2';
import { serialize } from 'cookie';
import type { UserModelType } from '@/types/Task';
import { 
    JWT_TOKEN_COOKIE_NAME, 
    TASKS_SQL_BASE_API_URL, 
    TASKS_API_HEADER, 
} from "@/lib/app/common";
import { APP_ENV, LOCALHOST_MODE, LIVE_SITE_MODE } from '@/lib/app/featureFlags';
import { getJwtSecret, generateJWT } from '@/lib/app/common';
import { 
    customResponseMessage, 
    missingParamErrorMessage, 
    catchedErrorMessage, 
    notOkErrorMessage 
} from '@/lib/app/error';

const fnSignature = "tasks/v1 | BFF | user/register.ts";

export const createAuthCookie = async (res: NextApiResponse, jwt: string) => {
    /*
    const cookieParts = [
        `${JWT_TOKEN_COOKIE_NAME}=${jwt}`,
        `Path=${path}`,
        'HttpOnly',
        'Max-Age=3600',
        'SameSite=Strict',
    ];
    if (secure) cookieParts.push('Secure'); // Append 'Secure' only if true

    res.setHeader('Set-Cookie', cookieParts.join('; '));
    */
    const path = APP_ENV == "LIVE" 
        ? LIVE_SITE_MODE.cookie.path 
        : LOCALHOST_MODE.cookie.path;
    const secure = APP_ENV == "LIVE" 
        ? LIVE_SITE_MODE.cookie.secure
        : LOCALHOST_MODE.cookie.secure;

    const cookieStr = serialize(JWT_TOKEN_COOKIE_NAME, jwt, {
        httpOnly: true,
        secure,
        path,
        sameSite: 'strict',
        maxAge: 3600, // 1hr
    });

    res.setHeader('Set-Cookie', cookieStr);
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

const handler = async (req: NextApiRequest, res: NextApiResponse, overrideFetchUrl?: string): Promise<void> => {
    switch (req.method) {
        case "POST" :
            try {
                const { email, password } : { email: string, password: string } = req.body;
                if (!email || email.trim().length < 1) {
                    return res.status(400).json(
                        { error: true, message: await missingParamErrorMessage(fnSignature, "POST", "Email is required"), }
                    );
                }
                if (!password || password.trim().length < 1) {
                    return res.status(400).json(
                        { error: true, message: await missingParamErrorMessage(fnSignature, "POST", "Password is required"), }
                    );  
                }

                // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
                // In this case, we must supply an absolute URL
                const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;

                // lookup email in the db
                // JWT auth is not needed for user registration process.
                // JWT will become accessible via cookie after successful registration
                try {
                    const response = await fetch(`${finalUrl}/user/lookup`, {
                        method: 'POST',
                        headers: await TASKS_API_HEADER(),
                        body: JSON.stringify({
                            email,
                        }),
                        credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                    });

                    if (!response.ok) {
                        const errorMsg = await notOkErrorMessage(fnSignature, "POST", response);
                        throw new Error(errorMsg);
                    } 
                
                    const outcome: UserModelType = await response.json();

                    if(!outcome.error && outcome.email && outcome.password && outcome.jwt) {
                        // this email can't be used for registration, it has already existed in the DB
                        return res.status(200).json({
                            error: true,
                            message: await customResponseMessage(fnSignature, "POST", "Email address cannot be used for registration"), 
                        });
                    }
                } catch (err) {
                    const errorMsg = await catchedErrorMessage(fnSignature, "POST", err as Error);
                    return res.status(500).json({ error: errorMsg });
                } 

                // generate salted & hashed password string  with argon2id encryption.
                const hashedPwd = await generateHashedPassword(password);
            
                // generate JTW token
                const jwtSecret: { jwtSecret: string } = await getJwtSecret();
                const jwt = await generateJWT(email, hashedPwd, jwtSecret.jwtSecret);
                
                // JWT auth is not needed for user registration process.
                // JWT will become accessible via cookie after successful registration
                const response = await fetch(`${finalUrl}/user/register`, {
                    method: 'POST',
                    headers: await TASKS_API_HEADER(),
                    body: JSON.stringify({
                        email,
                        password: hashedPwd,
                        jwt,
                    }),
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                });
            
                if (!response.ok) {
                        const errorMsg = await notOkErrorMessage(fnSignature, "POST - Error registering user credential: ", response);
                        throw new Error(errorMsg);
                } 
            
                const outcome: UserModelType = await response.json();
                
                // store JWT in a http-only cookie
                if (outcome.jwt === jwt) {
                    await createAuthCookie(res, outcome.jwt);
                    
                    return res.status(200).json({
                        error: false,
                        message: await customResponseMessage(fnSignature, "POST", "successful user registration") 
                    });
                }
               
                return res.status(500).json({
                    error: true,
                    message: await notOkErrorMessage(fnSignature, "POST - Error registering user credential - JWT is undefined: ", response)
                });
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "POST - Error registering user credential: ", error as Error);
                return res.status(500).json({ error: errorMsg });
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);                      
    } 
}

export default handler;
