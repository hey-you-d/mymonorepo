// Mock the external dependencies
jest.mock('../../../../../src/lib/app/common', () => ({
    BASE_URL: 'https://api.example.com',
    TASKS_API_HEADER: jest.fn(),
    VERIFY_JWT_RETURN_API_RES: jest.fn().mockResolvedValue(true),
    getJWTFrmHttpOnlyCookie: jest.fn().mockResolvedValue("fake jwt"),
}));

// Mock fetch globally
global.fetch = jest.fn();

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks, RequestMethod } from 'node-mocks-http';
//import handler from '../../../../../pages/api/tasks/v1/bff/create-row';
//import { BASE_URL, TASKS_API_HEADER, VERIFY_JWT_RETURN_API_RES } from '@/lib/app/common';
const handler = require('../../../../../pages/api/tasks/v1/bff/create-row').default;
const {
  BASE_URL,  
  TASKS_API_HEADER,
  VERIFY_JWT_RETURN_API_RES,
} = require('../../../../../src/lib/app/common');

describe('/api/tasks/v1/bff/create-row handler', () => {
    const mockHeaders = { 'Content-Type': 'application/json', 'x-api-key': 'valid key', Authorization: 'bearer ' };
    
    beforeEach(() => {
        jest.clearAllMocks();
        (TASKS_API_HEADER as jest.Mock).mockResolvedValue(mockHeaders);

        // Setup default mock for VERIFY_JWT_RETURN_API_RES
        (VERIFY_JWT_RETURN_API_RES as jest.Mock).mockResolvedValue(true);

        console.error = jest.fn(); // Mock console.error to avoid noise in tests
    });

    describe('POST method', () => {
        it('should create a task successfully with valid data', async () => {
            // Arrange
            const mockTaskResponse = [
                { id: 1, title: 'Test Task', detail: 'Test Detail', completed: false, created_at: '2024-01-01T00:00:00Z' }
            ];
            const mockHeaders = {
                'Content-Type': 'application/json',
                'x-api-key': 'test-key',
                'Authorization': 'bearer '
            };

            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>).mockResolvedValue(mockHeaders);
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockTaskResponse),
            });

            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
                body: {
                    title: 'Test Task',
                    detail: 'Test Detail'
                }
            });

            //  Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);


            //  Assert
            expect(fetch).toHaveBeenCalledWith(
                `${BASE_URL}/api/tasks/v1/sql/create-row`,
                {
                    method: 'POST',
                    headers: mockHeaders,
                    credentials: 'include',
                    body: JSON.stringify({
                        title: 'Test Task',
                        detail: 'Test Detail'
                    }),
                }
            );

            expect(res._getStatusCode()).toBe(201);
            expect(JSON.parse(res._getData())).toEqual(mockTaskResponse);
        });

        it('should return 400 error when title is missing', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
                body: {
                    // missing title
                    detail: 'Test Detail'
                }
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);


            // Assert
            expect(fetch).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF Error creating row - Title is required'
            });
        });

        it('should return 400 error when title is empty string', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
                body: {
                    title: '',
                    detail: 'Test Detail'
                }
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(fetch).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF Error creating row - Title is required'
            });
        });

        it('should return 400 error when detail is missing', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
                body: {
                    title: 'Test Task'
                    // detail is missing
                }
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);


            // Assert
            expect(fetch).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF Error creating row - Detail is required'
            });
        });

        it('should return 400 error when detail is empty string', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
                body: {
                    title: 'Test Task',
                    detail: ''
                }
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);


            // Assert
            expect(fetch).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF Error creating row - Detail is required'
            });
        });

        it('should return 400 error when both title and detail are missing', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
                body: {} // empty body, missing title & detail
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(fetch).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF Error creating row - Title is required'
            });
        });

        it('should handle API response error (400)', async () => {
            // Arrange
            const mockHeaders = {
                'Content-Type': 'application/json',
                'x-api-key': 'test-key',
                'Authorization': 'bearer '
            };

            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockResolvedValue(mockHeaders);
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
            } as any);

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    title: 'Test Task',
                    detail: 'Test Detail'
                },
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                'BFF Error creating row: 400 - Bad Request'
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF creating row - server error'
            });
        });

        it('should handle API response error (500)', async () => {
            // Arrange
            const mockHeaders = {
                'Content-Type': 'application/json',
                'x-api-key': 'test-key',
                'Authorization': 'bearer '
            };

            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockResolvedValue(mockHeaders);
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            } as any);

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    title: 'Test Task',
                    detail: 'Test Detail'
                },
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                'BFF Error creating row: 500 - Internal Server Error'
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF creating row - server error'
            });
        });

        it('should handle network/fetch error', async () => {
            // Arrange
            const mockHeaders = {
                'Content-Type': 'application/json',
                'x-api-key': 'test-key',
                'Authorization': 'bearer '
            };
            const networkError = new Error('Network error');

            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockResolvedValue(mockHeaders);
            (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(networkError);

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    title: 'Test Task',
                    detail: 'Test Detail'
                },
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                'BFF creating row - server error',
                networkError
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF creating row - server error'
            });
        });

        it('should handle TASKS_API_HEADER rejection', async () => {
            // Arrange
            const headerError = new Error('Header generation failed');

            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockRejectedValue(headerError);

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    title: 'Test Task',
                    detail: 'Test Detail'
                },
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                'BFF creating row - server error',
                headerError
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF creating row - server error'
            });
        });
    });

    describe('Other HTTP methods', () => {
        it.each(['GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] as RequestMethod[])(
            'should return 405 Method Not Allowed for %s requests',
            async (method) => {
                // Arrange
                const { req, res } = createMocks({ method });

                // Act
                await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

                // Assert
                expect(res._getStatusCode()).toBe(405);
                expect(res._getHeaders()).toEqual({
                    allow: ['POST']
                });
                expect(res._getData()).toBe(`Method ${method} Not Allowed`);
            }
        );
    });

    describe('Edge cases', () => {
        it('should handle null values in request body', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    title: null,
                    detail: 'Test Detail'
                },
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF Error creating row - Title is required'
            });
        });

        it('should handle undefined values in request body', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    title: undefined,
                    detail: 'Test Detail'
                },
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF Error creating row - Title is required'
            });
        });

        it('should handle whitespace-only strings', async () => {
            // Arrange
            const mockTaskResponse = [
                { id: 1, title: '   ', detail: 'Test Detail', completed: false, created_at: '2025-01-01T00:00:00Z' }
            ];
            const mockHeaders = {
                'Content-Type': 'application/json',
                'x-api-key': 'test-key',
                'Authorization': 'bearer '
            };

            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockResolvedValue(mockHeaders);
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
                ok: true,
                status: 201,
                statusText: 'Created',
                json: jest.fn().mockResolvedValue(mockTaskResponse)
            } as any);

            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
                body: {
                    title: '   ', // whitespace only strings
                    detail: 'Test Detail'
                }
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(fetch).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(400);
        });
    });
});
