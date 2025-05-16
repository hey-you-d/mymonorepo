import type { NextApiRequest, NextApiResponse } from 'next';
import { getSecret } from "./awsParameterStore";

export const MONOREPO_PREFIX = "/hello-next-js";
export const TASKS_CRUD = "/task-crud-fullstack";

export const getInternalApiKey = async (): Promise<string | undefined> => {
    const secretId = `/${process.env.NODE_ENV === "production" ? "prod" : "dev"}/tasks/bff/x-api-key`;    

    const xApiKey = await getSecret(secretId);
    
    return xApiKey;
}

// can only be called on server-side only
export const TASKS_BFF_HEADER = async () => {
    return {
        "Content-Type": "application/json",
        "hello": "world",
        "x-api-key": await getInternalApiKey() ?? "",
    }    
}; 

export const CHECK_BFF_AUTHORIZATION = async (req: NextApiRequest, res: NextApiResponse) => {
    const clientKey = req.headers["x-api-key"];
    const serverKey = await getInternalApiKey();
  
    if (clientKey !== serverKey) {
      return res.status(401).json({ error: "Unauthorized access: invalid API key" });
    }
}
