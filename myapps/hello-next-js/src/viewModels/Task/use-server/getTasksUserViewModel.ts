import { cookies } from 'next/headers';
import { getSecret } from '@/lib/app/awsSecretManager';
import argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import { BASE_URL } from '@/lib/app/common';
import { registerUser as registerUserModel } from '@/models/Task/use-server/TaskUserModel';
import { UserModelType } from '@/types/Task';
import { APP_ENV, LOCALHOST_MODE, LIVE_SITE_MODE } from '@/lib/app/featureFlags';

export const getJwtSecret = async () => {
    try {
        if (!process.env.AWS_REGION) {
            throw new Error("AWS Region is missing");
        }

        // obtain jwt secret from the AWS secret manager
        const secret = await getSecret(
            "dev/hello-next-js/jwt-secret", // or prod/hello-next-js/jwt-secret for prod ENV
            process.env.AWS_REGION
        );

        return secret;
    } catch(err) {
        console.error("Error: failed to obtain JWT from AWS Secret Manager ", err);
        throw err;
    }  
}

export const registerUser = async (email: string, password: string) => {
    // generate salted & hashed password string  with argon2id encryption.
    // for reference: just like bcrypt, Argon2 hashes include salt & parameters inside the hash string,
    // so we don't need to store those separately
    const hashedPwd = await argon2.hash(password, {
        type: argon2.argon2id, 
        memoryCost: 2 ** 16, // RAM usage in KiB (e.g, 65536 = 64 MB) - RAM resistance: makes GPU attacks expensive
        timeCost: 5, // number of iterations - higher = slower = safer
        parallelism: 1, // can increase if needed - match your server's CPU capabilities
    });

    // generate JTW token
    const jwtToken = sign(
        { email, hashedPassword: hashedPwd  },
        await getJwtSecret(),
        { expiresIn: '1h' }
    );

    // call model component to POST request to store credentials in DB
    try {
        const outcome: UserModelType = await registerUserModel(email, hashedPwd, jwtToken, `${BASE_URL}/api/tasks/v1/sql`);
        const cookieStore = await cookies();

        // store JWT in a cookie
        // for reference: since the cookie is meant for storing a sensitive data (JWT), then we have to create the cookie
        // on the server-side (For server-side variant, via Next.js server actions instead of the API endpoint)
        if (outcome.jwt) {
            cookieStore.set("auth_token", outcome.jwt, {
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
            const token = cookieStore.get("auth_token");

            return token && token.value === outcome.jwt;
        }
    } catch (error) {
        // just to be safe...
        await logoutUser();
        
        console.error("Failed to register a new user: ", error);

        throw error;
    } 
}

export const logoutUser = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
}