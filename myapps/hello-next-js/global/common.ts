import { getSecret } from "./awsParameterStore";

export const MONOREPO_PREFIX = "/hello-next-js";

// server-side only
export const TASKS_BFF_HEADER = async () => {
    const secretId = process.env.NODE_ENV === "production" 
        ? "/prod/tasks/bff/x-api-key"
        : "/dev/tasks/bff/x-api-key";

    const xApiKey = await getSecret(secretId);

    return {
        "Content-Type": "application/json",
        "hello": "world",
        "x-api-key": xApiKey ?? "",
    }    
}; 
