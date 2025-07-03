import { createMocks, RequestMethod } from 'node-mocks-http';
import handler from '../../../../../../pages/api/tasks/v1/sql/user/lookup';
import { db } from '@/lib/db/db_postgreSQL';
import { NextApiRequest, NextApiResponse } from 'next';
import { CHECK_API_KEY } from '@/lib/app/common';

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
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('Tasks Users API handler - lookup.ts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    afterEach(() => {
        consoleErrorSpy.mockClear();
        consoleLogSpy.mockClear();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('Authorization', () => {
        it('should return 401 when API key is invalid', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                },
            });

            (CHECK_API_KEY as jest.Mock).mockResolvedValue(false);

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(401);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/lookup.ts | handler | Unauthorized access: invalid API key",
            });
            expect(db.query).not.toHaveBeenCalled();
        });
    });

    describe('HTTP Methods', () => {
        beforeEach(() => {
            (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);
        });

        it('should return 405 for GET method', async () => {
            const { req, res } = createMocks({
                method: 'GET',
            });

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(405);
            expect(res._getHeaders()).toEqual(expect.objectContaining({
                allow: ['POST']
            }));
            expect(res._getData()).toBe('Method GET Not Allowed');
        });

        it.each(['GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] as RequestMethod[])(
            'should return 405 Method Not Allowed for %s requests',
            async (method) => {
                // Arrange
                const { req, res } = createMocks({ method });

                // Act
                await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

                // Assert
                expect(res._getStatusCode()).toBe(405);
                expect(res._getHeaders()).toEqual(expect.objectContaining({
                    allow: ['POST']
                }));
                expect(res._getData()).toBe(`Method ${method} Not Allowed`);
            }
        );
    });

    describe('POST method', () => {
        beforeEach(() => {
            (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);
        });
    
        it('should return user data when email exists in database', async () => {
            // Arrange
            const mockUser = {
                email: 'test@example.com',
                hashed_pwd: 'hashed_password_123',
                jwt: 'jwt_token_123',
                admin_access: true,
            };

            (db.query as jest.Mock).mockResolvedValue({
                rows: [mockUser],
            });

            const { req, res } = createMocks({
                method: 'POST',
                body: { email: 'test@example.com' },
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(res._getStatusCode()).toBe(201);
            expect(JSON.parse(res._getData())).toEqual({
                email: 'test@example.com',
                password: 'hashed_password_123',
                jwt: 'jwt_token_123',
                admin: true,
                error: false,
                message: "successful email lookup"
            });
            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE email = $1", ["test@example.com"]
            );
        });

        it('should return error when email does not exist in database', async () => {
            // Arrange
            (db.query as jest.Mock).mockResolvedValue({
                rows: [],
            });

            const { req, res } = createMocks({
                method: 'POST',
                body: { email: 'nonexistent@example.com' },
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(res._getStatusCode()).toBe(201);
            expect(JSON.parse(res._getData())).toEqual({
                error: true,
                message: "provided email does not exist in the db"
            });
            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE email = $1", ["nonexistent@example.com"]
            );
        });

        it('should return error when user email does not match requested email', async () => {
            // Arrange - simulate edge case where query returns user with different email
            const mockUser = {
                email: 'different@example.com',
                hashed_pwd: 'hashed_password_123',
                jwt: 'jwt_token_123',
                admin_access: false,
            };

            (db.query as jest.Mock).mockResolvedValue({
                rows: [mockUser],
            });

            const { req, res } = createMocks({
                method: 'POST',
                body: { email: 'requested@example.com' },
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(res._getStatusCode()).toBe(201);
            expect(JSON.parse(res._getData())).toEqual({
                error: true,
                message: "provided email does not exist in the db"
            });
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            (db.query as jest.Mock).mockRejectedValue(dbError);

            const { req, res } = createMocks({
                method: 'POST',
                body: { email: 'test@example.com' },
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/lookup.ts | POST | catched error: Error - Database connection failed",
            });
        });

        it('should handle missing email in request body', async () => {
            // Arrange
            (db.query as jest.Mock).mockResolvedValue({
                rows: [],
            });

            const { req, res } = createMocks({
                method: 'POST',
                body: {}, // No email provided
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(res._getStatusCode()).toBe(201);
            expect(JSON.parse(res._getData())).toEqual({
                error: true,
                message: "provided email does not exist in the db"
            });
            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE email = $1", [undefined]
            );
        });
    });
    
    describe('Edge Cases', () => {
        beforeEach(() => {
            (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);
        });

        it('should handle null/undefined response from database  (e.g connection issue)', async () => {
            // Arrange
            (db.query as jest.Mock).mockResolvedValue(null);

            const { req, res } = createMocks({
                method: 'POST',
                body: { email: 'test@example.com' },
            });

            // act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/lookup.ts | POST | catched error: TypeError - Cannot read properties of null (reading 'rows')",
            });
        });

        it('should handle special characters in email', async () => {
            // Arrange
            const emailWithSpecialChars = "test+tag@example.com";
            (db.query as jest.Mock).mockResolvedValue({
                rows: [],
            });

            const { req, res } = createMocks({
                method: 'POST',
                body: { email: emailWithSpecialChars },
            });

            // Act
            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            // Assert
            expect(res._getStatusCode()).toBe(201);
            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE email = $1", ["test+tag@example.com"]
            );
        });
    });    
});    