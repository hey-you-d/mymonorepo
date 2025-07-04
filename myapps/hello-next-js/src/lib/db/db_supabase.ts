import { createClient } from '@supabase/supabase-js';
import { getSecret } from '../app/awsParameterStore';
import { SQL_DB_LOCATION, LIVE_SITE_MODE } from "../app/featureFlags";

// Create Supabase client for live environment
export const supabase = async () => {
  if (!LIVE_SITE_MODE.db.supabase || 
      !LIVE_SITE_MODE.db.supabase?.awsParamStore.url || 
      !LIVE_SITE_MODE.db.supabase?.awsParamStore.apiKey) {
        return null;
  }

  const projectUrl = await getSecret(LIVE_SITE_MODE.db.supabase.awsParamStore.url);
  const apiKey = await getSecret(LIVE_SITE_MODE.db.supabase.awsParamStore.apiKey);

  return SQL_DB_LOCATION === "REMOTE" && projectUrl && apiKey
    ? createClient(projectUrl, apiKey)
    : null;
}

// Helper function to convert simple SQL to Supabase queries
export const executeSupabaseQuery = async (sql: string, params?: unknown[]) => {
  if (!supabase) throw new Error("Supabase db connector | executeSupabaseQuery | Missing the required feature flags");
  
  const trimmedSql = sql.trim().toLowerCase();
  
  if (trimmedSql.startsWith('select')) {
    return await handleSelectQuery(sql, params);
  }
  
  if (trimmedSql.startsWith('insert')) {
    return await handleInsertQuery(sql, params);
  }
  
  if (trimmedSql.startsWith('update')) {
    return await handleUpdateQuery(sql, params);
  }
  
  if (trimmedSql.startsWith('delete')) {
    return await handleDeleteQuery(sql, params);
  }
  
  throw new Error(`Supabase db connector | executeSupabaseQuery | Unsupported SQL query type: ${sql}`);
}

// --- SUPABASE AUX HELPER FN: handleSelectQuery - FOR executeSupabaseQuery FN ---
async function handleSelectQuery(sql: string, params?: unknown[]) {
  const match = sql.match(/select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+(.+))?(?:\s+limit\s+(\d+))?/i);  
  
  if (!match) throw new Error(`Supabase db connector | handleSelectQuery | Unsupported SELECT query: ${sql}`);
  
  const [, columns, table, whereClause, orderClause, limitClause] = match;
  const supabaseClient = await supabase();
  let query = supabaseClient?.from(table).select(columns.trim() === '*' ? '*' : columns);
  
  // Handle WHERE clause
  if (whereClause && params) {
    query = parseWhereClause(query, whereClause, params);
  }
  
  // Handle ORDER BY
  if (orderClause) {
    const orderMatch = orderClause.trim().match(/^(\w+)(?:\s+(asc|desc))?$/i);

    if (orderMatch) {
      const [, column, direction] = orderMatch;
      query = query?.order(column, { ascending: !direction || direction.toLowerCase() === 'asc' });
    } 
  } else {
    throw new Error(`Supabase db connector | handleSelectQuery | Invalid ORDER BY clause: ${orderClause}`);
  }
  
  // Handle LIMIT
  if (limitClause) {
    query = query?.limit(parseInt(limitClause));
  }

  return await query;
}

// --- SUPABASE AUX HELPER FN: handleInsertQuery - FOR executeSupabaseQuery FN ---
async function handleInsertQuery(sql: string, params?: unknown[]) {
  // Handle both INSERT INTO table (col1, col2) VALUES ($1, $2) and INSERT INTO table VALUES ($1, $2)
  let match = sql.match(/insert\s+into\s+(\w+)\s*\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
  
  if (!match) {
    // Try without column specification
    match = sql.match(/insert\s+into\s+(\w+)\s+values\s*\(([^)]+)\)/i);
    if (!match) throw new Error(`Supabase db connector | handleInsertQuery | Unsupported INSERT query: ${sql}`);
  }
  
  const [, table, columns, values] = match;
  const columnList = columns.split(',').map(c => c.trim());
  
  // Map parameters to column values
  const insertData: Record<string, unknown> = {};
  columnList.forEach((col, index) => {
    if (params && params[index] !== undefined) {
      insertData[col] = params[index];
    }
  });

  const supabaseClient = await supabase();
  return await supabaseClient?.from(table).insert(insertData);
}

// --- SUPABASE AUX HELPER FN: handleDeleteQuery - FOR executeSupabaseQuery FN ---
async function handleUpdateQuery(sql: string, params?: unknown[]) {
  const match = sql.match(/update\s+(\w+)\s+set\s+(.+?)(?:\s+where\s+(.+))?/i);
  if (!match) throw new Error(`Supabase db connector | handleUpdateQuery | Unsupported UPDATE query: ${sql}`);
  
  const [, table, setClause, whereClause] = match;
  
  // Parse SET clause
  const updateData: Record<string, unknown> = {};
  const setMatches = setClause.match(/(\w+)\s*=\s*\$(\d+)/g);
  if (setMatches && params) {
    setMatches.forEach(setMatch => {
      const [, column, paramIndex] = setMatch.match(/(\w+)\s*=\s*\$(\d+)/)!;
      updateData[column] = params[parseInt(paramIndex) - 1];
    });
  }
  
  const supabaseClient = await supabase();
  let query = supabaseClient?.from(table).update(updateData);
  
  // Handle WHERE clause
  if (whereClause && params) {
    query = parseWhereClause(query, whereClause, params);
  }
  
  return await query;
}

// --- SUPABASE AUX HELPER FN: handleDeleteQuery - FOR executeSupabaseQuery FN ---
async function handleDeleteQuery(sql: string, params?: unknown[]) {
  const match = sql.match(/delete\s+from\s+(\w+)(?:\s+where\s+(.+))?/i);
  if (!match) throw new Error(`Supabase db connector | handleDeleteQuery | Unsupported DELETE query: ${sql}`);
  
  const [, table, whereClause] = match;
  const supabaseClient = await supabase();
  let query = supabaseClient?.from(table).delete();
  
  // Handle WHERE clause
  if (whereClause && params) {
    query = parseWhereClause(query, whereClause, params);
  }
  
  return await query;
}

// --- SUPABASE AUX HELPER FN: parseWhereClause - FOR executeSupabaseQuery FN ---
// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any 
function parseWhereClause(query: any, whereClause: string, params: unknown[]) {
  // Handle simple equality: "id = $1"
  const eqMatch = whereClause.match(/(\w+)\s*=\s*\$(\d+)/);
  if (eqMatch) {
    const [, column, paramIndex] = eqMatch;
    return query.eq(column, params[parseInt(paramIndex) - 1]);
  }
  
  // Handle IN clause: "id IN ($1, $2, $3)" or "id = ANY($1)"
  const inMatch = whereClause.match(/(\w+)\s+in\s*\((.+?)\)/i);
  if (inMatch) {
    const [, column, values] = inMatch;
    const paramIndices = values.match(/\$(\d+)/g);
    if (paramIndices) {
      const inValues = paramIndices.map(p => {
        const index = parseInt(p.substring(1)) - 1;
        return params[index];
      });
      return query.in(column, inValues);
    }
  }
  
  // Handle greater than: "age > $1"
  const gtMatch = whereClause.match(/(\w+)\s*>\s*\$(\d+)/);
  if (gtMatch) {
    const [, column, paramIndex] = gtMatch;
    return query.gt(column, params[parseInt(paramIndex) - 1]);
  }
  
  // Handle less than: "age < $1"
  const ltMatch = whereClause.match(/(\w+)\s*<\s*\$(\d+)/);
  if (ltMatch) {
    const [, column, paramIndex] = ltMatch;
    return query.lt(column, params[parseInt(paramIndex) - 1]);
  }
  
  // Handle LIKE: "name LIKE $1"
  const likeMatch = whereClause.match(/(\w+)\s+like\s+\$(\d+)/i);
  if (likeMatch) {
    const [, column, paramIndex] = likeMatch;
    return query.like(column, params[parseInt(paramIndex) - 1]);
  }
  
  // Add more WHERE clause patterns as needed
  throw new Error(`Supabase db connector | parseWhereClause | Unsupported WHERE clause: ${whereClause}`);
}
