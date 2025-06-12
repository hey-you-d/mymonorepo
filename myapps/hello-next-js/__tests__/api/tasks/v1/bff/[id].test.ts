import { createMocks, RequestMethod } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../../../pages/api/tasks/v1/bff/[id]';
import { TASKS_API_HEADER } from '@/lib/app/common';

// Mock the external dependencies
jest.mock('../../../../../src/lib/app/common', () => ({
  BASE_URL: 'https://api.example.com',
  TASKS_API_HEADER: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to avoid cluttering test output
let mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('/api/tasks/v1/bff/[id] handler', () => {
    const mockTasksApiHeader = TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>;
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Reset console methods to avoid noise in tests
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        mockTasksApiHeader.mockResolvedValue({
            'Content-Type': 'application/json',
            'x-api-key': 'valid key',
            Authorization: 'bearer '
        });
    });

        afterEach(() => {
        mockConsoleError.mockClear();
    });

    afterAll(() => {
        mockConsoleError.mockRestore();
    });

    describe('GET method', () => {
        it('should successfully fetch a task by id', async () => {
            const mockTask = [{ id: '123', title: 'Test Task', detail: 'Test Detail', completed: false }];
            
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockTask),
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                query: { id: '123' },
            });

            await handler(req, res);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.example.com/api/tasks/v1/sql/123',
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': 'valid key', Authorization: 'bearer ' },
                    credentials: 'include',
                }
            );
            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(mockTask);
        });

        it('should handle array id parameter', async () => {
            const mockTask = [{ id: '123', title: 'Test Task', detail: 'Test Detail', completed: false }];
            
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockTask),
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                credentials: 'include',
                query: { id: ['123', '456'] }, // Array format
            });

            await handler(req, res);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.example.com/api/tasks/v1/sql/123', // Should use first element
                expect.any(Object)
            );
            expect(res._getStatusCode()).toBe(200);
        });

        it('should handle API error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                credentials: 'include',
                query: { id: '123' },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF get row for id 123 - server error'
            });
        });

        it('should handle network error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                credentials: 'include',
                query: { id: '123' },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF get row for id 123 - server error'
            });
        });
    });

    describe('PUT method', () => {
        it('should successfully update a task', async () => {
            const mockUpdatedTask = [{ id: '123', title: 'Updated Task', detail: 'Updated Detail', completed: true }];
            
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockUpdatedTask),
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'PUT',
                credentials: 'include',
                query: { id: '123' },
                body: {
                    title: 'Updated Task',
                    detail: 'Updated Detail',
                    completed: true,
                },
            });

            await handler(req, res);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.example.com/api/tasks/v1/sql/123',
                {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'x-api-key': 'valid key', Authorization: 'bearer ' },
                body: JSON.stringify({
                    title: 'Updated Task',
                    detail: 'Updated Detail',
                    completed: true,
                }),
                }
            );
            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(mockUpdatedTask);
        });

        it('should return 400 if title is missing', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'PUT',
                credentials: 'include',
                query: { id: '123' },
                body: {
                    // missing title
                    detail: 'Updated Detail',
                    completed: true,
                },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF Error updating row 123 - Title is required'
            });
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should return 400 if detail is missing', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'PUT',
                credentials: 'include',
                query: { id: '123' },
                body: {
                    title: 'Updated Task',
                    // missing detail
                    completed: true,
                },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF Error updating row 123 - Detail is required'
            });
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should handle API error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'PUT',
                credentials: 'include',
                query: { id: '123' },
                body: {
                    title: 'Updated Task',
                    detail: 'Updated Detail',
                    completed: true,
                },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF update row for id 123 - server error'
            });
        });
    });

    describe('DELETE method', () => {
        it('should successfully delete a task', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'DELETE',
                credentials: 'include',
                query: { id: '123' },
            });

            await handler(req, res);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.example.com/api/tasks/v1/sql/123',
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': 'valid key', Authorization: 'bearer ' },
                }
            );
            expect(res._getStatusCode()).toBe(204);
        });

        it('should handle API error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            } as any);

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'DELETE',
                credentials: 'include',
                query: { id: '123' },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF delete row for id 123 - server error'
            });
        });

        it('should handle network error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'DELETE',
                credentials: 'include',
                query: { id: '123' },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF delete row for id 123 - server error'
            });
        });
    });


    describe('Other HTTP methods', () => {
        it.each(['PATCH', 'OPTIONS', 'POST'] as RequestMethod[])(
            'should return 405 Method Not Allowed for %s requests',
            async (method) => {
                // Arrange
                const { req, res } = createMocks({ method });

                // Act
                await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

                // Assert
                expect(res._getStatusCode()).toBe(405);
                expect(res._getHeaders()).toEqual({
                    allow: ['GET', 'PUT', 'DELETE']
                });
                expect(res._getData()).toBe(`Method ${method} Not Allowed`);
            }
        );
    });

    describe('TASKS_API_HEADER error handling', () => {
        it('should handle TASKS_API_HEADER rejection', async () => {
            mockTasksApiHeader.mockRejectedValueOnce(new Error('Header generation failed'));

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                credentials: 'include',
                query: { id: '123' },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF get row for id 123 - server error'
            });
        });
    });
});