'use server';

import { cookies } from 'next/headers';
import { getSecret } from '@/lib/app/awsSecretManager';
import argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import { JWT_TOKEN_COOKIE_NAME, TASKS_SQL_BASE_API_URL  } from '@/lib/app/common';
import { 
    registerUser as registerUserModel, 
    logInUser as logInUserModel,
} from '@/models/Task/use-server/TaskUserModel';
import type { UserModelType } from '@/types/Task';

// TODO: Move this to @/lib/app/common
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

export const createAuthCookie = async (jwt: string) => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { APP_ENV, LOCALHOST_MODE, LIVE_SITE_MODE } = await import('@/lib/app/featureFlags');

    const cookieStore = await cookies();

    cookieStore.set(JWT_TOKEN_COOKIE_NAME, jwt, {
        httpOnly: true, // always set to true to prevent XSS attacks
        secure: APP_ENV == "LIVE" 
            ? LIVE_SITE_MODE.cookie.secure
            : LOCALHOST_MODE.cookie.secure, // set to true to travel over HTTPS
        sameSite: 'strict', // set to strict to prevent CSRF attack
        maxAge: 3600, // lets keep token expiration short (1hr or less for access token)
        path: APP_ENV == "LIVE" 
            ? LIVE_SITE_MODE.cookie.path 
            : LOCALHOST_MODE.cookie.path, // limit cookie accessibility
    });

    // verify cookie creation is successful before returning 
    const token = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
    if (token && token.value === jwt) return true;
    return false; 
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

export const registerUser = async (email: string, password: string) => {
    // lookup email in the db
    try {
        const outcome: UserModelType = await logInUserModel(email, TASKS_SQL_BASE_API_URL);
        if(!outcome.error && outcome.email && outcome.password && outcome.jwt) {
            // this email can't be used for registration, it has already existed in the DB
            return false;
        }
    } catch (error) {
        console.error("Failed to lookup the entered email in the DB as part of the user registration process: ", error);

        throw error;
    } 
    
    // generate salted & hashed password string  with argon2id encryption.
    const hashedPwd = await generateHashedPassword(password);

    // generate JTW token
    const jwtSecret: { jwtSecret: string } = await getJwtSecret();
    const jwt = await generateJWT(email, hashedPwd, jwtSecret.jwtSecret);
    
    // call model component to POST request to store credentials in DB
    try {
        const outcome: UserModelType = await registerUserModel(email, hashedPwd, jwt, TASKS_SQL_BASE_API_URL);
        
        // store JWT in a cookie
        // for reference: since the cookie is meant for storing a sensitive data (JWT), then we have to create the cookie
        // on the server-side (For server-side variant, via Next.js server actions instead of the API endpoint)
        if (outcome.jwt && outcome.jwt.length > 0) {
            const cookieCreation = await createAuthCookie(outcome.jwt);
            if (cookieCreation) {
                return cookieCreation;
            } 
        }
        return false;
    } catch (error) {
        // just to be safe...
        await logoutUser();
        
        console.error("Failed to register a new user: ", error);

        throw error;
    } 
}

export const loginUser = async (email: string, password: string) =>  {
    try {
        // check backend if the credential exists, and return jwt if confirmed to be exist
        const outcome: UserModelType = await logInUserModel(email, TASKS_SQL_BASE_API_URL);
        // confirm the site visitor entered the correct password
        if (!outcome.error && outcome.email && outcome.password && outcome.jwt) {
            const hashedPwd = outcome.password;
            const pwdOk = await argon2.verify(hashedPwd, password);
            if (pwdOk && outcome.jwt) {
                // store JWT in a cookie
                // for reference: since the cookie is meant for storing a sensitive data (JWT), then we have to create the cookie
                // on the server-side (For server-side variant, via Next.js server actions instead of the API endpoint)
                return await createAuthCookie(outcome.jwt);
            }
        }
        return false;
    } catch (error) {
        // just to be safe...
        await logoutUser();
        
        console.error("Failed to login : ", error);

        throw error;
    }
}

export const logoutUser = async () => {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(JWT_TOKEN_COOKIE_NAME);
        
        // verify cookie deletion is successful before returning 
        const token = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
        // if token is either undefined or its value is an empty string, 
        // then it's no longer exist in the client browser, which what we want
        return token && token.value.length > 0 ? false : true;
    } catch (error) {
        console.error("Failed to logout : ", error);

        throw error;
    }
}

export const checkAuthTokenCookieExist = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(JWT_TOKEN_COOKIE_NAME);

        return token && token.value.length > 0;
    } catch (error) {
        console.error("Failed to check auth cookie : ", error);

        throw error;
    }
}
