import { Pool } from 'pg'; // postgresql db
import { SQL_DB_LOCATION, LOCALHOST_MODE } from '../app/featureFlags';
import { executeSupabaseQuery, supabase } from './db_supabase';

// Create PostgreSQL pool for development
const pool = SQL_DB_LOCATION !== "REMOTE" 
  ? new Pool({
      connectionString: LOCALHOST_MODE.db.localhost?.connectionString,
      ssl: LOCALHOST_MODE.db.localhost?.ssl,
    })
  : null;

export const db = {
  query: async (text: string, params?: unknown[]) => {
    if (SQL_DB_LOCATION === "REMOTE") {
      // Convert SQL to Supabase queries
      const result = await executeSupabaseQuery(text, params);
      
      // Convert Supabase response to PostgreSQL-like format
      return {
        rows: result?.data || [],
        rowCount: result?.data?.length || 0,
        command: text.trim().split(/\s+/)[0].toUpperCase(),
      };
    } else if (pool) {
      // For non-supabase Localhost build
      return pool.query(text, params);
    } else {
      throw new Error("No database connection available");
    }
  },
  // Direct access to clients
  supabaseClient: await supabase(),
  pool: pool,
};

export type DB = typeof db;
