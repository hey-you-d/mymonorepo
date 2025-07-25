import { ApolloServer } from '@apollo/server'; // apollo ver.4
import { gql } from 'graphql-tag';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import { json } from 'body-parser';
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { Task, GraphQLContext } from "@/types/Task";
import { values, placeholders } from "./seed-table";
import { CHECK_API_KEY, VERIFY_JWT_IN_AUTH_HEADER } from '@/lib/app/common';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { customResponseMessage, catchedErrorMessage } from '@/lib/app/error';

//import { KeyvAdapter } from '@apollo/utils.keyvadapter';
//import Keyv from 'keyv'; 
//import KeyvRedis from '@keyv/redis'; // Optional Redis adapter:

const fnSignature = "tasks/v1 | API | graphql.ts";

export const schema = gql`
    type Task {
        id: ID!,
        title: String!,
        detail: String!,
        completed: Boolean!,
        created_at: String!
    }

    type Query {
        tasks: [Task!]!
        task(id: ID!): Task
    }

    type Mutation {
        createTask(title: String!, detail: String!): Task!
        deleteTask(id: ID!): Task!
        deleteTasks: [Task!]!
        seedTasks: [Task!]!
        updateTask(id: ID!, title: String!, detail: String!, completed: Boolean!): Task!
    }
`;

export const resolvers = {
    Query: {
        tasks: async() => {
            // JWT authorization is not required for this query

            try {
                const res = await db.query('SELECT * FROM tasks ORDER BY id DESC');
                
                // Check for null/undefined result (connection issues)
                if (!res || !res.rows) {
                    const errMsg = await customResponseMessage(fnSignature, "query - tasks", "null/undefined output");
                    throw new Error(errMsg);
                }
                
                return res.rows;
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "query - tasks", error as Error);
                throw new Error(errorMsg);
            }
        },
        task: async (_: unknown, { id }: { id: Task['id'] }, context: GraphQLContext) => {
            const outcome = await VERIFY_JWT_IN_AUTH_HEADER(context.req);
            if (!outcome.valid) {
                const errMsg = await customResponseMessage(fnSignature, "query - task", `failed JWT verification: ${outcome.error}`);
                throw new Error(errMsg);
            }

            try {
                const res = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
                
                // Check for null/undefined result (connection issues)
                if (!res || !res.rows) {
                    const errMsg = await customResponseMessage(fnSignature, "query - task", "null/undefined output");
                    throw new Error(errMsg);
                }
                
                return res.rows[0];
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "query - task", error as Error);
                throw new Error(errorMsg);
            }
        },
    },
    Mutation: {
        createTask: async (_: unknown, { title, detail }: Task, context: GraphQLContext) => {
            const outcome = await VERIFY_JWT_IN_AUTH_HEADER(context.req);
            if (!outcome.valid) {
                const errMsg = await customResponseMessage(fnSignature, "mutation - createTask", `failed JWT verification: ${outcome.error}`);
                throw new Error(errMsg);
            }
            
            try {
                const res = await db.query(
                    'INSERT INTO tasks (title, detail) VALUES ($1, $2) RETURNING *', 
                    [title, detail]
                );

                // Check for null/undefined result (connection issues)
                if (!res || !res.rows) {
                    const errMsg = await customResponseMessage(fnSignature, "mutation - createTask", "null/undefined output");
                    throw new Error(errMsg);
                }

                return res.rows[0];
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "mutation - createTask", error as Error);
                throw new Error(errorMsg);
            }
        },
        updateTask: async (_: unknown, { id, title, detail, completed }: Task, context: GraphQLContext) => {
            const outcome = await VERIFY_JWT_IN_AUTH_HEADER(context.req);
            if (!outcome.valid) {
                const errMsg = await customResponseMessage(fnSignature, "mutation - updateTask", `failed JWT verification: ${outcome.error}`);
                throw new Error(errMsg);
            }

            try {
                const res = await db.query(
                    'UPDATE tasks SET title = $1, detail = $2, completed = $3 WHERE id = $4 RETURNING *', 
                    [title, detail, completed, id]
                );

                // Check for null/undefined result (connection issues)
                if (!res || !res.rows) {
                    const errMsg = await customResponseMessage(fnSignature, "mutation - updateTask", "null/undefined output");
                    throw new Error(errMsg);
                }

                return res.rows[0];
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "mutation - updateTask", error as Error);
                throw new Error(errorMsg);
            }
        },
        deleteTask: async (_: unknown, { id }: { id: Task['id'] }, context: GraphQLContext) => {
            const outcome = await VERIFY_JWT_IN_AUTH_HEADER(context.req);
            if (!outcome.valid) {
                const errMsg = await customResponseMessage(fnSignature, "mutation - deleteTask", `failed JWT verification: ${outcome.error}`);
                throw new Error(errMsg);
            }

            try {
                const res = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
                
                // Check for null/undefined result (connection issues)
                if (!res || !res.rows) {
                    const errMsg = await customResponseMessage(fnSignature, "mutation - deleteTask", "null/undefined output");
                    throw new Error(errMsg);
                }
                
                return res.rows[0];
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "mutation - deleteTask", error as Error);
                throw new Error(errorMsg);
            }
        },
        deleteTasks: async (_: unknown, {}, context: GraphQLContext) => {
            const outcome = await VERIFY_JWT_IN_AUTH_HEADER(context.req);
            if (!outcome.valid) {
                const errMsg = await customResponseMessage(fnSignature, "mutation - deleteTasks", `failed JWT verification: ${outcome.error}`);
                throw new Error(errMsg);
            }

            try {
                const res = await db.query('DELETE FROM tasks RETURNING *', []);
                
                // Check for null/undefined result (connection issues)
                if (!res || !res.rows) {
                    const errMsg = await customResponseMessage(fnSignature, "mutation - deleteTasks", "null/undefined output");
                    throw new Error(errMsg);
                }
                
                return res.rows;
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "mutation - deleteTasks", error as Error);
                throw new Error(errorMsg);
            }
        },
        seedTasks: async (_: unknown, {}, context: GraphQLContext) => {
            const outcome = await VERIFY_JWT_IN_AUTH_HEADER(context.req);
            if (!outcome.valid) {
                const errMsg = await customResponseMessage(fnSignature, "mutation - seedTasks", `failed JWT verification: ${outcome.error}`);
                throw new Error(errMsg);
            }

            try {
                const res = await db.query(`INSERT INTO tasks (title, detail) VALUES ${placeholders} RETURNING *`, 
                    values);

                // Check for null/undefined result (connection issues)
                if (!res || !res.rows) {
                    const errMsg = await customResponseMessage(fnSignature, "mutation - seedTasks", "null/undefined output");
                    throw new Error(errMsg);
                }    

                //const res = await db.query(`INSERT INTO tasks (title, detail) VALUES ($1, $2) RETURNING *`, 
                //    ["hello", "world"]);
                return res.rows;
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "mutation - seedTasks", error as Error);
                throw new Error(errorMsg);
            }    
        },
    },
};

// for reference: about unbounded caching warning:
// "Persisted queries are enabled and are using an unbounded cache. Your server is vulnerable to denial of service attacks 
// via memory exhaustion. Set `cache: "bounded"` or `persistedQueries: false` in your ApolloServer constructor...""
// 
// Apollo Server has persisted queries enabled with an unbounded in-memory cache, which can be exploited via a 
// DoS attack that floods the server with unique queries, exhausting memory.
// - By default, caches persisted queries in memory.
// - By default, uses an unbounded Map as the cache unless you configure it.
// - Hence, can be overwhelmed by attackers sending lots of unique hashes, consuming memory indefinitely.
//
// resolution:
// option 1. You're using persisted queries intentionally (e.g. Apollo Client + persistedQueryLink) -> Use a bounded cache
// option 2. You're not using persisted queries -> disable them
// option 3. You're running in production, and want scalable, resilient, shared caching -> Use Redis or Memcached  

const server = new ApolloServer({ 
    typeDefs: schema, 
    resolvers,
    cache: new InMemoryLRUCache(), // option 1 - This is a bounded in-memory cache
    //persistedQueries: false, // option 2 - disable it
    //cache: new KeyvAdapter(new KeyvRedis('redis://localhost:6379')); // or just new Keyv() for in-memory), // option 3 - redis or other keyv backends
    //persistedQueries: { cache, }, // option 3, alternatively...
});
const startServer = server.start();

// for reference: disables Next.js' built-in body parser for that particular API route.
// when you are using GraphQL libs like APollo Server, they often handle request parsing themselves.
// If the Next.js parser is not disabled, both Next.js & Apollo will try to parse the incoming request body,
// which can results in error like "Error: request body already consumed"
export const config = {
    api: {
        bodyParser: false,
    }
};

const handler = async(req: NextApiRequest, res: NextApiResponse) => {
    // Wait for ApolloServer to start
    await startServer;
    
    // Create an Express app
    const app = express();
    // Use JSON parser middleware before Apollo middleware
    app.use(json());
    // Custom middleware for API key check
    app.use(async (reqExp, resExp, next) => {
        try {
            // To enforce webapp-wide Authentication & Authorization,
            // We can check the API-key, and JWT here
            const isAuthorized = await CHECK_API_KEY(
                reqExp as unknown as NextApiRequest, 
                resExp as unknown as NextApiResponse
            );
            if (!isAuthorized) {
                //throw new Error("Unauthorized API-Key");
                res.status(401).end('Unauthorized API Key');
                return;
            }

            next();
        } catch (err) {
            console.error("Apollo context error", err);
            throw err;
        }
    });
    // Apply Apollo Server's Express middleware
    app.use(
        expressMiddleware(server, {
            context: async ({ req, res }) => ({ req, res }),
        })
    );

    // Let express handle the request
    return app(req as unknown as express.Request, res as unknown as express.Response);
}

export default handler;
