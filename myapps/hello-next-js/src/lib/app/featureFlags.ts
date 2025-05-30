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

export const APP_ENV: AppEnvType = "LOCAL"; // Temporary flag until the prod db is ready

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
