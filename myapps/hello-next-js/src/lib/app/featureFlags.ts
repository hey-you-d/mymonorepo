// REMOTE: JWT secret is stored in AWS Secret Manager, API key is stored in AWS Parameter Store
// LOCAL: both secrets are defined in env.local
type SecretKeyLocationType = "REMOTE" | "LOCAL";
// REMOTE: supabase service
// LOCAL: local-machine installed PostgreSQL DB
type SqlDbLocationType = "REMOTE" | "LOCAL";
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
    jwt: {
        secretId: string,
    },
    db: {
        localDb?: {
            connectionString: string,
            ssl: boolean | { rejectUnauthorized: boolean },
        },
        supabase: {
            connectionString: {
                beforeDbPasswordPartial: string,
                afterDbPasswordPartial: string,
            },
            ssl: boolean | { rejectUnauthorized: boolean },
            awsParamStore: {
                url: string,
                apiKey: string,
                dbPassword: string,
            }
        }
    }
}

// server-side only. 
export const APP_ENV: AppEnvType = process.env.APP_ENV // process.env.APP_ENV is defined in both .env.local & dockerfile 
    ? process.env.APP_ENV as AppEnvType
    : "LOCAL";

// server-side only    
export const SQL_DB_LOCATION: SqlDbLocationType = process.env.SQL_DB_LOCATION
    ? APP_ENV === "LOCAL" ? process.env.SQL_DB_LOCATION as SqlDbLocationType : "REMOTE"
    : "LOCAL";

// server-side only - SECRET_LOCATION is always set to REMOTE if APP_ENV === LIVE
export const SECRET_KEY_LOCATION: SecretKeyLocationType = process.env.SECRETKEY_LOCATION
    ? APP_ENV === "LOCAL" ? process.env.SECRETKEY_LOCATION as SecretKeyLocationType : "REMOTE"
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
    jwt: {
        secretId: "/prod/hello-next-js/jwt-secret",
    },
    db: {
        supabase: {
            connectionString: {
                beforeDbPasswordPartial: "postgresql://postgres.uexpzgyunktzbropinwv:",
                afterDbPasswordPartial: "@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres", // transaction pooler approach (support ipv4) 
            },
            ssl: false,
            awsParamStore: {
                url: "/supabase/url",
                apiKey: "/supabase/apikey",
                dbPassword: "/supabase/db/password",
            }
        }
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
    jwt: {
        secretId: "/dev/hello-next-js/jwt-secret",
    },
    db: {
        localDb: {
            connectionString: "postgres://postgres:postgres@localhost:5432/tasks-db",
            ssl: false,
        },
        supabase: {
            connectionString: {
                beforeDbPasswordPartial: "postgresql://postgres.uexpzgyunktzbropinwv:",
                afterDbPasswordPartial: "@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres", // transaction pooler approach (support ipv4)
            },
            ssl: false,
            awsParamStore: {
                url: "/supabase/url",
                apiKey: "/supabase/apikey",
                dbPassword: "/supabase/db/password",
            }
        }
    }
}

export const TABLE_FILTER_OPTIMISATION = {
    withUseDeferredValue: true, // recommended to optimise your filter feature 
    withUseTransition: false, // not recommended for this use case scenario
}

export const ERROR_REPORTING_TARGET: "remoteLogging" | "consoleError" = "consoleError";
