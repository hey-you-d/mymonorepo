import { Pool } from 'pg'; // postgresql db

// This uses a connection pool, good for ECS + performance
const pool = new Pool({
  //connectionString: process.env.SQL_DATABASE_URL,
  //ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionString: "postgres://postgres:postgres@localhost:5432/tasks-db",
  ssl: false,
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
};

export type DB = typeof db;
