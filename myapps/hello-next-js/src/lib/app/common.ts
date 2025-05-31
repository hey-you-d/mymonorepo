import type { NextApiRequest, NextApiResponse } from 'next';
import { getSecret } from "./awsParameterStore";
import { LOCALHOST_MODE, LIVE_SITE_MODE, APP_ENV } from './featureFlags';

export const MONOREPO_PREFIX = "/hello-next-js";
export const TASKS_CRUD = "/task-crud-fullstack";

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
export const TASKS_BFF_BASE_API_URL = `${BASE_URL}/api/tasks/v1/bff`;
export const TASKS_SQL_BASE_API_URL = `${BASE_URL}/api/tasks/v1/sql`;      
        
export const getInternalApiKey = async (): Promise<string | undefined> => {
    const secretId = APP_ENV === "LIVE" ? LIVE_SITE_MODE.apiKeyId : LOCALHOST_MODE.apiKeyId; 
    const xApiKey = await getSecret(secretId);
    
    return xApiKey;
}

// for reference: can only be called on server-side only
export const TASKS_API_HEADER = async () => {
    return {
        "Content-Type": "application/json",
        "x-api-key": await getInternalApiKey() ?? "",
    }    
}; 

// for reference: can only be called on server-side only
export const CHECK_API_KEY = async (req: NextApiRequest, _: NextApiResponse) => {
    const clientKey = req.headers["x-api-key"];
    const serverKey = await getInternalApiKey();

    return clientKey === serverKey; 
}
