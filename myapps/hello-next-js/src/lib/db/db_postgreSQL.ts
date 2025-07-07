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
      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
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
      await this.initialize();
      
      if (!this.pool) {
        throw new Error('Database pool not initialized');
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

  // For health checks
  async isHealthy(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

export const db = {
  query: dbConnection.query.bind(dbConnection),
  end: dbConnection.end.bind(dbConnection),
  isHealthy: dbConnection.isHealthy.bind(dbConnection),
};

export type DB = typeof db;

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  await db.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database connections...');
  await db.end();
  process.exit(0);
});