// REMOTE: JWT secret is stored in AWS Secret Manager, API key is stored in AWS Parameter Store
// LOCAL: both secrets are defined in env.local
type SecretLocationType = "REMOTE" | "LOCAL";
// LIVE: remote (serverless) hosting
// LOCAL: localhost
type AppEnvType = "LIVE" | "LOCAL";
type EnvModeType = {
    apiKeyId: string,
    domain: string,
    base: {
        clientSide: string,
        serverSide: string,
    },
    cookie: {
        secure: boolean,
        path: string,
    },
    db: {
        connectionString: string,
        ssl: boolean | { rejectUnauthorized: boolean },
    }
}

// server-side only. 
export const APP_ENV: AppEnvType = process.env.APP_ENV // process.env.APP_ENV is defined in both .env.local & dockerfile 
    ? process.env.APP_ENV as AppEnvType
    : "LOCAL";

// server-side only - SECRET_LOCATION is always set to REMOTE if APP_ENV === LIVE
export const SECRET_LOCATION: SecretLocationType = process.env.SECRETLOCATION
    ? APP_ENV === "LOCAL" ? process.env.SECRETLOCATION as SecretLocationType : "REMOTE"
    : "LOCAL";

export const LIVE_SITE_MODE: EnvModeType = {
    apiKeyId: "/prod/tasks/bff/x-api-key",
    domain: "https://www.yudimankwanmas.com",
    base: {
        clientSide: "https://www.yudimankwanmas.com/hello-next-js",
        serverSide: "https://www.yudimankwanmas.com/hello-next-js",
    },
    cookie: {
        secure: true,
        path: "/hello-next-js", // only accessible by /hello-next-js site
    },
    db: {
        connectionString: "", // [WIP] hasn't determined Live DB provider
        ssl: { rejectUnauthorized: false },
    }
}

export const LOCALHOST_MODE: EnvModeType = {
    apiKeyId: "/dev/tasks/bff/x-api-key",
    domain: "http://localhost:3000",
    base: {
        clientSide: "", // can be a relative url
        serverSide: "http://localhost:3000", // must be an absolute url
    },
    cookie: {
        secure: false,
        path: "/",
    },
    db: {
        connectionString: "postgres://postgres:postgres@localhost:5432/tasks-db",
        ssl: false,
    }
}

export const TABLE_FILTER_OPTIMISATION = {
    withUseDeferredValue: true, // recommended to optimise your filter feature 
    withUseTransition: false, // not recommended for this use case scenario
}

export const ERROR_REPORTING_TARGET: "remoteLogging" | "consoleError" = "consoleError";
