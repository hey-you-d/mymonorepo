import handler from '../../../../../pages/api/tasks/v1/bff/delete-rows';
import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { BASE_URL, TASKS_API_HEADER } from '@/lib/app/common';

// Mock the dependencies
jest.mock('../../../../../src/lib/app/common', () => ({
  BASE_URL: 'https://test-api.com',
  TASKS_API_HEADER: jest.fn()
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to avoid cluttering test output
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('/api/tasks/v1/bff/delete-rows handler', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup default mock for TASKS_API_HEADER
        (TASKS_API_HEADER as jest.Mock).mockResolvedValue({
            'Content-Type': 'application/json',
            'x-api-key': 'valid key',
            'Authorization': 'bearer '
        });
    });

    afterEach(() => {
        mockConsoleError.mockClear();
    });

    afterAll(() => {
        mockConsoleError.mockRestore();
    });

    describe('POST method', () => {
        it('should successfully delete all tasks and return 200 with result', async () => {
            // Arrange
            const mockTasks = [
                { id: 1, title: 'Task 1', completed: false },
                { id: 2, title: 'Task 2', completed: true }
            ];

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST' as RequestMethod,
                credentials: 'include',
            });

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockTasks)
            });

            // Act
            await handler(req, res);

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                'https://test-api.com/api/tasks/v1/sql/delete-rows',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'valid key',
                        'Authorization': 'bearer '
                    },
                    credentials: "include",
                }
            );
            expect(TASKS_API_HEADER).toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(mockTasks);
        });

        it('should handle API response error (not ok)', async () => {
            // Arrange
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST' as RequestMethod,
                credentials: 'include',
            });

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            // Act
            await handler(req, res);

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                'https://test-api.com/api/tasks/v1/sql/delete-rows',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'valid key',
                        'Authorization': 'bearer '
                    },
                    credentials: 'include',
                }
            );
            expect(mockConsoleError).toHaveBeenCalledWith(
                'BFF Error deleting all rows: 404 - Not Found'
            );
            expect(mockConsoleError).toHaveBeenCalledWith(
                'BFF deleting all rows - server error',
                expect.any(Error)
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF deleting all rows - server error'
            });
        });

        it('should handle fetch network error', async () => {
            // Arrange
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST' as RequestMethod,
                credentials: 'include',
            });
            
            const networkError = new Error('Network error');
            (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

            // Act
            await handler(req, res);

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                'https://test-api.com/api/tasks/v1/sql/delete-rows',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'valid key',
                        'Authorization': 'bearer '
                    },
                    credentials: "include",
                }
            );
            expect(mockConsoleError).toHaveBeenCalledWith(
                'BFF deleting all rows - server error',
                networkError
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF deleting all rows - server error'
            });
        });

        it('should handle JSON parsing error', async () => {
            // Arrange
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST' as RequestMethod,
                credentials: 'include',
            });
            
            const jsonError = new Error('Invalid JSON');
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockRejectedValue(jsonError)
            });

            // Act
            await handler(req as NextApiRequest, res as NextApiResponse);

            // Assert
            expect(mockConsoleError).toHaveBeenCalledWith(
                'BFF deleting all rows - server error',
                jsonError
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF deleting all rows - server error'
            });
        });

        it('should handle TASKS_API_HEADER throwing an error', async () => {
            // Arrange
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST' as RequestMethod,
                credentials: 'include',
            });
            
            const headerError = new Error('Header generation failed');
            (TASKS_API_HEADER as jest.Mock).mockRejectedValueOnce(headerError);

            // Act
            await handler(req, res);

            // Assert
            expect(mockConsoleError).toHaveBeenCalledWith(
                'BFF deleting all rows - server error',
                headerError
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'BFF deleting all rows - server error'
            });
        });
    });

    describe('Non-POST methods', () => {
        it.each(['GET', 'PUT', 'DELETE', 'PATCH'])(
            'should return 405 Method Not Allowed for %s method',
            async (method) => {
                // Arrange
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                    method: method as RequestMethod,
                    credentials: 'include',
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
        it('should handle empty response body', async () => {
            // Arrange
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST' as RequestMethod,
                credentials: 'include',
            });
            
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue([])
            });

            // Act
            await handler(req, res);

            // Assert
            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual([]);
        });

        it('should handle API returning null', async () => {
            // Arrange
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST' as RequestMethod,
                credentials: 'include',
            });
            
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(null)
            });

            // Act
            await handler(req, res);

            // Assert
            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toBeNull();
        });
    });
});