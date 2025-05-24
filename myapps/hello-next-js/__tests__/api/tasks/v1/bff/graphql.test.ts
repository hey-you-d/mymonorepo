import { createMocks, RequestMethod } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../../../pages/api/tasks/v1/bff/graphql';
import { DOMAIN_URL, TASKS_API_HEADER } from '@/lib/app/common';

// Mock the dependencies
jest.mock('../../../../../src/lib/app/common', () => ({
    DOMAIN_URL: 'https://test-domain.com',
    TASKS_API_HEADER: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/tasks/v1/bff/graphql handler', () => {
    const mockTasksApiHeader = TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>;
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockTasksApiHeader.mockResolvedValue({
            'Content-Type': 'application/json',
            'x-api-key': 'valid key',
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('POST method', () => {
        it('should successfully proxy a GraphQL request with JSON response', async () => {
            const mockResponseData = {
                data: { tasks: [{ id: '1', title: 'Test Task' }] }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: {
                    get: jest.fn().mockReturnValue('application/json'),
                },
                text: jest.fn().mockResolvedValue(JSON.stringify(mockResponseData)),
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    query: 'query { tasks { id title } }',
                    variables: { limit: 10 },
                },
            });

            await handler(req, res);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://test-domain.com/api/tasks/v1/sql/graphql',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'valid key',
                    },
                    body: JSON.stringify({
                        query: 'query { tasks { id title } }',
                        variables: { limit: 10 },
                    }),
                }
            );

            expect(res._getStatusCode()).toBe(200);
            expect(res._getHeaders()['content-type']).toBe('application/json');
            expect(res._getData()).toBe(JSON.stringify(mockResponseData));
        });

        it('should successfully proxy a GraphQL request with non-JSON response', async () => {
            const mockResponseData = 'Plain text response';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: {
                    get: jest.fn().mockReturnValue('text/plain'),
                },
                text: jest.fn().mockResolvedValue(mockResponseData),
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    query: 'query { tasks { id title } }',
                    variables: { limit: 10 },
                },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(res._getHeaders()['content-type']).toBeUndefined();
            expect(res._getData()).toBe(mockResponseData);
        });

        it('should return 400 when query is missing', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    // missing query
                    variables: { limit: 10 },
                },
            });

            await handler(req, res);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF graphql proxy error - Query is required'
            });
        });

        it('should return 400 when variables are missing', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    query: 'query { tasks { id title } }',
                    // variable is missing
                },
            });

            await handler(req, res);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF graphql proxy error - Variable is required'
            });
        });

        it('should handle upstream server errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            } as any);

            // Spy on console.error to verify logging
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    query: 'query { tasks { id title } }',
                    variables: { limit: 10 },
                },
            });

            await handler(req, res);

            expect(consoleSpy).toHaveBeenCalledWith(
                'BFF Error fetching data with graphql server: 500 - Internal Server Error'
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF graphql proxy error'
            });

            consoleSpy.mockRestore();
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            // Spy on console.error to verify logging
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    query: 'query { tasks { id title } }',
                    variables: { limit: 10 },
                },
            });

            await handler(req, res);

            expect(consoleSpy).toHaveBeenCalledWith(
                'BFF graphql proxy error',
                expect.any(Error)
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF graphql proxy error'
            });

            consoleSpy.mockRestore();
        });

        it('should forward the correct status code from upstream', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                statusText: 'Created',
                headers: {
                    get: jest.fn().mockReturnValue('application/json'),
                },
                text: jest.fn().mockResolvedValue('{"success": true}'),
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                query: 'mutation { createTask(input: {title: "New Task"}) { id } }',
                variables: {},
                },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(201);
        });

        it('should handle TASKS_API_HEADER returning a promise', async () => {
            const mockHeaders = {
                'Content-Type': 'application/json',
                'x-api-key': 'valid key',
                'X-Custom-Header': 'custom-value',
            };
            
            mockTasksApiHeader.mockResolvedValue(mockHeaders);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: {
                    get: jest.fn().mockReturnValue('application/json'),
                },
                text: jest.fn().mockResolvedValue('{"data": {}}'),
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    query: 'query { tasks { id } }',
                    variables: {},
                },
            });

            await handler(req, res);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://test-domain.com/api/tasks/v1/sql/graphql',
                {
                    method: 'POST',
                    headers: mockHeaders,
                    body: JSON.stringify({
                        query: 'query { tasks { id } }',
                        variables: {},
                    }),
                }
            );
        });
    });

    describe('Non-POST methods', () => {
        it.each(['GET', 'PUT', 'DELETE', 'PATCH'] as RequestMethod[])(
            'should return 405 Method Not Allowed for %s method',
            async (method) => {
                // Arrange
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                    method: method
                });

                // Act
                await handler(req, res);

                // Assert
                expect(res._getHeaders()).toHaveProperty('allow', ['POST']);
                expect(res._getStatusCode()).toBe(405);
                expect(res._getData()).toBe(`Method ${method} Not Allowed`);
            }
        );
    });
    
    describe('Edge cases', () => {
        it('should handle empty request body', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {},
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF graphql proxy error - Query is required'
            });
        });

        it('should handle null values in request body', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    query: null,
                    variables: { limit: 10 },
                },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF graphql proxy error - Query is required'
            });
        });

        it('should handle undefined content-type header', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: {
                    get: jest.fn().mockReturnValue(null),
                },
                text: jest.fn().mockResolvedValue('response without content-type'),
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    query: 'query { tasks { id } }',
                    variables: {},
                },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(res._getData()).toBe('response without content-type');
        });
    });
});
