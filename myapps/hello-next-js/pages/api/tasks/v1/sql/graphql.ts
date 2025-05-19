import { ApolloServer, gql } from 'apollo-server-micro';
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { Task } from "@/types/Task";
import { values, placeholders } from "./seed-table";
import { CHECK_API_KEY } from '@/lib/app/common';

import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';

//import { KeyvAdapter } from '@apollo/utils.keyvadapter';
//import Keyv from 'keyv'; 
//import KeyvRedis from '@keyv/redis'; // Optional Redis adapter:

const typeDefs = gql`
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

const resolvers = {
    Query: {
        tasks: async() => {
            const res = await db.query('SELECT * FROM tasks ORDER BY id DESC');
            return res.rows;
        },
        task: async (_: unknown, { id }: { id: Task['id'] }) => {
            const res = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
            return res.rows[0];
        },
    },
    Mutation: {
        createTask: async (_: unknown, { title, detail }: Task) => {
            const res = await db.query(
                'INSERT INTO tasks (title, detail) VALUES ($1, $2) RETURNING *', 
                [title, detail]
            );
            return res.rows[0];
        },
        updateTask: async (_: unknown, { id, title, detail, completed }: Task) => {
            const res = await db.query(
                'UPDATE tasks SET title = $1, detail = $2, completed = $3 WHERE id = $4 RETURNING *', 
                [title, detail, completed, id]
            );
            return res.rows[0];
        },
        deleteTask: async (_: unknown, { id }: { id: Task['id'] }) => {
            const res = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
            return res.rows[0];
        },
        deleteTasks: async () => {
            const res = await db.query('DELETE FROM tasks RETURNING *', []);
            return res.rows;
        },
        seedTasks: async (_: unknown, {}) => {
            const res = await db.query(`INSERT INTO tasks (title, detail) VALUES ${placeholders} RETURNING *`, 
                values);
            //const res = await db.query(`INSERT INTO tasks (title, detail) VALUES ($1, $2) RETURNING *`, 
            //    ["hello", "world"]);
            return res.rows;    
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
    typeDefs, 
    resolvers,
    cache: new InMemoryLRUCache(), // option 1 - This is a bounded in-memory cache
    //persistedQueries: false, // option 2 - disable it
    //cache: new KeyvAdapter(new KeyvRedis('redis://localhost:6379')); // or just new Keyv() for in-memory), // option 3 - redis or other keyv backends
    //persistedQueries: { cache, }, // option 3, alternatively...
});
const startServer = server.start();

export const config = {
    api: {
        bodyParser: false,
    }
};

const handler = async(req: NextApiRequest, res: NextApiResponse) => {
    await CHECK_API_KEY(req, res);
    
    await startServer;

    // set up graphql endpoint at /api/tasks/v1/sql/graphql
    const graphqlHandler = server.createHandler({ path: '/api/tasks/v1/sql/graphql' });
    return graphqlHandler(req, res);
}

export default handler;
