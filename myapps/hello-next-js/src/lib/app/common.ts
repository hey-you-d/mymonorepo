import type { NextApiRequest, NextApiResponse } from 'next';
import type { Request as ExpressRequest } from 'express';
import type { VerifyJwtResult } from '@/types/Task';
import { getSecret } from "./awsParameterStore";
import { getSecret as getFrmSecretMgr } from '@/lib/app/awsSecretManager';
import { LOCALHOST_MODE, LIVE_SITE_MODE, APP_ENV, SECRET_LOCATION } from './featureFlags';
import * as cookie from 'cookie';
import { verify, sign } from 'jsonwebtoken';

export const MONOREPO_PREFIX = "/hello-next-js";
export const TASKS_CRUD = "/task-crud-fullstack";

export const JWT_TOKEN_COOKIE_NAME = "auth_token";

export const checkRuntime = () => {
    //export const runtime = "nodejs";
    console.log('Runtime check:', typeof process !== 'undefined' ? 'Node.js' : 'Edge');
}

// for reference: This works locally, in Docker, and in production (e.g., on Vercel or behind a reverse proxy).
// for reference: can only be called on server-side only
export const isRunningLocally = (req: NextApiRequest) => {
    const isLocalhost = (hostname: string) => hostname === 'localhost' || hostname === '127.0.0.1';

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const fullUrl = `${protocol}://${req.headers.host}`;
    const hostname = new URL(fullUrl).hostname;

    return isLocalhost(hostname);
}

// for reference: can only be called on server-side only
export const DOMAIN_URL = APP_ENV === "LIVE" ? LIVE_SITE_MODE.domain : LOCALHOST_MODE.domain;
export const BASE_URL = APP_ENV === "LIVE" ? LIVE_SITE_MODE.base.serverSide : LOCALHOST_MODE.base.serverSide;
export const BASE_URL_CLIENT_COMP = APP_ENV === "LIVE" ? LIVE_SITE_MODE.base.clientSide : LOCALHOST_MODE.base.clientSide;

export const TASKS_BFF_RELATIVE_URL = "/api/tasks/v1/bff";
export const TASKS_BFF_BASE_API_URL = `${BASE_URL}${TASKS_BFF_RELATIVE_URL}`;
export const TASKS_BFF_DOMAIN_API_URL = `${DOMAIN_URL}${TASKS_BFF_RELATIVE_URL}`;

export const TASKS_API_RELATIVE_URL = "/api/tasks/v1/sql";
export const TASKS_SQL_BASE_API_URL = `${BASE_URL}${TASKS_API_RELATIVE_URL}`;   
export const TASKS_SQL_DOMAIN_API_URL = `${DOMAIN_URL}${TASKS_API_RELATIVE_URL}`;   
        
export const getInternalApiKey = async (): Promise<string | undefined> => {
    const secretId = APP_ENV === "LIVE" ? LIVE_SITE_MODE.apiKeyId : LOCALHOST_MODE.apiKeyId; 
    const xApiKey = await getSecret(secretId);
    
    return xApiKey;
}

// for reference: can only be called on server-side only
export const getJWTFrmHttpOnlyCookie = async (req: NextApiRequest): Promise<string> => {
    const rawCookieHeader = req.headers.cookie;
    if (!rawCookieHeader) {
        console.warn("Notification: BFF - get JWT from auth_token cookie - No cookies received in request headers");

        return "";
    }

    const parsedCookies = cookie.parse(rawCookieHeader);
    const token = parsedCookies[JWT_TOKEN_COOKIE_NAME];
    
    return token ?? "";
}

// for reference: can only be called on server-side only
export const TASKS_API_HEADER = async (jwt?: string) => {
    const defaultHeader = {
        "Content-Type": "application/json",
        "x-api-key": await getInternalApiKey() ?? "",
    };

    if (jwt && jwt.length > 0) return {...defaultHeader, ...{Authorization: `Bearer ${jwt}`,}};
    
    return defaultHeader;
}

// for reference: can only be called on server-side only
export const CHECK_API_KEY = async (req: NextApiRequest, _: NextApiResponse) => {
    if (SECRET_LOCATION === "LOCAL") {
        return process.env.TEST_API_KEY ? process.env.TEST_API_KEY : "67890";
    }

    const clientKey = req.headers["x-api-key"];
    const serverKey = await getInternalApiKey();

    return clientKey === serverKey; 
}

export const generateJWT = async (email: string, hashedPwd: string, jwtSecret: string) => {
    return await sign(
        { email, hashedPassword: hashedPwd  },
        jwtSecret,
        { expiresIn: '900000' } // 90000ms = 15mins
    );
}

export const getJwtSecret = async () => {
    if (SECRET_LOCATION === "LOCAL") {
        return { jwtSecret: process.env.TEST_JWT_SECRET ? process.env.TEST_JWT_SECRET : "12345" };
    }

    try {
        if (!process.env.AWS_REGION) {
            throw new Error("AWS Region is missing");
        }

        // obtain jwt secret from the AWS secret manager
        const secret: { jwtSecret: string } = await getFrmSecretMgr(
            "dev/hello-next-js/jwt-secret", // or prod/hello-next-js/jwt-secret for prod ENV
            process.env.AWS_REGION
        );

        return secret;
    } catch(err) {
        console.error("Error: failed to obtain JWT from AWS Secret Manager ", err);
        throw err;
    }  
}

export const verifyJwtErrorMsgs = {
    TokenExpiredError: 'VERIFY_JWT | Token Expired',
    JsonWebTokenError: 'VERIFY_JWT | Invalid JWT error',
    UnknownError: 'VERIFY_JWT | Unknown JWT error',
    NotExistInCookieError: 'VERIFY_JWT | No cookies received in request headers',
}

// Sample expired token for debugging:
// U: yudiman@kwanmas.com
// P: 1234567
// JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Inl1ZGltYW5Aa3dhbm1hcy5jb20iLCJoYXNoZWRQYXNzd29yZCI6IiRhcmdvbjJpZCR2PTE5JG09NjU1MzYsdD01LHA9MSRpVmJyUEV5MUNvWUpWSkd1ZExpTTRnJHNickpUdmx0WnFIWGlhUGpTYjh2NWNtckZJcjJ3ZzhEQVNnMnFmek1kYW8iLCJpYXQiOjE3NDg4NDMxMjEsImV4cCI6MTc0ODg0NjcyMX0.GPpStUDxrhoBtiZPixYxNnC4zCPk4z7ng8V4w6GgJrI
export const VERIFY_JWT_STRING = async(jwt: string): Promise<VerifyJwtResult> => {
    try {
        const secret = await getJwtSecret();
        const decoded = verify(jwt, secret.jwtSecret);

        return  { valid: true, payload: decoded };
    } catch (err) {
        switch((err as Error).name) {
            case "TokenExpiredError" :
                console.warn(`VERIFY_JWT_STRING | ${verifyJwtErrorMsgs.TokenExpiredError}`);
                return { valid: false, error: verifyJwtErrorMsgs.TokenExpiredError };
            case "JsonWebTokenError" :
                console.error(`VERIFY_JWT_STRING | ${verifyJwtErrorMsgs.JsonWebTokenError}`);
                return { valid: false, error: verifyJwtErrorMsgs.JsonWebTokenError };
            default:
                console.error(`VERIFY_JWT_STRING | ${verifyJwtErrorMsgs.UnknownError}`);
                return { valid: false, error: verifyJwtErrorMsgs.UnknownError };
        }
    }
}

export const VERIFY_JWT_IN_AUTH_HEADER = async (req: NextApiRequest | ExpressRequest): Promise<VerifyJwtResult> => {
    const authorization = req.headers.authorization;
    if (!authorization || Array.isArray(authorization) || !authorization.startsWith('Bearer ')) {
        return { valid: false, error: "VERIFY_JWT | Invalid or missing Authorization header" };
    }

    // for reference: header.Authorization.split(' ')[0] == "Bearer" 
    const token = authorization.split(' ')[1];
    
    return VERIFY_JWT_STRING(token);
}

export const VERIFY_JWT_RETURN_API_RES = async (req: NextApiRequest, res: NextApiResponse) => {
    const outcome = await VERIFY_JWT_IN_AUTH_HEADER(req);

    if (!outcome.valid) {
        switch(outcome.error) {
            case verifyJwtErrorMsgs.TokenExpiredError :
                return res.status(201).json({ error: outcome.error });
            case verifyJwtErrorMsgs.JsonWebTokenError :
                return res.status(403).json({ error: outcome.error });
            default:
                return res.status(500).json({ error: outcome.error });        
        }
    }

    return true;
}

export const isSafeInput = (str: string) => {
    // for reference: To prevent SQL injection attack
    // Only allow alphanumeric characters, basic punctuation, and whitespace
    //const regex = /^[a-zA-Z0-9\s.,!?'"()\-_:;]{1,500}$/;
    //return regex.test(str);

    // Length check
    if (str.length === 0 || str.length > 500) return false;

    // Character whitelist - removed potentially dangerous chars
    const allowedChars = /^[a-zA-Z0-9\s.,!?()\-_:]+$/;
    if (!allowedChars.test(str)) return false;

    // Blacklist dangerous patterns
    const dangerousPatterns = [
        /--;/,                    // SQL comment
        /\/\*/,                   // Multi-line comment start
        /\*\//,                   // Multi-line comment end
        /<script/i,               // Script tag
        /javascript:/i,           // JavaScript protocol
        /on\w+\s*=/i,            // Event handlers
        /drop|delete|insert|update|select|union|exec/i // SQL keywords
    ];

    return !dangerousPatterns.some(pattern => pattern.test(str));
};
