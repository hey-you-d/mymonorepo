import { ApolloServer, gql } from 'apollo-server-micro';
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/bff/tasks/db_postgreSQL';
import { Task } from "@/app/types/Task";
import { values, placeholders } from "./seed-table";
import { CHECK_BFF_AUTHORIZATION } from '../../../../../global/common';

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

const server = new ApolloServer({ typeDefs, resolvers });
const startServer = server.start();

export const config = {
    api: {
        bodyParser: false,
    }
};

const handler = async(req: NextApiRequest, res: NextApiResponse) => {
    await CHECK_BFF_AUTHORIZATION(req, res);
    
    await startServer;

    // set up graphql endpoint at /api/tasks/v1/sql/graphql
    const graphqlHandler = server.createHandler({ path: '/api/tasks/v1/sql/graphql' });
    return graphqlHandler(req, res);
}

export default handler;
