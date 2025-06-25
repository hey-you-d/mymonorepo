
// Mock dependencies
jest.mock('argon2');
jest.mock('jsonwebtoken');
jest.mock('cookie');

jest.mock('../../../../../../src/lib/app/common', () => ({
  JWT_TOKEN_COOKIE_NAME: 'test-jwt-token',
  TASKS_SQL_BASE_API_URL: 'http://localhost:3000/api',
  TASKS_API_HEADER: jest.fn(),
  getJwtSecret: jest.fn(),
  generateJWT: jest.fn(),
}));

jest.mock('../../../../../../src/lib/app/featureFlags', () => ({
  APP_ENV: 'TEST',
  LIVE_SITE_MODE: {
    cookie: {
      path: '/live',
      secure: true,
    },
    base: '',
  },
  LOCALHOST_MODE: {
    cookie: {
      path: '/local',
      secure: false,
    },
    base: '',
  }
}));

// Mock fetch globally
global.fetch = jest.fn();

import { createMocks, RequestMethod } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import handler, { createAuthCookie, generateHashedPassword } from '../../../../../../pages/api/tasks/v1/bff/user/register';
import { 
    JWT_TOKEN_COOKIE_NAME, 
    TASKS_SQL_BASE_API_URL, 
    TASKS_API_HEADER, 
    getJwtSecret,
    generateJWT,
} from '@/lib/app/common';
import { APP_ENV, LOCALHOST_MODE, LIVE_SITE_MODE } from '@/lib/app/featureFlags';

const mockedArgon2 = argon2 as jest.Mocked<typeof argon2>;
const mockedSign = sign as jest.MockedFunction<typeof String>;
const mockedSerialize = serialize as jest.MockedFunction<typeof serialize>;
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('/bff/user/register', () => {
    beforeAll(() => {
        jest.resetModules(); // clear cached modules to allow mocking
    });
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default mock implementations
        (TASKS_API_HEADER as jest.Mock).mockResolvedValue({
            'Content-Type': 'application/json',
            'x-api-key': 'valid key',
            'Authorization': 'Bearer test-token'
        });
        
        (getJwtSecret as jest.Mock).mockResolvedValue({ jwtSecret: 'test-secret' });     
        
        (generateJWT as jest.Mock).mockResolvedValue("jwt-token-123");
        
        // Mock console methods to avoid noise in test output
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST request', () => {
        it('should successfully register a new user', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: 'password123'
                }
            });

            const hashedPassword = 'hashed-password-123';
            const jwtToken = 'jwt-token-123';
            const cookieString = 'auth-token=jwt-token-123; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600';

            // Mock user lookup (user doesn't exist)
            mockedFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ error: true, message: 'User not found' })
                } as Response)
                // Mock user registration success
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        error: false,
                        email: 'test@example.com',
                        jwt: jwtToken
                    })
                } as Response);

            mockedArgon2.hash.mockResolvedValue(hashedPassword);
            mockedSign.mockReturnValue(jwtToken);
            mockedSerialize.mockReturnValue(cookieString);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                error: false,
                message: expect.stringContaining('successful user registration')
            });
            expect(res._getHeaders()['set-cookie']).toBe(cookieString);
        });

        it('should return 400 if email is missing', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    password: 'password123'
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: true,
                message: expect.stringContaining('Email is required')
            });
        });

        it('should return 400 if email is empty string', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    email: '   ',
                    password: 'password123'
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: true,
                message: expect.stringContaining('Email is required')
            });
        });

        it('should return 400 if password is missing', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    email: 'test@example.com'
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: true,
                message: expect.stringContaining('Password is required')
            });
        });

        it('should return error if email already exists', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    email: 'existing@example.com',
                    password: 'password123'
                }
            });

            // Mock user lookup (user exists)
            mockedFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    error: false,
                    email: 'existing@example.com',
                    password: 'existing-hash',
                    jwt: 'existing-jwt'
                })
            } as Response);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                error: true,
                message: expect.stringContaining('Email address cannot be used for registration')
            });
        });

        it('should handle user lookup API error', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: 'password123'
                }
            });

            // Mock user lookup failure
            mockedFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            } as Response);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: expect.stringContaining('not ok response: 500')
            });
        });

        it('should handle user registration API error', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: 'password123'
                }
            });

            const hashedPassword = 'hashed-password-123';
            const jwtToken = 'jwt-token-123';

            // Mock user lookup (user doesn't exist)
            mockedFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ error: true, message: 'User not found' })
                } as Response)
                // Mock user registration failure
                .mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    statusText: 'Registration Failed'
                } as Response);

            mockedArgon2.hash.mockResolvedValue(hashedPassword);
            mockedSign.mockReturnValue(jwtToken);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: expect.stringContaining('not ok response: 500')
            });
        });

        it('should handle JWT mismatch error', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: 'password123'
                }
            });

            const hashedPassword = 'hashed-password-123';
            const jwtToken = 'jwt-token-123';
            const differentJwtToken = 'different-jwt-token';

            // Mock user lookup (user doesn't exist)
            mockedFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ error: true, message: 'User not found' })
                } as Response)
                // Mock user registration with different JWT
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        error: false,
                        email: 'test@example.com',
                        jwt: differentJwtToken
                    })
                } as Response);

            mockedArgon2.hash.mockResolvedValue(hashedPassword);
            mockedSign.mockReturnValue(jwtToken);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: true,
                message: expect.stringContaining('JWT is undefined')
            });
        });

        it('should use override fetch URL when provided', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
                body: {
                    email: 'test@example.com',
                    password: 'password123'
                }
            });

            const overrideUrl = 'https://api.example.com';
            const hashedPassword = 'hashed-password-123';
            const jwtToken = 'jwt-token-123';

            // Mock user lookup (user doesn't exist)
            mockedFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ error: true, message: 'User not found' })
                } as Response)
                // Mock user registration success
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        error: false,
                        email: 'test@example.com',
                        jwt: jwtToken
                    })
                } as Response);

            mockedArgon2.hash.mockResolvedValue(hashedPassword);
            mockedSign.mockReturnValue(jwtToken);
            mockedSerialize.mockReturnValue('cookie-string');

            await handler(req, res, overrideUrl);

            expect(mockedFetch).toHaveBeenCalledWith(
                `${overrideUrl}/user/lookup`,
                expect.any(Object)
            );
            expect(mockedFetch).toHaveBeenCalledWith(
                `${overrideUrl}/user/register`,
                expect.any(Object)
            );
        });
    });

    describe('Non-POST methods', () => {
        it.each(['PUT', 'DELETE', 'GET', 'PATCH'] as RequestMethod[])(
            'should return 405 Method Not Allowed for %s requests',
            async (method) => {
                // Arrange
                const { req, res } = createMocks({ method });

                // Act
                await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

                // Assert
                expect(res._getStatusCode()).toBe(405);
                expect(res._getHeaders()).toEqual({ allow: ['POST'] });
                expect(res._getData()).toBe(`Method ${method} Not Allowed`);
            }
        );
    });

    describe('helper functions', () => {
        describe('createAuthCookie', () => {
            it('should create secure cookie for LIVE environment', async () => {
                // Temporarily override the mocked APP_ENV
                jest.resetModules();
                jest.doMock('../../../../../../src/lib/app/featureFlags', () => ({
                    APP_ENV: 'LIVE',
                    LIVE_SITE_MODE: {
                        cookie: {
                        path: '/live',
                        secure: true,
                        },
                        base: '',
                    },
                    LOCALHOST_MODE: {
                        cookie: {
                        path: '/local',
                        secure: false,
                        },
                        base: '',
                    }
                }));
                // Re-mock other dependencies after resetModules
                jest.doMock('cookie', () => ({
                    serialize: mockedSerialize
                }));

                // Re-import the function to get the new mock
                const { createAuthCookie: testCreateAuthCookie } = await import('../../../../../../pages/api/tasks/v1/bff/user/register');
                
                const { res } = createMocks<NextApiRequest, NextApiResponse>();
                const jwt = 'test-jwt-token';
                const cookieString = 'secure-cookie-string';

                mockedSerialize.mockReturnValue(cookieString);

                await testCreateAuthCookie(res, jwt);

                expect(mockedSerialize).toHaveBeenCalledWith(
                    'test-jwt-token',
                    jwt,
                    {
                        httpOnly: true,
                        secure: true,
                        path: '/live',
                        sameSite: 'strict',
                        maxAge: 3600
                    }
                );
                expect(res._getHeaders()['set-cookie']).toBe(cookieString);
                
                // Reset
                jest.dontMock('../../../../../../src/lib/app/featureFlags');
            });

            it('should create non-secure cookie for non-LIVE environment', async () => {
                const { res } = createMocks<NextApiRequest, NextApiResponse>();
                const jwt = 'test-jwt-token';
                const cookieString = 'non-secure-cookie-string';

                mockedSerialize.mockReturnValue(cookieString);

                await createAuthCookie(res, jwt);

                expect(mockedSerialize).toHaveBeenCalledWith(
                    'test-jwt-token',
                    jwt,
                    {
                        httpOnly: true,
                        secure: false,
                        path: '/local',
                        sameSite: 'strict',
                        maxAge: 3600
                    }
                );
            });
        });

        describe('generateHashedPassword', () => {
            it('should generate hashed password with correct options', async () => {
                const password = 'testpassword123';
                const hashedPassword = 'hashed-result';

                mockedArgon2.hash.mockResolvedValue(hashedPassword);

                const result = await generateHashedPassword(password);

                expect(mockedArgon2.hash).toHaveBeenCalledWith(password, {
                    type: argon2.argon2id,
                    memoryCost: 2 ** 16,
                    timeCost: 5,
                    parallelism: 1
                });
                expect(result).toBe(hashedPassword);
            });
        });
    });
});