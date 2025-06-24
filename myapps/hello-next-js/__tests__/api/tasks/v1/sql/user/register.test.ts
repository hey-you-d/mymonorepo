import { createMocks, RequestMethod } from 'node-mocks-http';
import handler from '../../../../../../pages/api/tasks/v1/sql/user/register';
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

describe('Tasks Users API handler - register.ts', () => {
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
                password: 'hashedpassword123',
                jwt: 'jwt.token.here'
                },
            });

            (CHECK_API_KEY as jest.Mock).mockResolvedValue(false);

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(401);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/register.ts | handler | Unauthorized access: invalid API key",
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

    describe('POST Method - Validation', () => {
        beforeEach(() => {
            (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);
        });

        it('should return 400 when email is missing', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    // missing email
                    password: 'hashedpassword123',
                    jwt: 'jwt.token.here'
                },
            });

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/register.ts | POST | Title is required",
            });
            expect(db.query).not.toHaveBeenCalled();
        });
        
        it('should return 400 when email is empty string', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                email: '', // empty string
                password: 'hashedpassword123',
                jwt: 'jwt.token.here'
                },
            });

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/register.ts | POST | Title is required",
            });
        });

        it('should return 400 when password is missing', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    // missing password
                    jwt: 'jwt.token.here'
                },
            });

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/register.ts | POST | Hashed Password is required",
            });
        });

        it('should return 400 when password is empty string', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: '', // empty string
                    jwt: 'jwt.token.here'
                },
            });

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/register.ts | POST | Hashed Password is required",
            });
        });

        it('should return 400 when jwt is missing', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: 'hashedpassword123'
                    // missing jwt
                },
            });

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/register.ts | POST | JWT is required",
            });
        });

        it('should return 400 when jwt is empty string', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: 'hashedpassword123',
                    jwt: '' // empty string
                },
            });

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/register.ts | POST | JWT is required",
            });
        });
    });

    describe('POST Method - Database Operations', () => {
        beforeEach(() => {
            (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);
        });

        it('should successfully register a user', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: 'hashedpassword123',
                    jwt: 'jwt.token.here'
                },
            });

            const mockDbResult = {
                rows: [{
                    email: 'test@example.com',
                    hashed_pwd: 'hashedpassword123',
                    jwt: 'jwt.token.here',
                    admin_access: false
                }]
            };

            (db.query as jest.Mock).mockResolvedValue(mockDbResult);

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO users'),
                ['test@example.com', 'hashedpassword123', 'basic_auth', false, 'jwt.token.here']
            );
            expect(res._getStatusCode()).toBe(201);
            expect(JSON.parse(res._getData())).toEqual({
                email: 'test@example.com',
                password: 'hashedpassword123',
                jwt: 'jwt.token.here',
                admin: false,
                error: false,
                message: "successful user registration"
            });
        });

        it('should handle case when database returns empty rows', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: 'hashedpassword123',
                    jwt: 'jwt.token.here'
                },
            });

            (db.query as jest.Mock).mockResolvedValue({ rows: [] });

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(201);
            expect(JSON.parse(res._getData())).toEqual({
                error: true,
                message: "failed user registration on the DB level"
            });
        });

        it('should handle database errors', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                email: 'test@example.com',
                password: 'hashedpassword123',
                jwt: 'jwt.token.here'
                },
            });

            const dbError = new Error('Database connection failed');
            (db.query as jest.Mock).mockRejectedValue(dbError);

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(console.error).toHaveBeenCalledWith("tasks/v1 | API | user/register.ts | POST | catched error: Error - Database connection failed");
            
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: "tasks/v1 | API | user/register.ts | POST | catched error: Error - Database connection failed"
            });
        });

        it('should register user with admin access when returned from database', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                email: 'admin@example.com',
                password: 'hashedpassword123',
                jwt: 'jwt.token.here'
                },
            });

            const mockDbResult = {
                rows: [{
                email: 'admin@example.com',
                hashed_pwd: 'hashedpassword123',
                jwt: 'jwt.token.here',
                admin_access: true
                }]
            };

            (db.query as jest.Mock).mockResolvedValue(mockDbResult);

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(res._getStatusCode()).toBe(201);
            expect(JSON.parse(res._getData())).toEqual({
                email: 'admin@example.com',
                password: 'hashedpassword123',
                jwt: 'jwt.token.here',
                admin: true,
                error: false,
                message: "successful user registration"
            });
        });
    });

    describe('Integration Tests', () => {
        it('should handle the complete flow from authorization to successful registration', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    email: 'integration@example.com',
                    password: 'hashedpassword456',
                    jwt: 'integration.jwt.token'
                },
            });

            (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);
            
            (db.query as jest.Mock).mockResolvedValue({
                rows: [{
                    email: 'integration@example.com',
                    hashed_pwd: 'hashedpassword456',
                    jwt: 'integration.jwt.token',
                    admin_access: false
                }]
            });

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(CHECK_API_KEY).toHaveBeenCalledWith(req, res);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO users'),
                ['integration@example.com', 'hashedpassword456', 'basic_auth', false, 'integration.jwt.token']
            );
            expect(res._getStatusCode()).toBe(201);
        });

        it('should handle the complete flow from authorization failure', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: 'hashedpassword123',
                    jwt: 'jwt.token.here'
                },
            });

            (CHECK_API_KEY as jest.Mock).mockResolvedValue(false);

            await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

            expect(CHECK_API_KEY).toHaveBeenCalledWith(req, res);
            expect(db.query).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(401);
        });
    });

    it('should handle null/undefined response from database  (e.g connection issue)', async () => {
        // Arrange
        (db.query as jest.Mock).mockResolvedValue(null);

        (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);

        const { req, res } = createMocks({
            method: 'POST',
            body: {
                email: 'test@example.com',
                password: 'hashedpassword123',
                jwt: 'jwt.token.here'
            },
        });

        // act
        await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

        // Assert
        expect(res._getStatusCode()).toBe(500);
        expect(JSON.parse(res._getData())).toEqual({
            error: "tasks/v1 | API | user/register.ts | POST | null/undefined result"
        });
    });
});
