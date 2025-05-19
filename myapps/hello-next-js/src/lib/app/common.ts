import type { NextApiRequest, NextApiResponse } from 'next';
import { getSecret } from "./awsParameterStore";

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
export const DOMAIN_URL = process.env.NODE_ENV === "production"
    //? "https://www.yudimankwanmas.com"
    ? "http://localhost:3000" // [WIP] remote DB hasn't been created in the production environment
    : "http://localhost:3000";
export const BASE_URL = `${DOMAIN_URL}/hello-next-js`;
export const TASKS_BFF_BASE_API_URL = `${process.env.NODE_ENV === "production" ? BASE_URL : ""}/api/tasks/v1/bff`;
export const TASKS_SQL_BASE_API_URL = `${process.env.NODE_ENV === "production" ? BASE_URL : ""}/api/tasks/v1/sql`;      
        
export const getInternalApiKey = async (): Promise<string | undefined> => {
    // [WIP] remote DB hasn't been created in the production environment
    //const secretId = `/${process.env.NODE_ENV === "production" ? "prod" : "dev"}/tasks/bff/x-api-key`;    
    const secretId = "/dev/tasks/bff/x-api-key";

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
export const CHECK_API_KEY = async (req: NextApiRequest, res: NextApiResponse) => {
    const clientKey = req.headers["x-api-key"];
    const serverKey = await getInternalApiKey();
  
    if (clientKey !== serverKey) {
      return res.status(401).json({ error: "Unauthorized access: invalid API key" });
    }
}
