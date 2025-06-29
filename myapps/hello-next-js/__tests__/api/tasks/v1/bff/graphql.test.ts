import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../../../pages/api/tasks/v1/bff/graphql';
import { TASKS_API_HEADER, getJWTFrmHttpOnlyCookie } from "@/lib/app/common";

// Mock the dependencies
jest.mock('../../../../../src/lib/app/common', () => ({
    TASKS_SQL_DOMAIN_API_URL: 'https://api.example.com/api/tasks/v1/sql',
    TASKS_SQL_BASE_API_URL: 'https://api.example.com/hello-next-js/api/tasks/v1/sql',
    TASKS_API_HEADER: jest.fn(),
    getJWTFrmHttpOnlyCookie: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/tasks/v1/bff/graphql handler', () => {
    let req: Partial<NextApiRequest>;
    let res: Partial<NextApiResponse>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let mockEnd: jest.Mock;
    let mockSend: jest.Mock;
    let mockSetHeader: jest.Mock;

    // Mock console.error to avoid noise in test output
    let spyConsoleError: jest.SpyInstance<any, any>;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Setup response mocks
        mockJson = jest.fn().mockReturnThis();
        mockStatus = jest.fn().mockReturnThis();
        mockEnd = jest.fn().mockReturnThis();
        mockSend = jest.fn().mockReturnThis();
        mockSetHeader = jest.fn().mockReturnThis();

        req = {
        method: 'POST',
        body: {
            query: 'query { tasks { id name } }',
            variables: { limit: 10 }
        }
        };

        res = {
        status: mockStatus,
        json: mockJson,
        end: mockEnd,
        send: mockSend,
        setHeader: mockSetHeader,
        };

        // Setup common mocks
        (getJWTFrmHttpOnlyCookie as jest.Mock).mockResolvedValue('mock-jwt-token');
        (TASKS_API_HEADER as jest.Mock).mockResolvedValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token'
        });

        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    });

    afterEach(() => {
        spyConsoleError.mockRestore();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST method', () => {
        it('should successfully proxy GraphQL request with JSON response', async () => {
            const mockResponseData = { data: { tasks: [{ id: 1, name: 'Task 1' }] } };
            const mockFetchResponse = {
                ok: true,
                status: 200,
                headers: {
                get: jest.fn().mockReturnValue('application/json')
                },
                text: jest.fn().mockResolvedValue(JSON.stringify(mockResponseData))
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(fetch).toHaveBeenCalledWith(
                "https://api.example.com/api/tasks/v1/sql/graphql",
                {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: 'query { tasks { id name } }',
                    variables: { limit: 10 }
                })
                }
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockSend).toHaveBeenCalledWith(JSON.stringify(mockResponseData));
        });

        it('should successfully proxy GraphQL request with non-JSON response', async () => {
            const mockResponseData = 'Plain text response';
            const mockFetchResponse = {
                ok: true,
                status: 200,
                headers: {
                get: jest.fn().mockReturnValue('text/plain')
                },
                text: jest.fn().mockResolvedValue(mockResponseData)
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockSetHeader).not.toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockSend).toHaveBeenCalledWith(mockResponseData);
        });

        it('should return 400 when query is missing', async () => {
            req.body = { variables: { limit: 10 } }; // Missing query

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "tasks/v1 | BFF | graphql.ts | POST | GraphQL query is required", 
            });
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should return 400 when variables is missing', async () => {
            req.body = { query: 'query { tasks { id name } }' }; // Missing variables

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "tasks/v1 | BFF | graphql.ts | POST | GraphQL variable is required", 
            });
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should return 400 when query is empty string', async () => {
            req.body = { query: '', variables: { limit: 10 } };

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "tasks/v1 | BFF | graphql.ts | POST | GraphQL query is required", 
            });
        });

        it('should return 400 when variables is empty object', async () => {
            req.body = { query: 'query { tasks { id name } }', variables: null };

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "tasks/v1 | BFF | graphql.ts | POST | GraphQL variable is required", 
            });
        });

        it('should handle GraphQL server error response', async () => {
            const mockFetchResponse = {
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                headers: {
                get: jest.fn().mockReturnValue('application/json')
                },
                text: jest.fn().mockResolvedValue('{"errors": [{"message": "GraphQL error"}]}')
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "tasks/v1 | BFF | graphql.ts | POST | catched error: Error - tasks/v1 | BFF | graphql.ts | POST | not ok response: 400 - Bad Request " 
            });
        });

        it('should handle GraphQL server 500 error', async () => {
            const mockFetchResponse = {
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                headers: {
                get: jest.fn().mockReturnValue('application/json')
                },
                text: jest.fn().mockResolvedValue('Internal server error')
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "tasks/v1 | BFF | graphql.ts | POST | catched error: Error - tasks/v1 | BFF | graphql.ts | POST | not ok response: 500 - Internal Server Error " 
            });
        });

        it('should handle network error', async () => {
            (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "tasks/v1 | BFF | graphql.ts | POST | catched error: Error - Network error", 
            });
        });

        it('should handle JWT token retrieval error', async () => {
            (getJWTFrmHttpOnlyCookie as jest.Mock).mockRejectedValue(new Error('JWT error'));

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "tasks/v1 | BFF | graphql.ts | POST | catched error: Error - JWT error", 
            });
        });

        it('should handle TASKS_API_HEADER error', async () => {
            (TASKS_API_HEADER as jest.Mock).mockRejectedValue(new Error('Header error'));

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "tasks/v1 | BFF | graphql.ts | POST | catched error: Error - Header error", 
            });
        });

        it('should handle response.text() error', async () => {
            const mockFetchResponse = {
                ok: true,
                status: 200,
                headers: {
                get: jest.fn().mockReturnValue('application/json')
                },
                text: jest.fn().mockRejectedValue(new Error('Failed to read response'))
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: "tasks/v1 | BFF | graphql.ts | POST | catched error: Error - Failed to read response" 
            });
        });

        it('should preserve response status from GraphQL server', async () => {
            const mockFetchResponse = {
                ok: true,
                status: 201,
                headers: {
                get: jest.fn().mockReturnValue('application/json')
                },
                text: jest.fn().mockResolvedValue('{"data": {"created": true}}')
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockSend).toHaveBeenCalledWith('{"data": {"created": true}}');
        });

        it('should handle content-type with charset', async () => {
            const mockResponseData = { data: { tasks: [] } };
            const mockFetchResponse = {
                ok: true,
                status: 200,
                headers: {
                get: jest.fn().mockReturnValue('application/json; charset=utf-8')
                },
                text: jest.fn().mockResolvedValue(JSON.stringify(mockResponseData))
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockSend).toHaveBeenCalledWith(JSON.stringify(mockResponseData));
        });
    });

    describe('Non-POST methods', () => {
        it('should return 405 for GET method', async () => {
            req.method = 'GET';

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockSetHeader).toHaveBeenCalledWith('Allow', ['POST']);
            expect(mockStatus).toHaveBeenCalledWith(405);
            expect(mockEnd).toHaveBeenCalledWith('Method GET Not Allowed');
        });

         it('should return 405 for PUT method', async () => {
            req.method = 'PUT';

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockSetHeader).toHaveBeenCalledWith('Allow', ['POST']);
            expect(mockStatus).toHaveBeenCalledWith(405);
            expect(mockEnd).toHaveBeenCalledWith('Method PUT Not Allowed');
        });

        it('should return 405 for DELETE method', async () => {
            req.method = 'DELETE';

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockSetHeader).toHaveBeenCalledWith('Allow', ['POST']);
            expect(mockStatus).toHaveBeenCalledWith(405);
            expect(mockEnd).toHaveBeenCalledWith('Method DELETE Not Allowed');
        });
    });

    describe('Integration scenarios', () => {
        it('should handle complex GraphQL query with multiple variables', async () => {
            req.body = {
                query: `
                query GetTasksWithFilters($limit: Int!, $status: String!, $userId: ID!) {
                    tasks(limit: $limit, status: $status, userId: $userId) {
                    id
                    name
                    status
                    createdAt
                    }
                }
                `,
                variables: {
                limit: 50,
                status: 'ACTIVE',
                userId: 'user123'
                }
            };

            const mockResponseData = {
                data: {
                tasks: [
                    { id: 1, name: 'Task 1', status: 'ACTIVE', createdAt: '2023-01-01' },
                    { id: 2, name: 'Task 2', status: 'ACTIVE', createdAt: '2023-01-02' }
                ]
                }
            };

            const mockFetchResponse = {
                ok: true,
                status: 200,
                headers: {
                get: jest.fn().mockReturnValue('application/json')
                },
                text: jest.fn().mockResolvedValue(JSON.stringify(mockResponseData))
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(fetch).toHaveBeenCalledWith(
                "https://api.example.com/api/tasks/v1/sql/graphql",
                expect.objectContaining({
                body: JSON.stringify({
                    query: req.body.query,
                    variables: req.body.variables
                })
                })
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockSend).toHaveBeenCalledWith(JSON.stringify(mockResponseData));
        });

        it('should handle GraphQL mutation', async () => {
            req.body = {
                query: `
                mutation CreateTask($input: CreateTaskInput!) {
                    createTask(input: $input) {
                    id
                    name
                    status
                    }
                }
                `,
                variables: {
                input: {
                    name: 'New Task',
                    description: 'Task description'
                }
                }
            };

            const mockResponseData = {
                data: {
                    createTask: {
                        id: 123,
                        name: 'New Task',
                        status: 'PENDING'
                    }
                }
            };

            const mockFetchResponse = {
                ok: true,
                status: 200,
                headers: {
                get: jest.fn().mockReturnValue('application/json')
                },
                text: jest.fn().mockResolvedValue(JSON.stringify(mockResponseData))
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

            await handler(req as NextApiRequest, res as NextApiResponse);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockSend).toHaveBeenCalledWith(JSON.stringify(mockResponseData));
        });
    });
});
