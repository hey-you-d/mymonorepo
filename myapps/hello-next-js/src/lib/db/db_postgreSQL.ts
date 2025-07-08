import { Pool } from 'pg';
import { getSecret } from '../app/awsParameterStore';
import { SQL_DB_LOCATION, LOCALHOST_MODE, LIVE_SITE_MODE, APP_ENV } from '../app/featureFlags';

class DatabaseConnection {
  private pool: Pool | null = null;
  private isInitialized = false;

  private async initialize() {
    if (this.isInitialized) return;

    try {
      const dbPassword = SQL_DB_LOCATION === "REMOTE"
        ? await getSecret(LOCALHOST_MODE.db.supabase.awsParamStore.dbPassword)
        : null;

      const connectionString = this.buildConnectionString(dbPassword ?? null);
      const sslConfig = this.getSSLConfig();

      this.pool = new Pool({
        connectionString,
        ssl: sslConfig,
      });

      // Handle pool errors
      this.pool.on('error', (error) => {
        console.error(`lib | db | Unexpected error on idle client: ${(error as Error).name} - ${(error as Error).message}`);
      });

      this.isInitialized = true;
    } catch (error) {
      console.error(`lib | db | Failed to initialize database connection: ${(error as Error).name} - ${(error as Error).message}`);
      throw error;
    }
  }

  private buildConnectionString(dbPassword: string | null): string {
    if (APP_ENV === "LOCAL") {
      return SQL_DB_LOCATION !== "REMOTE"
        ? LOCALHOST_MODE.db.localDb?.connectionString || ""
        : `${LOCALHOST_MODE.db.supabase.connectionString.beforeDbPasswordPartial}${dbPassword}${LOCALHOST_MODE.db.supabase.connectionString.afterDbPasswordPartial}`;
    } else {
      return `${LIVE_SITE_MODE.db.supabase.connectionString.beforeDbPasswordPartial}${dbPassword}${LIVE_SITE_MODE.db.supabase.connectionString.afterDbPasswordPartial}`;
    }
  }

  private getSSLConfig() {
    if (APP_ENV === "LOCAL") {
      return SQL_DB_LOCATION !== "REMOTE"
        ? LOCALHOST_MODE.db.localDb?.ssl
        : LOCALHOST_MODE.db.supabase.ssl;
    } else {
      return LIVE_SITE_MODE.db.supabase.ssl;
    }
  }

  async query(text: string, params?: unknown[]) {
    try {
      // For reference:
      // Lazy Initialization: Pool is created only when first needed
      await this.initialize();
      
      if (!this.pool) {
        throw new Error('lib | db | Database pool not initialized');
      }

      return await this.pool.query(text, params);
    } catch (error) {
      throw new Error(`lib | db | Database query failed: ${(error as Error).name} - ${(error as Error).message}`);
    }
  }

  async end() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
    }
  }

  // For reference:
  // health checks: Method to verify database connectivity
  async isHealthy(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

// For reference:
// Create singleton instance - benefit: Pool is created once and reused
// Also, the web app will not need to call AWS Param Store's getSecrets() on every request,
// which will add unnecessary latency & could hit rate limits
const dbConnection = new DatabaseConnection();

export const db = {
  query: dbConnection.query.bind(dbConnection),
  end: dbConnection.end.bind(dbConnection),
  isHealthy: dbConnection.isHealthy.bind(dbConnection),
};

export type DB = typeof db;

// For reference:
// Graceful shutdown handling: Properly closes connections on app termination by calling db.end()
// otherwise the web app will keep accumulating unclosed connections and event listeners, 
// leading to memory leaks.
process.on('SIGINT', async () => {
  console.log('lib | db | Closing database connections...');
  await db.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('lib | db | Closing database connections...');
  await db.end();
  process.exit(0);
});