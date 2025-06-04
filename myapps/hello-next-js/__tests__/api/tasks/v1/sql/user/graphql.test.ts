import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { schema, resolvers } from '../../../../../../pages/api/tasks/v1/sql/user/graphql';

// Mock dependencies
jest.mock('../../../../../../src/lib/db/db_postgreSQL');
jest.mock('../../../../../../src/lib/app/common');
jest.mock('graphql-scalars', () => ({
  DateTimeResolver: {
    serialize: (date: Date) => date.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => new Date(ast.value)
  }
}));

// Mock the dependencies
jest.mock('../../../../../../src/lib/db/db_postgreSQL', () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.mock('../../../../../../src/lib/app/common', () => ({
  CHECK_API_KEY: jest.fn(),
}));

// Mock console.error to avoid noise in test output
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Sample test data
const mockUser = {
  id: '1',
  auth_type: 'basic_auth',
  email: 'test@example.com',
  hashed_pwd: 'hashed_password_123',
  jwt: 'mock_jwt_token',
  admin_access: false,
  created_at: new Date('2023-01-01T00:00:00Z'),
  updated_at: new Date('2023-01-01T00:00:00Z')
};

const mockUsers = [
  mockUser,
  {
    id: '2',
    auth_type: 'basic_auth',
    email: 'admin@example.com',
    hashed_pwd: 'hashed_password_456',
    jwt: 'admin_jwt_token',
    admin_access: true,
    created_at: new Date('2023-01-02T00:00:00Z'),
    updated_at: new Date('2023-01-02T00:00:00Z')
  }
];

// GraphQL queries and mutations for testing
const LOOKUP_USER_QUERY = gql`
    query LookUpUser($email: String!) {
        lookupUser(email: $email) {
            id,
            auth_type,
            email,
            hashed_pwd,
            jwt,
            admin_access,
            created_at,
            updated_at,
        }
    }
`;
const REGISTER_USER_MUTATION = gql`
  mutation RegisterUser($email: String!, $password: String!, $jwt: String!) {
      registerUser(email: $email, hashed_pwd: $password, jwt: $jwt) {
          id,
          auth_type,
          email,
          hashed_pwd,
          jwt,
          admin_access,
          created_at,
          updated_at,
      }
  }
`;
const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      id
      email
      auth_type
      admin_access
      created_at
      updated_at
    }
  }
`;
const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      auth_type
      admin_access
      created_at
      updated_at
    }
  }
`;

describe('Tasks Users API handler - graphql.ts', () => {
    let server: ApolloServer;
    const { db } = require('../../../../../../src/lib/db/db_postgreSQL');
    const { CHECK_API_KEY } = require('../../../../../../src/lib/app/common');
    
    beforeAll(async () => {
        // Create Apollo Server instance for testing
        // Create Apollo Server instance for testing (v4 style)
        server = new ApolloServer({
            typeDefs: schema,
            resolvers,
            persistedQueries: false,
        });
        
        // Start the server for testing
        await server.start();       
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        consoleSpy.mockRestore();
        server.stop();
    });

    describe('Query: users', () => {
      it('should return all users', async () => {
        // Mock database response
        db.query.mockResolvedValue({ rows: mockUsers });

        const response = await server.executeOperation({
          query: GET_USERS_QUERY,
        });

        expect(response.body.kind).toBe('single');
        if (response.body.kind === 'single') {
          expect(response.body.singleResult.errors).toBeUndefined();
        
          const data = response.body.singleResult.data as { users: typeof mockUsers };
          expect(data).toBeDefined();
          expect(data.users).toHaveLength(2);
          expect(data.users[0].email).toBe('test@example.com');
        }
      });

      it('should handle database errors', async () => {
        db.query.mockRejectedValue(new Error('Database connection failed'));

        const response = await server.executeOperation({
          query: GET_USERS_QUERY,
        });

        expect(response.body.kind).toBe('single');
        if (response.body.kind === 'single') {
          expect(response.body.singleResult.errors).toBeDefined();
          expect(response.body.singleResult.errors?.[0].message).toBe('Database connection failed');
        }
      });
    });
    
    describe('Query: user', () => {
      it('should return a specific user by id', async () => {
        db.query.mockResolvedValue({ rows: [mockUser] });

        const response = await server.executeOperation({
          query: GET_USER_QUERY,
          variables: { id: '1' },
        });

        expect(response.body.kind).toBe('single');
        if (response.body.kind === 'single') {
          expect(response.body.singleResult.errors).toBeUndefined();
          
          const data = response.body.singleResult.data as { user: typeof mockUser };
          expect(data).toBeDefined();
          expect(data.user.id).toBe('1');
          expect(data.user.email).toBe('test@example.com');
        }
      });

      it('should return null for non-existent user', async () => {
        db.query.mockResolvedValue({ rows: [] });

        const response = await server.executeOperation({
          query: GET_USER_QUERY,
          variables: { id: '999' },
        });

        expect(response.body.kind).toBe('single');
        if (response.body.kind === 'single') {
          expect(response.body.singleResult.errors).toBeUndefined();
          expect(response.body.singleResult.data).toBeDefined();
          
          const data = response.body.singleResult.data as { user?: typeof mockUser };
          expect(data.user).toBeNull();
        }
      });
    });

    describe('Query: lookupUser', () => {
      it('should find user by email', async () => {
        db.query.mockResolvedValue({ rows: [mockUser] });

        const response = await server.executeOperation({
          query: LOOKUP_USER_QUERY,
          variables: { email: 'test@example.com' },
        });

        expect(response.body.kind).toBe('single');
        if (response.body.kind === 'single') {
          expect(response.body.singleResult.errors).toBeUndefined();
          
          const data = response.body.singleResult.data as { lookupUser: typeof mockUser };
          expect(data).toBeDefined();
          expect(data.lookupUser.email).toBe('test@example.com');
        }
      });
    });

    describe('Mutation: registerUser', () => {
      it('should create a new user', async () => {
        const newUser = {
          ...mockUser,
          id: '3',
          email: 'newuser@example.com',
        };
        
        db.query.mockResolvedValue({ rows: [newUser] });

        const response = await server.executeOperation({
          query: REGISTER_USER_MUTATION,
          variables: {
            email: 'newuser@example.com',
            password: 'hashed_password_789',
            jwt: 'new_jwt_token',
          },
        });

        expect(response.body.kind).toBe('single');
        if (response.body.kind === 'single') {
          expect(response.body.singleResult.errors).toBeUndefined();
          
          const data = response.body.singleResult.data as { registerUser: typeof newUser };
          expect(data).toBeDefined();
          expect(data.registerUser.email).toBe('newuser@example.com');
        }
      });

      it('should handle registration errors', async () => {
        db.query.mockRejectedValue(new Error('Email already exists'));

        const response = await server.executeOperation({
          query: REGISTER_USER_MUTATION,
          variables: {
            email: 'existing@example.com',
            password: 'hashed_password_789',
            jwt: 'new_jwt_token',
          },
        });

        expect(response.body.kind).toBe('single');
        if (response.body.kind === 'single') {
          expect(response.body.singleResult.errors).toBeDefined();
          expect(response.body.singleResult.errors?.[0].message).toBe('Email already exists');
        }
      });
    });
});
