'use server';

import { fetchGraphQL } from '@/models/Task/use-server/TaskUserGraphqlClient';
import argon2 from 'argon2';
import { 
    logoutUser, 
    createAuthCookie, 
    generateHashedPassword,  
} from './getTasksUserViewModel';
import { generateJWT, getJwtSecret } from '@/lib/app/common';

import type { UserModelType } from '@/types/Task';

const fnSignature = "use-server | view-model | getTasksUserGraphQLViewModel";
const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
}

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
    } catch (error) {
        const errorMsg = await catchedErrorMessage("loginUser", error as Error);
        throw new Error(errorMsg);
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
        const errorMsg = await catchedErrorMessage("registerUser -> lookupUserQuery", error as Error);
        throw new Error(errorMsg);
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
    } catch (error) {
        // just to be safe...
        await logoutUser();
                
        const errorMsg = await catchedErrorMessage("registerUser", error as Error);
        throw new Error(errorMsg);
    }
}