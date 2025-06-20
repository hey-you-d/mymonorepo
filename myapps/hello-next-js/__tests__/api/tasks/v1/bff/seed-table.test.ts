// Mock the external dependencies
jest.mock('../../../../../src/lib/app/common', () => ({
    BASE_URL: 'https://test-api.example.com',
    TASKS_API_HEADER: jest.fn(),
    VERIFY_JWT_RETURN_API_RES: jest.fn().mockResolvedValue(true),
    getJWTFrmHttpOnlyCookie: jest.fn().mockResolvedValue("fake jwt"),    
}));

// Mock fetch globally
global.fetch = jest.fn();

import { createMocks, RequestMethod } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Task } from '@/types/Task';
//import handler from '../../../../../pages/api/tasks/v1/bff/seed-table';
//import { TASKS_API_HEADER, VERIFY_JWT_RETURN_API_RES } from '@/lib/app/common';
const handler = require('../../../../../pages/api/tasks/v1/bff/seed-table').default;
const {
  BASE_URL,  
  TASKS_API_HEADER,
  VERIFY_JWT_RETURN_API_RES,
} = require('../../../../../src/lib/app/common');

describe('/api/tasks/v1/bff/seed-table handler', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup default mock for VERIFY_JWT_RETURN_API_RES
        (VERIFY_JWT_RETURN_API_RES as jest.Mock).mockResolvedValue(true);
        
        // Mock console methods to avoid noise in test output
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        // Restore console methods
        jest.restoreAllMocks();
    });

    describe('POST method', () => {
        it('should successfully seed tasks and return 200 with task data', async () => {
            // Arrange
            const mockTasks: Task[] = [
                { id: 1, title: 'Test Task 1', detail: 'Test Task Detail 1', completed: false, created_at: '' },
                { id: 2, title: 'Test Task 2', detail: 'Test Task Detail 2', completed: true, created_at: '' },
            ];

            // Create fresh mock request and response objects
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include'
            });
        
            const mockHeaders = { 'x-api-key': 'valid key' };
            (TASKS_API_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
        
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockTasks),
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(TASKS_API_HEADER).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://test-api.example.com/api/tasks/v1/sql/seed-table',
                { method: 'POST', headers: mockHeaders, credentials: 'include' }
            );
            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(mockTasks);
        });

        it('should handle API response not ok (4xx error)', async () => {
            // Arrange
            // Create fresh mock request and response objects
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include'
            });
            const mockHeaders = { 'x-api-key': 'valid key' };
            (TASKS_API_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("tasks/v1 | BFF | seed-table.ts | POST | not ok response: 400 - Bad Request")
            );
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("tasks/v1 | BFF | seed-table.ts | POST | catched error: Error - tasks/v1 | BFF | seed-table.ts | POST | not ok response: 400 - Bad Request")
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'tasks/v1 | BFF | seed-table.ts | POST | catched error: Error - tasks/v1 | BFF | seed-table.ts | POST | not ok response: 400 - Bad Request '
            });
        });

        it('should handle API response not ok (5xx error)', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
            });
            const mockHeaders = { 'x-api-key': 'valid key' };
            (TASKS_API_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("tasks/v1 | BFF | seed-table.ts | POST | not ok response: 500 - Internal Server Error ")
            );
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("tasks/v1 | BFF | seed-table.ts | POST | catched error: Error - tasks/v1 | BFF | seed-table.ts | POST | not ok response: 500 - Internal Server Error ")
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | BFF | seed-table.ts | POST | catched error: Error - tasks/v1 | BFF | seed-table.ts | POST | not ok response: 500 - Internal Server Error "
            });
        });

        it('should handle fetch network error', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
            });
            
            const mockHeaders = { 'x-api-key': 'valid key' };
            (TASKS_API_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
            
            const networkError = new Error('Network error');
            (global.fetch as jest.Mock).mockRejectedValue(networkError);

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                "tasks/v1 | BFF | seed-table.ts | POST | catched error: Error - Network error"
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | BFF | seed-table.ts | POST | catched error: Error - Network error"
            });
        });

        it('should handle TASKS_API_HEADER rejection', async () => {
            // Arrange
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
            });
            const headerError = new Error('Header generation failed');
            (TASKS_API_HEADER as jest.Mock).mockRejectedValue(headerError);

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                'tasks/v1 | BFF | seed-table.ts | POST | catched error: Error - Header generation failed'
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'tasks/v1 | BFF | seed-table.ts | POST | catched error: Error - Header generation failed'
            });
        });

        it('should handle JSON parsing error', async () => {
            // Arrange
            // Create fresh mock request and response objects
            const { req, res } = createMocks({
                method: 'POST',
                credentials: 'include',
            });
            
            const mockHeaders = { 'x-api-key': 'valid key' };
            (TASKS_API_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
            
            const jsonError = new Error('Invalid JSON');
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockRejectedValue(jsonError),
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                'tasks/v1 | BFF | seed-table.ts | POST | catched error: Error - Invalid JSON'
            );
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'tasks/v1 | BFF | seed-table.ts | POST | catched error: Error - Invalid JSON'
            });
        });
    });

    describe('Non-POST methods', () => {
        it.each(['GET', 'PUT', 'DELETE', 'PATCH'] as RequestMethod[])(
            'should return 405 Method Not Allowed for %s method',
            async (method) => {
                // Arrange
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                    method: method,
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
