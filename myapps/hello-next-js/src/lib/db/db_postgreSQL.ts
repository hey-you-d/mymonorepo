import { Pool } from 'pg'; // postgresql db
import { APP_ENV, LOCALHOST_MODE, LIVE_SITE_MODE } from '../app/featureFlags';

// This uses a connection pool, good for ECS + performance
const pool = new Pool({
  connectionString: APP_ENV == "LIVE" 
    ? LIVE_SITE_MODE.db.connectionString 
    : LOCALHOST_MODE.db.connectionString, // [WIP] remote DB hasn't been created in the production environment
  ssl: APP_ENV == "LIVE" 
    ? LIVE_SITE_MODE.db.ssl
    : LOCALHOST_MODE.db.ssl, // [WIP] remote DB hasn't been created in the production environment
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
};

export type DB = typeof db;
