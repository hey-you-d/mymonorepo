'use server';

import { fetchGraphQL } from '@/models/Task/use-server/TaskUserGraphqlClient';
import argon2 from 'argon2';
import { 
    logoutUser, 
    getJwtSecret, 
    createAuthCookie, 
    generateHashedPassword, 
    generateJWT 
} from './getTasksUserViewModel';
import type { UserModelType } from '@/types/Task';

const lookupUserQuery = `
    query LookUpUser($email: String!) {
        lookupUser(email: $email) {
            id,
            auth_type,
            email,
            hashed_pwd,
            jwt,
            admin_access,
            created_at,
            updated_at,
        }
    }
`;

const registerUserMutation = `
    mutation RegisterUser($email: String!, $password: String!, $jwt: String!) {
        registerUser(email: $email, hashed_pwd: $password, jwt: $jwt) {
            id,
            auth_type,
            email,
            hashed_pwd,
            jwt,
            admin_access,
            created_at,
            updated_at,
        }
    }
`;

export const loginUser = async (email: string, password: string) => {
    try {
        // check backend if the credential exists, and return jwt if confirmed to be exist
        const variables = { email };
        const outcome: UserModelType = await fetchGraphQL(lookupUserQuery, variables);

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
    } catch (e) {
        console.error("getTasksUserGraphQLViewModel | Failed to lookup a user: ", e);
        throw e;
    }
};

export const registerUser = async(email: string, password: string) => {
    try {
        // lookup email in the db
        const outcome: UserModelType = await fetchGraphQL(lookupUserQuery, { email });
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
    
    try {
        const variables = { email, password: hashedPwd, jwt };
        const outcome: UserModelType = await fetchGraphQL(registerUserMutation, variables);

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
    } catch (e) {
        // just to be safe...
        await logoutUser();
                
        console.error("getTasksUserGraphQLViewModel | Failed to register a new user: ", e);
        throw e;
    }
}