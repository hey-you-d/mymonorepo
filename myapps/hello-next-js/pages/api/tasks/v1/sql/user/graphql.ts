import { ApolloServer } from '@apollo/server'; // apollo ver.4
//import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import { json } from 'body-parser';
import { gql } from 'graphql-tag';
import { NextApiRequest, NextApiResponse } from 'next';
import { DateTimeResolver } from 'graphql-scalars';
import { db } from '@/lib/db/db_postgreSQL';
import type { UsersDbQueryResultType as User, GraphQLContext } from '@/types/Task';
import { CHECK_API_KEY, VERIFY_JWT_IN_AUTH_HEADER } from '@/lib/app/common';
import { customResponseMessage, catchedErrorMessage } from '@/lib/app/error';

const fnSignature = "tasks/v1 | API | user/graphql.ts";

export const schema = gql`
    scalar DateTime

    type User {
        id: ID!,
        auth_type: String!,
        email: String!,
        hashed_pwd: String!,
        jwt: String!,
        admin_access: Boolean!,
        created_at: DateTime!,
        updated_at: DateTime!,
    }

    type Query {
        users: [User!]!
        user(id: ID!): User
        lookupUser(email: String!): User
    }

    type Mutation {
        registerUser(email: String!, hashed_pwd: String!, jwt: String!): User!
    }
`;

export const resolvers = {
    DateTime: DateTimeResolver,
    Query: {
        users: async(_: unknown, {}, context: GraphQLContext) => {
            const outcome = await VERIFY_JWT_IN_AUTH_HEADER(context.req);
            if (!outcome.valid) {
                const errMsg = await customResponseMessage(fnSignature, "query - users", `failed JWT verification : ${outcome.error}`);
                throw new Error(errMsg);
            }

            try {
                const res = await db.query('SELECT * FROM users ORDER BY id DESC');
                return res.rows;
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "query - users", error as Error); 
                throw new Error(errorMsg);
            }
        },
        user: async(_: unknown, { id }: { id: User['id'] }, context: GraphQLContext) => {
            const outcome = await VERIFY_JWT_IN_AUTH_HEADER(context.req);
            if (!outcome.valid) {
                const errMsg = await customResponseMessage(fnSignature, "query - user", `failed JWT verification : ${outcome.error}`);
                throw new Error(errMsg);
            }

            try {
                const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
                return res.rows[0];
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "query - user", error as Error); 
                throw new Error(errorMsg);
            }
        },
        lookupUser: async(_: unknown, { email }: User): Promise<User | undefined> => {
            // JWT Authorization is not required for user login

            try {
                const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
                return rows[0];
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "query - lookupUser", error as Error); 
                throw new Error(errorMsg);
            }
        },
    },
    Mutation: {
        registerUser: async(_: unknown, { email, hashed_pwd, jwt }: User): Promise<User | undefined> => {
            // JWT Authorization is not required for user registration
            try {
                const { rows } = await db.query(
                    `INSERT INTO users (email, hashed_pwd, auth_type, admin_access, jwt) 
                    VALUES ($1, $2, $3, $4, $5) RETURNING *`, 
                    [email, hashed_pwd, "basic_auth", false, jwt]
                );

                return rows[0];
            } catch(error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "mutation - registerUser", error as Error); 
                throw new Error(errorMsg);
            }
        },
    },
}

const server = new ApolloServer({ 
    typeDefs: schema, 
    resolvers,
    persistedQueries: false,
});
const startServer = server.start();

export const config = {
    api: {
        bodyParser: false,
    }
};

// create a next.js handler
/*
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextApiRequest, res: NextApiResponse) => {
    // Check authorization here
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) {
      throw new Error("Unauthorized access: invalid API key");
    }
    
    return {
      req,
      res,
    };
  },
});
*/
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
            //return { req, res };
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