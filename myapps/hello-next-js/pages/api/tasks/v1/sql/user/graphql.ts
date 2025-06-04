import { ApolloServer } from '@apollo/server'; // apollo ver.4
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';
import { NextApiRequest, NextApiResponse } from 'next';
import { DateTimeResolver } from 'graphql-scalars';
import { db } from '@/lib/db/db_postgreSQL';
import { UsersDbQueryResultType as User } from '@/types/Task';
import { CHECK_API_KEY } from '@/lib/app/common';

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
        users: async() => {
            const res = await db.query('SELECT * FROM users ORDER BY id DESC');
            return res.rows;
        },
        user: async(_: unknown, { id }: { id: User['id'] }) => {
            const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
            return res.rows[0];
        },
        lookupUser: async(_: unknown, { email }: User): Promise<User> => {
            const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            
            return rows[0];
        },
    },
    Mutation: {
        registerUser: async(_: unknown, { email, hashed_pwd, jwt }: User): Promise<User> => {
            const { rows } = await db.query(
                `INSERT INTO users (email, hashed_pwd, auth_type, admin_access, jwt) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *`, 
                [email, hashed_pwd, "basic_auth", false, jwt]
            );

            return rows[0];
        },
    },
}

const server = new ApolloServer({ 
    typeDefs: schema, 
    resolvers,
    persistedQueries: false,
});

export const config = {
    api: {
        bodyParser: false,
    }
};

// create a next.js handler
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


export default handler;