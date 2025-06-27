// Mock the external dependencies
jest.mock('../../../../../src/lib/app/common', () => ({
    TASKS_SQL_DOMAIN_API_URL: 'https://api.example.com/api/tasks/v1/sql',
    TASKS_SQL_BASE_API_URL: 'https://api.example.com/hello-next-js/api/tasks/v1/sql',
    TASKS_API_HEADER: jest.fn().mockResolvedValue({
        "Content-Type": "application/json",
        "x-api-key": "test-key",
    }),
    getInternalApiKey: jest.fn().mockResolvedValue("test-key"),
}));

// Mock fetch globally
global.fetch = jest.fn();

import handler from '../../../../../pages/api/tasks/v1/bff';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks, RequestMethod } from 'node-mocks-http';
import { TASKS_API_HEADER, TASKS_SQL_BASE_API_URL, TASKS_SQL_DOMAIN_API_URL, getInternalApiKey } from '@/lib/app/common';

describe('/api/tasks/v1/bff handler', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Reset fetch mock
        (fetch as jest.MockedFunction<typeof fetch>).mockReset();
        
        // Reset console methods to avoid noise in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore console methods
        jest.restoreAllMocks();
    });

    describe('GET method', () => {
        it('should successfully fetch and return tasks', async () => {
            // Arrange
            const mockTasks = [
                { id: 1, title: 'Task 1', completed: false },
                { id: 2, title: 'Task 2', completed: true }
            ];
        
            const mockHeaders = { 
                'Content-Type': 'application/json', 
                'x-api-key': 'test-key', 
            };
            
            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockResolvedValue(mockHeaders);
            
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: jest.fn().mockResolvedValue(mockTasks)
            } as any);

            const { req, res } = createMocks({
                method: 'GET',
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                'https://api.example.com/hello-next-js/api/tasks/v1/sql/',
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: mockHeaders
                }
            );
            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(mockTasks);
        });

        it('should handle API response errors (non-2xx status)', async () => {
            // Arrange
            const mockHeaders = { 
                'Content-Type': 'application/json', 
                'x-api-key': 'test-key', 
                Authorization: 'bearer '
            };
            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockResolvedValue(mockHeaders);

            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            } as any);

            const { req, res } = createMocks({
                method: 'GET',
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("tasks/v1 | BFF | index.ts | GET | not ok response: 404 - Not Found ")
            );
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("tasks/v1 | BFF | index.ts | GET | catched error: Error - tasks/v1 | BFF | index.ts | GET | not ok response: 404 - Not Found ")
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'tasks/v1 | BFF | index.ts | GET | catched error: Error - tasks/v1 | BFF | index.ts | GET | not ok response: 404 - Not Found '
            });
        });

        it('should handle network/fetch errors', async () => {
            // Arrange
            const mockHeaders = { 
                'Content-Type': 'application/json', 
                'x-api-key': 'test-key', 
                Authorization: 'bearer '
            };
            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockResolvedValue(mockHeaders);

            const networkError = new Error('Network error');
            (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(networkError);

            const { req, res } = createMocks({
                method: 'GET',
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith("tasks/v1 | BFF | index.ts | GET | catched error: Error - Network error");
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'tasks/v1 | BFF | index.ts | GET | catched error: Error - Network error'
            });
        });

        it('should handle TASKS_API_HEADER errors', async () => {
            // Arrange
            const headerError = new Error('Failed to get headers');
            
            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockRejectedValue(headerError);
            //(getInternalApiKey as jest.Mock).mockRejectedValue(headerError);
            const { req, res } = createMocks({
                method: 'GET',
                credentials: 'include'
            });
            
            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith("tasks/v1 | BFF | index.ts | GET | catched error: Error - Failed to get headers");
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'tasks/v1 | BFF | index.ts | GET | catched error: Error - Failed to get headers'
            });
        });

        it('should handle JSON parsing errors', async () => {
            // Arrange
            const mockHeaders = { 
                'Content-Type': 'application/json', 
                'x-api-key': 'test-key'
            };
            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockResolvedValue(mockHeaders);
            //(getInternalApiKey as jest.Mock).mockRejectedValue(jsonError);
            
            const jsonError = new Error('Invalid JSON');
            
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: jest.fn().mockRejectedValue(jsonError)
            } as any);

            const { req, res } = createMocks({
                method: 'GET',
                credentials: 'include'
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith("tasks/v1 | BFF | index.ts | GET | catched error: Error - Invalid JSON");
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'tasks/v1 | BFF | index.ts | GET | catched error: Error - Invalid JSON'
            });
        });
    });

    describe('POST method', () => {
        it('should return 405 Method Not Allowed for POST requests', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(res._getStatusCode()).toBe(405);
            expect(res._getHeaders()).toEqual({
                allow: ['GET']
            });
            expect(res._getData()).toBe('Method POST Not Allowed');
        });
    });

    describe('Other HTTP methods', () => {
        it.each(['PUT', 'DELETE', 'PATCH', 'OPTIONS'] as RequestMethod[])(
            'should return 405 Method Not Allowed for %s requests',
            async (method) => {
                // Arrange
                const { req, res } = createMocks({ method });

                // Act
                await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

                // Assert
                expect(res._getStatusCode()).toBe(405);
                expect(res._getHeaders()).toEqual({
                allow: ['GET']
                });
                expect(res._getData()).toBe(`Method ${method} Not Allowed`);
            }
        );
    });

    describe('Integration scenarios', () => {
        it('should properly construct the API URL using BASE_URL', async () => {
            // Arrange
            const mockTasks = [{ id: 1, title: 'Test Task' }];
            
            const mockHeaders = { 
                'Content-Type': 'application/json', 
                'x-api-key': 'test-key'
            };

            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockResolvedValue(mockHeaders);
            //(getInternalApiKey as jest.Mock).mockResolvedValue('test-key');
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: jest.fn().mockResolvedValue(mockTasks)
            } as any);

            const { req, res } = createMocks({
                method: 'GET' as RequestMethod,
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                'https://api.example.com/hello-next-js/api/tasks/v1/sql/',
                {
                    "credentials": "include", 
                    "headers": {"Content-Type": "application/json", "x-api-key": "test-key"}, 
                    "method": "GET"
                }
            );
        });

        it('should await TASKS_API_HEADER before making the fetch request', async () => {
            // Arrange
            const mockTasks = [{ id: 1, title: 'Test Task' }];
            let headersCalled = false;
                        
            (TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>)
                .mockImplementation(async () => {
                    headersCalled = true;
                    return { 
                        'Content-Type': 'application/json', 
                        'x-api-key': 'test-key',
                        Authorization: 'bearer ' 
                    };
                });
            /*
            (getInternalApiKey as jest.Mock).mockImplementation(async () => {
                headersCalled = true;
                return 'test-key';
            });
            */
            (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(async () => {
                // Verify headers were called before fetch
                expect(headersCalled).toBe(true);
                return {
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    json: jest.fn().mockResolvedValue(mockTasks)
                } as any;
            });

            const { req, res } = createMocks({
                method: 'GET' as RequestMethod,
                credentials: 'include',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(TASKS_API_HEADER).toHaveBeenCalled();
            expect(fetch).toHaveBeenCalled();
        });
    });
});
