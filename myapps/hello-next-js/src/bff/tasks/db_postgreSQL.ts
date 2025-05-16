import { Pool } from 'pg'; // postgresql db

// This uses a connection pool, good for ECS + performance
const pool = new Pool({
  //connectionString: process.env.SQL_DATABASE_URL,
  connectionString: "postgres://postgres:postgres@localhost:5432/tasks-db",
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
};

export type DB = typeof db;
