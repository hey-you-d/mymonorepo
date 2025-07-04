'use server';

import { cookies } from 'next/headers';
import argon2 from 'argon2';
import { 
    JWT_TOKEN_COOKIE_NAME, 
    TASKS_SQL_BASE_API_URL,  
    VERIFY_JWT_STRING,
    verifyJwtErrorMsgs,
    generateJWT,
    getJwtSecret,
} from '@/lib/app/common';
import { customResponseMessage, catchedErrorMessage } from '@/lib/app/error';
import { 
    registerUser as registerUserModel, 
    logInUser as logInUserModel,
    updateJwt as updateJwtUserModel,
} from '@/models/Task/use-server/TaskUserModel';
import type { UserModelType } from '@/types/Task';

const fnSignature = "use-server | view-model | getTasksUserViewModel";

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

export const registerUser = async (email: string, password: string) => {
    // lookup email in the db
    try {
        const outcome: UserModelType = await logInUserModel(email, TASKS_SQL_BASE_API_URL);
        if(!outcome.error && outcome.email && outcome.password && outcome.jwt) {
            // this email can't be used for registration, it has already existed in the DB
            return false;
        }
    } catch (error) {
        const errorMsg = await catchedErrorMessage(fnSignature, "registerUser -> logInUserModel", error as Error);
        throw new Error(errorMsg);
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
        
        const errorMsg = await catchedErrorMessage(fnSignature, "registerUser -> registerUserModel", error as Error);
        throw new Error(errorMsg);
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
                // Next, verify if the jwt stored in the cookie hasn't expired yet. Replace it with a new one if its already expired.
                const verificationOutcome = await VERIFY_JWT_STRING(outcome.jwt);

                if (!verificationOutcome.valid && verificationOutcome.error === verifyJwtErrorMsgs.TokenExpiredError) {
                    const jwtSecret: { jwtSecret: string } = await getJwtSecret();
                    const newJwt = await generateJWT(email, hashedPwd, jwtSecret.jwtSecret);
                    // update the DB
                    const result: UserModelType = await updateJwtUserModel(email, newJwt, TASKS_SQL_BASE_API_URL);

                    if (!result.error && result.jwt && result.jwt.length > 0) {
                        // then, store JWT in a http-only cookie
                        // for reference: since the cookie is meant for storing a sensitive data (JWT), then we have to create the cookie
                        // on the server-side (For server-side variant, via Next.js server actions instead of the API endpoint)
                        return await createAuthCookie(result.jwt);
                    } else {
                        const errorMsg = await customResponseMessage(fnSignature, "loginUser", result.message);
                        throw new Error(errorMsg);
                    }
                }

                // store JWT in a http-only cookie
                // for reference: since the cookie is meant for storing a sensitive data (JWT), then we have to create the cookie
                // on the server-side (For server-side variant, via Next.js server actions instead of the API endpoint)
                return await createAuthCookie(outcome.jwt);
            }
        }
        return false;
    } catch (error) {
        // just to be safe...
        await logoutUser();
        
        const errorMsg = await catchedErrorMessage(fnSignature, "loginUser", error as Error);
        throw new Error(errorMsg);
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
        const errorMsg = await catchedErrorMessage(fnSignature, "logoutUser", error as Error);
        throw new Error(errorMsg);
    }
}

export const checkAuthTokenCookieExist = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
        
        // check if token has already expired or not
        if (token && token.value.length > 0) {
            const result = await VERIFY_JWT_STRING(token.value);

            // delete the cookie if the token is already expired
            if (!result.valid && result.error === verifyJwtErrorMsgs.TokenExpiredError) {
                cookieStore.delete(JWT_TOKEN_COOKIE_NAME);
            }

            return ({  
                outcome: result.valid, 
                message: result.valid ? result.payload : result.error, 
            });
        }
        
        return ({  
            outcome: false, 
            message: `NOTIFICATION: ${fnSignature} | checkAuthTokenCookieExist | no auth_token in the client browser`, 
        });
    } catch (error) {
        const errorMsg = await catchedErrorMessage(fnSignature, "checkAuthTokenCookieExist", error as Error);
        throw new Error(errorMsg);
    }
}
