import { createMocks, RequestMethod } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../../../../pages/api/tasks/v1/sql/user/update-jwt';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';
import { customResponseMessage, missingParamErrorMessage, catchedErrorMessage } from '@/lib/app/error';

// Mock dependencies
jest.mock('../../../../../../src/lib/db/db_postgreSQL', () => ({
  db: {
    query: jest.fn(),
  },
}));
jest.mock('../../../../../../src/lib/app/common', () => ({
  CHECK_API_KEY: jest.fn(),
}));
jest.mock('../../../../../../src/lib/app/error');

const mockCustomResponseMessage = customResponseMessage as jest.MockedFunction<typeof customResponseMessage>;
const mockMissingParamErrorMessage = missingParamErrorMessage as jest.MockedFunction<typeof missingParamErrorMessage>;
const mockCatchedErrorMessage = catchedErrorMessage as jest.MockedFunction<typeof catchedErrorMessage>;

describe('Tasks Users API handler - update-jwt.ts', () => {
    let req: NextApiRequest;
    let res: NextApiResponse;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Default mock implementations
        mockCustomResponseMessage.mockResolvedValue('Custom error message');
        mockMissingParamErrorMessage.mockResolvedValue('Missing parameter error');
        mockCatchedErrorMessage.mockResolvedValue('Caught error message');
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('Authorization', () => {
        it('should return 401 when API key is invalid', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>(); 
            req.method = 'PATCH';

            (CHECK_API_KEY as jest.Mock).mockResolvedValue(false);

            await handler(req, res);

            expect(CHECK_API_KEY).toHaveBeenCalledWith(req, res);
            expect(res._getStatusCode()).toBe(401);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'Custom error message'
            });
            expect(mockCustomResponseMessage).toHaveBeenCalledWith(
                'tasks/v1 | API | user/update-jwt.ts',
                'handler',
                'Unauthorized access: invalid API key'
            );
        });

        it('should proceed when API key is valid', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
            req.method = 'PATCH';
            req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };
            
            (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);
            (db.query as jest.Mock).mockResolvedValue({
                rows: [{
                    email: 'test@example.com',
                    jwt: 'jwt.token.here',
                }]
            });

            await handler(req, res);

            expect(CHECK_API_KEY).toHaveBeenCalledWith(req, res);
            expect(res.statusCode).toBe(201);
        });
    });

    describe('PATCH method', () => {
        beforeEach(() => {
            (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);
        });

        describe('Input validation', () => {
            it('should return 400 when email is missing', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { jwt: 'valid-jwt-token' };

                await handler(req, res);

                expect(res._getStatusCode()).toBe(400);
                expect(res._getJSONData()).toEqual({
                    error: 'Missing parameter error'
                });
                expect(mockMissingParamErrorMessage).toHaveBeenCalledWith(
                    'tasks/v1 | API | user/update-jwt.ts',
                    'PATCH',
                    'Email is required'
                );
            });

            it('should return 400 when email is empty string', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: '', jwt: 'valid-jwt-token' };

                await handler(req, res);

                expect(res._getStatusCode()).toBe(400);
                expect(res._getJSONData()).toEqual({
                    error: 'Missing parameter error'
                });
            });

            it('should return 400 when jwt is missing', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com' };

                await handler(req, res);

                expect(res._getStatusCode()).toBe(400);
                expect(res._getJSONData()).toEqual({
                    error: 'Missing parameter error'
                });
                expect(mockMissingParamErrorMessage).toHaveBeenCalledWith(
                    'tasks/v1 | API | user/update-jwt.ts',
                    'PATCH',
                    'JWT is required'
                );
            });

            it('should return 400 when jwt is empty string', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: '' };

                await handler(req, res);

                expect(res._getStatusCode()).toBe(400);
                expect(res._getJSONData()).toEqual({
                    error: 'Missing parameter error'
                });
            });

            it('should return 400 when both email and jwt are missing', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = {};

                await handler(req, res);

                expect(res._getStatusCode()).toBe(400);
                expect(res._getJSONData()).toEqual({
                    error: 'Missing parameter error'
                });
            });
        });
        
        describe('Database operations', () => {
            it('should successfully update JWT when user exists', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };

                const mockResult = {
                    rows: [{
                        email: 'test@example.com',
                        jwt: 'valid-jwt-token'
                    }]
                };
                (db.query as jest.Mock).mockResolvedValue(mockResult);

                await handler(req, res);

                expect(db.query).toHaveBeenCalledWith(
                    'UPDATE users SET jwt = $2 WHERE email = $1 RETURNING *',
                    ['test@example.com', 'valid-jwt-token']
                );
                expect(res._getStatusCode()).toBe(201);
                expect(res._getJSONData()).toEqual({
                    email: 'test@example.com',
                    jwt: 'valid-jwt-token',
                    error: false,
                    message: 'JWT update operation is succesful'
                });
            });

            it('should return error payload when user is not found', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };

                const mockResult = { rows: [] };
                (db.query as jest.Mock).mockResolvedValue(mockResult);

                await handler(req, res);

                expect(res._getStatusCode()).toBe(201);
                expect(res._getJSONData()).toEqual({
                    error: true,
                    message: 'failed updating JWT on the DB level'
                });
            });

            it('should return error payload when email does not match', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };

                const mockResult = {
                    rows: [{
                        email: 'different@example.com',
                        jwt: 'valid-jwt-token'
                    }]
                };
                (db.query as jest.Mock).mockResolvedValue(mockResult);

                await handler(req, res);

                expect(res._getStatusCode()).toBe(201);
                expect(res._getJSONData()).toEqual({
                    error: true,
                    message: 'failed updating JWT on the DB level'
                });
            });

            it('should handle null result from database', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };

                (db.query as jest.Mock).mockResolvedValue({ rows: null as any});

                await handler(req, res);

                expect(res._getStatusCode()).toBe(500);
                expect(res._getJSONData()).toStrictEqual("Custom error message");
                expect(mockCustomResponseMessage).toHaveBeenCalledWith(
                    "tasks/v1 | API | user/update-jwt.ts", "PATCH", "null/undefined result"
                );
            });

            it('should handle undefined result from database', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };

                (db.query as jest.Mock).mockResolvedValue(undefined as any);

                await handler(req, res);

                expect(res._getStatusCode()).toBe(500);
                expect(res._getJSONData()).toStrictEqual({error: "Caught error message"});
            });

            it('should handle result with null rows', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };

                (db.query as jest.Mock).mockResolvedValue({ rows: null } as any);

                await handler(req, res);

                expect(res._getStatusCode()).toBe(500);
                expect(res._getJSONData()).toBe('Custom error message');
            });

            it('should handle result with undefined rows', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };

                (db.query as jest.Mock).mockResolvedValue({ rows: undefined } as any);

                await handler(req, res);

                expect(res._getStatusCode()).toBe(500);
                expect(res._getJSONData()).toBe('Custom error message');
            });
        });

        describe('Error handling', () => {
            it('should handle database connection errors', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };

                const dbError = new Error('Database connection failed');
                (db.query as jest.Mock).mockRejectedValue(dbError);

                await handler(req, res);

                expect(res._getStatusCode()).toBe(500);
                expect(res._getJSONData()).toEqual({
                    error: 'Caught error message'
                });
                expect(mockCatchedErrorMessage).toHaveBeenCalledWith(
                    'tasks/v1 | API | user/update-jwt.ts',
                    'PATCH',
                    dbError
                );
            });

            it('should handle database query errors', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };

                const queryError = new Error('Invalid SQL query');
                (db.query as jest.Mock).mockRejectedValue(queryError);

                await handler(req, res);

                expect(res._getStatusCode()).toBe(500);
                expect(res._getJSONData()).toEqual({
                error: 'Caught error message'
                });
            });

            it('should handle unexpected errors', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };

                const unexpectedError = new Error('Unexpected error occurred');
                (db.query as jest.Mock).mockRejectedValue(unexpectedError);

                await handler(req, res);

                expect(res._getStatusCode()).toBe(500);
                expect(res._getJSONData()).toEqual({
                error: 'Caught error message'
                });
            });
        });

        describe('Edge cases', () => {
            beforeEach(() => {
                (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);
            });
            
            it('should handle special characters in email', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test+tag@example.com', jwt: 'valid-jwt-token' };
                
                (db.query as jest.Mock).mockResolvedValue({
                    rows: [{
                    email: 'test+tag@example.com',
                    jwt: 'valid-jwt-token'
                    }]
                });

                await handler(req, res);

                expect(db.query).toHaveBeenCalledWith(
                    'UPDATE users SET jwt = $2 WHERE email = $1 RETURNING *',
                    ['test+tag@example.com', 'valid-jwt-token']
                );
                expect(res._getStatusCode()).toBe(201);
            });

            it('should handle very long JWT tokens', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                const longJwt = 'a'.repeat(1000);
                req.body = { email: 'test@example.com', jwt: longJwt };
                
                (db.query as jest.Mock).mockResolvedValue({
                    rows: [{
                    email: 'test@example.com',
                    jwt: longJwt
                    }]
                });

                await handler(req, res);

                expect(db.query).toHaveBeenCalledWith(
                    'UPDATE users SET jwt = $2 WHERE email = $1 RETURNING *',
                    ['test@example.com', longJwt]
                );
                expect(res._getStatusCode()).toBe(201);
            });

            it('should handle multiple rows returned (edge case)', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
                req.method = 'PATCH';
                req.body = { email: 'test@example.com', jwt: 'valid-jwt-token' };
                
                (db.query as jest.Mock).mockResolvedValue({
                    rows: [
                    { email: 'test@example.com', jwt: 'valid-jwt-token' },
                    { email: 'test@example.com', jwt: 'valid-jwt-token' }
                    ]
                });

                await handler(req, res);

                expect(res._getStatusCode()).toBe(201);
                expect(res._getJSONData()).toEqual({
                    email: 'test@example.com',
                    jwt: 'valid-jwt-token',
                    error: false,
                    message: 'JWT update operation is succesful'
                });
            });
        });

        describe('HTTP Methods', () => {
            it.each(['GET', 'PUT', 'DELETE', 'POST', 'OPTIONS'] as RequestMethod[])(
                'should return 405 Method Not Allowed for %s requests',
                async (method) => {
                    // Arrange
                    (CHECK_API_KEY as jest.Mock).mockResolvedValue(true);
                    const { req, res } = createMocks({ method });

                    // Act
                    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

                    // Assert
                    expect(res._getStatusCode()).toBe(405);
                    expect(res._getHeaders()).toEqual(expect.objectContaining({
                        allow: ['PATCH']
                    }));
                    expect(res._getData()).toBe(`Method ${method} Not Allowed`);
                }
            );
    });
    });
});