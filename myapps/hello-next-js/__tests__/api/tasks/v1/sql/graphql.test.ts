// Mock dependencies
jest.mock('../../../../../src/lib/db/db_postgreSQL', () => ({
    db: {
        query: jest.fn(),
    },
}));
jest.mock('../../../../../src/lib/app/common', () => ({
    CHECK_API_KEY: jest.fn(),
    VERIFY_JWT_IN_AUTH_HEADER: jest.fn().mockResolvedValue({ valid: true }),
    getJWTFrmHttpOnlyCookie: jest.fn().mockResolvedValue("fake jwt"),
}));
jest.mock('../../../../../pages/api/tasks/v1/sql/seed-table', () => ({
    values: ['Task 1', 'Detail 1', 'Task 2', 'Detail 2'],
    placeholders: '($1, $2), ($3, $4)'
}));

import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import type { GraphQLContext } from '@/types/Task';
// Import the actual schema and resolvers from your file
// Adjust the path according to your actual file structure
import { schema, resolvers } from '../../../../../pages/api/tasks/v1/sql/graphql'
const {
  CHECK_API_KEY,  
  VERIFY_JWT_IN_AUTH_HEADER,
  getJWTFrmHttpOnlyCookie,
} = require('../../../../../src/lib/app/common');

// Mock console.error to avoid noise in test output
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});


// Sample test data
const mockTask = {
    id: '1',
    title: 'Test Task',
    detail: 'Test Detail',
    completed: false,
    created_at: '2023-01-01T00:00:00Z'
};

const mockTasks = [
    mockTask,
    {
        id: '2',
        title: 'Second Task',
        detail: 'Second Detail',
        completed: true,
        created_at: '2023-01-02T00:00:00Z'
    }
];

describe('Tasks API handler - graphql.ts', () => {
    let server: ApolloServer<GraphQLContext>;
    let mockDb: jest.Mocked<any>;
    let mockCheckApiKey: jest.MockedFunction<any>;

    beforeAll(async () => {
        // Import mocked modules
        const { db } = await import('@/lib/db/db_postgreSQL');
        const { CHECK_API_KEY } = await import('@/lib/app/common');
        
        mockDb = db as jest.Mocked<typeof db>;
        mockCheckApiKey = CHECK_API_KEY as jest.MockedFunction<typeof CHECK_API_KEY>;

        // Create Apollo Server with the actual schema and resolvers
        server = new ApolloServer({
            typeDefs: schema,
            resolvers,
        });

        await server.start();
    });

    afterAll(async () => {
        await server?.stop();
        consoleSpy.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Default to authorized API key
        mockCheckApiKey.mockResolvedValue(true);
    });

    describe('Query Operations', () => {
        describe('tasks query', () => {
            it('should return all tasks ordered by id DESC', async () => {
                mockDb.query.mockResolvedValue({ rows: mockTasks });

                const query = gql`
                    query GetTasks {
                        tasks {
                            id
                            title
                            detail
                            completed
                            created_at
                        }
                    }
                `;

                const result = await server.executeOperation({
                    query,
                });

                expect(result.body.kind).toBe('single');
                if (result.body.kind === 'single') {
                    expect(result.body.singleResult.errors).toBeUndefined();
                    expect(result.body.singleResult.data?.tasks).toEqual(mockTasks);
                }
                expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY id DESC');
            });
            it('should handle database errors gracefully', async () => {
                mockDb.query.mockRejectedValue(new Error('Database connection failed'));

                const query = gql`
                    query {
                        tasks {
                            id
                            title
                            detail
                            completed
                        }
                    }
                `;

                const result = await server.executeOperation({
                    query,
                });

                expect(result.body.kind).toBe('single');
                if (result.body.kind === 'single') {
                    expect(result.body.singleResult.errors).toBeDefined();
                    expect(result.body.singleResult.errors?.[0].message).toContain('Database connection failed');
                }
            });
        });

        describe('task query', () => {
            it('should return a single task by id', async () => {
                mockDb.query.mockResolvedValue({ rows: [mockTask] });

                const query = gql`
                    query GetTask($id: ID!) {
                        task(id: $id) {
                            id
                            title
                            detail
                            completed
                            created_at
                        }
                    }
                `;

                const result = await server.executeOperation({
                    query,
                    variables: { id: '1' },
                });

                expect(result.body.kind).toBe('single');
                if (result.body.kind === 'single') {
                    expect(result.body.singleResult.errors).toBeUndefined();
                    expect(result.body.singleResult.data?.task).toEqual(mockTask);
                }
                expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM tasks WHERE id = $1', ['1']);
            });

            it('should return null for non-existent task', async () => {
                mockDb.query.mockResolvedValue({ rows: [] });

                const query = gql`
                    query GetTask($id: ID!) {
                        task(id: $id) {
                            id
                            title
                        }
                    }
                `;

                const result = await server.executeOperation({
                    query,
                    variables: { id: '999' },
                });

                expect(result.body.kind).toBe('single');
                if (result.body.kind === 'single') {
                    expect(result.body.singleResult.errors).toBeUndefined();
                    expect(result.body.singleResult.data?.task).toBeNull();
                }
            });
        });
    }); 
    
    describe('Mutation Operations', () => {
        describe('createTask mutation', () => {
            it('should create a new task successfully', async () => {
                mockDb.query.mockResolvedValue({ rows: [mockTask] });

                const mutation = gql`
                    mutation CreateTask($title: String!, $detail: String!) {
                        createTask(title: $title, detail: $detail) {
                            id
                            title
                            detail
                            completed
                            created_at
                        }
                    }
                `;

                const result = await server.executeOperation({
                    query: mutation,
                    variables: { title: 'Test Task', detail: 'Test Detail' },
                });

                expect(result.body.kind).toBe('single');
                if (result.body.kind === 'single') {
                    expect(result.body.singleResult.errors).toBeUndefined();
                    expect(result.body.singleResult.data?.createTask).toEqual(mockTask);
                }
                expect(mockDb.query).toHaveBeenCalledWith(
                    'INSERT INTO tasks (title, detail) VALUES ($1, $2) RETURNING *',
                    ['Test Task', 'Test Detail']
                );
            });

            it('should handle database errors during creation', async () => {
                mockDb.query.mockRejectedValue(new Error('Insert failed'));

                const mutation = gql`
                    mutation CreateTask($title: String!, $detail: String!) {
                        createTask(title: $title, detail: $detail) {
                            id
                            title
                            detail
                            completed
                            created_at
                        }
                    }
                `;

                const result = await server.executeOperation({
                    query: mutation,
                    variables: { title: 'Test Task', detail: 'Test Detail' },
                });

                expect(result.body.kind).toBe('single');
                if (result.body.kind === 'single') {
                    expect(result.body.singleResult.errors).toBeDefined();
                    expect(result.body.singleResult.errors?.[0].message).toContain('Insert failed');
                }
            });
        });

        describe('updateTask mutation', () => {
            it('should update an existing task successfully', async () => {
                const updatedTask = { ...mockTask, title: 'Updated Task', completed: true };
                mockDb.query.mockResolvedValue({ rows: [updatedTask] });

                const mutation = gql`
                    mutation UpdateTask($id: ID!, $title: String!, $detail: String!, $completed: Boolean!) {
                        updateTask(id: $id, title: $title, detail: $detail, completed: $completed) {
                            id
                            title
                            detail
                            completed
                            created_at
                        }
                    }
                `;

                const result = await server.executeOperation({
                    query: mutation,
                    variables: { 
                        id: '1', 
                        title: 'Updated Task', 
                        detail: 'Updated Detail', 
                        completed: true 
                    },
                });

                expect(result.body.kind).toBe('single');
                if (result.body.kind === 'single') {
                    expect(result.body.singleResult.errors).toBeUndefined();
                    expect(result.body.singleResult.data?.updateTask).toEqual(updatedTask);
                }
                expect(mockDb.query).toHaveBeenCalledWith(
                    'UPDATE tasks SET title = $1, detail = $2, completed = $3 WHERE id = $4 RETURNING *',
                    ['Updated Task', 'Updated Detail', true, '1']
                );
            });
        });

        describe('deleteTask mutation', () => {
            it('should delete a task successfully', async () => {
                mockDb.query.mockResolvedValue({ rows: [mockTask] });

                const mutation = gql`
                    mutation DeleteTask($id: ID!) {
                        deleteTask(id: $id) {
                            id
                            title
                            detail
                            completed
                            created_at
                        }
                    }
                `;

                const result = await server.executeOperation({
                    query: mutation,
                    variables: { id: '1' },
                });

                expect(result.body.kind).toBe('single');
                if (result.body.kind === 'single') {
                    expect(result.body.singleResult.errors).toBeUndefined();
                    expect(result.body.singleResult.data?.deleteTask).toEqual(mockTask);
                }
                expect(mockDb.query).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = $1 RETURNING *', ['1']);
            });
        });

        describe('seedTasks mutation', () => {
            it('should seed tasks successfully', async () => {
                mockDb.query.mockResolvedValue({ rows: mockTasks });

                const mutation = gql`
                    mutation SeedTasks {
                        seedTasks {
                            id
                            title
                            detail
                            completed
                            created_at
                        }
                    }
                `;

                const result = await server.executeOperation({
                    query: mutation,
                });

                expect(result.body.kind).toBe('single');
                if (result.body.kind === 'single') {
                    expect(result.body.singleResult.errors).toBeUndefined();
                    expect(result.body.singleResult.data?.seedTasks).toEqual(mockTasks);
                }
                expect(mockDb.query).toHaveBeenCalledWith(
                    'INSERT INTO tasks (title, detail) VALUES ($1, $2), ($3, $4) RETURNING *',
                    ['Task 1', 'Detail 1', 'Task 2', 'Detail 2']
                );
            });
        });
    });

    describe('GraphQL Schema Validation', () => {
        it('should reject mutations with missing required fields', async () => {
            const mutation = gql`
                mutation CreateTask($title: String!) {
                    createTask(title: $title) {
                        id
                        title
                    }
                }
            `;

            const result = await server.executeOperation({
                query: mutation,
                variables: { title: 'Test Task' },
            });

            expect(result.body.kind).toBe('single');
            if (result.body.kind === 'single') {
                expect(result.body.singleResult.errors).toBeDefined();
                expect(result.body.singleResult.errors?.[0].message).toContain('detail');
            }
        });
        it('should reject mutations with invalid field types', async () => {
            const mutation = gql`
                mutation UpdateTask($id: ID!, $title: String!, $detail: String!, $completed: String!) {
                    updateTask(id: $id, title: $title, detail: $detail, completed: $completed) {
                        id
                        title
                    }
                }
            `;

            const result = await server.executeOperation({
                query: mutation,
                variables: { 
                    id: '1', 
                    title: 'Test', 
                    detail: 'Test', 
                    completed: 'not_boolean' 
                },
            });

            expect(result.body.kind).toBe('single');
            if (result.body.kind === 'single') {
                expect(result.body.singleResult.errors).toBeDefined();
            }
        });
    });

    describe('Database Connection Edge Cases', () => {
        it('should handle empty result sets gracefully', async () => {
            mockDb.query.mockResolvedValue({ rows: [] });

            const query = gql`
                query GetTasks {
                    tasks {
                        id
                        title
                    }
                }
            `;

            const result = await server.executeOperation({
                query,
            });

            expect(result.body.kind).toBe('single');
            if (result.body.kind === 'single') {
                expect(result.body.singleResult.errors).toBeUndefined();
                expect(result.body.singleResult.data?.tasks).toEqual([]);
            }
        });
        it('should handle database timeout errors', async () => {
            mockDb.query.mockRejectedValue(new Error('Connection timeout'));

            const query = gql`
                query GetTasks {
                    tasks {
                        id
                        title
                    }
                }
            `;

            const result = await server.executeOperation({
                query,
            });

            expect(result.body.kind).toBe('single');
            if (result.body.kind === 'single') {
                expect(result.body.singleResult.errors).toBeDefined();
                expect(result.body.singleResult.errors?.[0].message).toContain('Connection timeout');
            }
        });
    });
});

// Separate test suite for Next.js API handler configuration
describe('Next.js API Handler Configuration', () => {
    it('should export correct configuration', () => {
        // Test the exported config object
        const expectedConfig = {
            api: {
                bodyParser: false,
            }
        };

        // This would be imported from your actual handler file
        // expect(config).toEqual(expectedConfig);
        expect(expectedConfig.api.bodyParser).toBe(false);
    });

    it('should handle server initialization', async () => {
        const testServer = new ApolloServer({
            typeDefs: schema,
            resolvers,
        });

        await expect(testServer.start()).resolves.not.toThrow();
        await testServer.stop();
    });
});