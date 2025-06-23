import { createMocks, RequestMethod } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import argon2 from 'argon2';
import handler from '../../../../../../pages/api/tasks/v1/bff/user/lookup';
import { createAuthCookie } from '../../../../../../pages/api/tasks/v1/bff/user/register';
import { 
    TASKS_SQL_BASE_API_URL,  
    getJwtSecret, 
    generateJWT, 
    VERIFY_JWT_STRING,
    verifyJwtErrorMsgs,
    TASKS_API_HEADER, 
} from "@/lib/app/common";

// Mock all external dependencies
jest.mock('argon2');
jest.mock('../../../../../../pages/api/tasks/v1/bff/user/register');
jest.mock('../../../../../../src/lib/app/common');

// Mock fetch globally
global.fetch = jest.fn();

describe('/bff/user/lookup', () => {
    // Mock implementations
    const mockArgon2 = argon2 as jest.Mocked<typeof argon2>;
    const mockCreateAuthCookie = createAuthCookie as jest.MockedFunction<typeof createAuthCookie>;
    const mockGetJwtSecret = getJwtSecret as jest.MockedFunction<typeof getJwtSecret>;
    const mockGenerateJWT = generateJWT as jest.MockedFunction<typeof generateJWT>;
    const mockVerifyJWT = VERIFY_JWT_STRING as jest.MockedFunction<typeof VERIFY_JWT_STRING>;
    const mockTasksApiHeader = TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>;
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Setup default mock implementations
        mockTasksApiHeader.mockResolvedValue({ 'Content-Type': 'application/json', 'x-api-key': 'valid key' });
        mockCreateAuthCookie.mockResolvedValue(undefined);
        mockGetJwtSecret.mockResolvedValue({ jwtSecret: 'test-secret' });
        mockGenerateJWT.mockResolvedValue('new-jwt-token');
        
        // Mock console methods to avoid noise in tests
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('POST method', () => {
        describe('Input validation', () => {
            it('should return 400 error when email is missing', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                    method: 'POST',
                });
                
                req.body = { password: 'testpassword' };

                await handler(req, res);

                expect(res._getStatusCode()).toBe(400);
                const jsonData = JSON.parse(res._getData());
                expect(jsonData.error).toBe(true);
                expect(jsonData.message).toContain('Title is required');
            });

            it('should return 400 error when email is empty string', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                    method: 'POST',
                });
                
                req.body = { email: '   ', password: 'testpassword' };

                await handler(req, res);

                expect(res._getStatusCode()).toBe(400);
                const jsonData = JSON.parse(res._getData());
                expect(jsonData.error).toBe(true);
                expect(jsonData.message).toContain('Title is required');
            });

            it('should return 400 error when password is missing', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                    method: 'POST',
                });
                
                req.body = { email: 'test@example.com' };

                await handler(req, res);

                expect(res._getStatusCode()).toBe(400);
                const jsonData = JSON.parse(res._getData());
                expect(jsonData.error).toBe(true);
                expect(jsonData.message).toContain('Password is required');
            });

            it('should return 400 error when password is empty string', async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                    method: 'POST',
                });
                
                req.body = { email: 'test@example.com', password: '   ' };

                await handler(req, res);

                expect(res._getStatusCode()).toBe(400);
                const jsonData = JSON.parse(res._getData());
                expect(jsonData.error).toBe(true);
                expect(jsonData.message).toContain('Password is required');
            });
        });
    });

    describe('User lookup', () => {
        it('should handle user lookup API failure', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
                
            req.body = { email: 'test@example.com', password: 'testpassword' };

            const mockResponse = {
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            };
            mockFetch.mockResolvedValueOnce(mockResponse as Response);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const jsonData = JSON.parse(res._getData());
            expect(jsonData.error).toContain('not ok response: 500 - Internal Server Error');
        });

        it('should handle user not found', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
                
            req.body = { email: 'test@example.com', password: 'testpassword' };

            const mockResponse = {
                ok: true,
                json: async () => ({
                    error: false,
                    message: 'provided email does not exist in the db'
                })
            };
            mockFetch.mockResolvedValueOnce(mockResponse as Response);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const jsonData = JSON.parse(res._getData());
            expect(jsonData.error).toBe(true);
            expect(jsonData.message).toContain('provided email does not exist in the db');
        });
    });

    describe('Password verification', () => {
        it('should return error for wrong password', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
                
            req.body = { email: 'test@example.com', password: 'testpassword' };

            const mockResponse = {
                ok: true,
                json: async () => ({
                    error: false,
                    email: 'test@example.com',
                    password: 'hashed-password',
                    jwt: 'existing-jwt'
                })
            };
            mockFetch.mockResolvedValueOnce(mockResponse as Response);
            mockArgon2.verify.mockResolvedValueOnce(false);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const jsonData = JSON.parse(res._getData());
            expect(jsonData.error).toBe(true);
            expect(jsonData.message).toContain('wrong password');
        });

        it('should proceed with login for correct password', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
                
            req.body = { email: 'test@example.com', password: 'testpassword' };

            const mockResponse = {
                ok: true,
                json: async () => ({
                    error: false,
                    email: 'test@example.com',
                    password: 'hashed-password',
                    jwt: 'existing-jwt'
                })
            };
            mockFetch.mockResolvedValueOnce(mockResponse as Response);
            mockArgon2.verify.mockResolvedValueOnce(true);
            mockVerifyJWT.mockResolvedValueOnce({ valid: true, payload: '' });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const jsonData = JSON.parse(res._getData());
            expect(jsonData.error).toBe(false);
            expect(jsonData.message).toContain('successful login');
            expect(mockCreateAuthCookie).toHaveBeenCalledWith(res, 'existing-jwt');
        });
    });

    describe('JWT verification and renewal', () => {
        beforeEach(() => {
            const mockResponse = {
                ok: true,
                json: async () => ({
                    error: false,
                    email: 'test@example.com',
                    password: 'hashed-password',
                    jwt: 'existing-jwt'
                })
            };
            mockFetch.mockResolvedValueOnce(mockResponse as Response);
            mockArgon2.verify.mockResolvedValueOnce(true);
        });

        it('should use existing JWT when valid', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
            req.body = { email: 'test@example.com', password: 'testpassword' };

            mockVerifyJWT.mockResolvedValueOnce({ valid: true, payload: '' });

            await handler(req, res);

            expect(mockCreateAuthCookie).toHaveBeenCalledWith(res, 'existing-jwt');
            expect(mockGenerateJWT).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(200);
        });

        it('should generate new JWT when current one is expired', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
            req.body = { email: 'test@example.com', password: 'testpassword' };

            mockVerifyJWT.mockResolvedValueOnce({ 
                valid: false, 
                error: verifyJwtErrorMsgs.TokenExpiredError 
            });

            const updateJwtResponse = {
                ok: true,
                json: async () => ({
                    error: false,
                    jwt: 'new-jwt-token'
                })
            };
            mockFetch.mockResolvedValueOnce(updateJwtResponse as Response);

            await handler(req, res);

            expect(mockGenerateJWT).toHaveBeenCalledWith(
                'test@example.com',
                'hashed-password',
                'test-secret'
            );
            expect(mockCreateAuthCookie).toHaveBeenCalledWith(res, 'new-jwt-token');
            expect(res._getStatusCode()).toBe(200);
        });

        it('should handle JWT update API failure', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
            req.body = { email: 'test@example.com', password: 'testpassword' };

            mockVerifyJWT.mockResolvedValueOnce({ 
                valid: false, 
                error: verifyJwtErrorMsgs.TokenExpiredError 
            });

            const updateJwtResponse = {
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            };
            mockFetch.mockResolvedValueOnce(updateJwtResponse as Response);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const jsonData = JSON.parse(res._getData());
            expect(jsonData.error).toContain('not ok response: 500 - Internal Server Error');
        });

        it('should handle error when new JWT is not returned', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
            req.body = { email: 'test@example.com', password: 'testpassword' };

            mockVerifyJWT.mockResolvedValueOnce({ 
                valid: false, 
                error: verifyJwtErrorMsgs.TokenExpiredError 
            });

            const updateJwtResponse = {
                ok: true,
                json: async () => ({
                    error: true,
                    jwt: ''
                })
            };
            mockFetch.mockResolvedValueOnce(updateJwtResponse as Response);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const jsonData = JSON.parse(res._getData());
            expect(jsonData.error).toContain('Error re-creating a new http-only cookie');
        });

        it('should handle JWT verification error that is not token expiration', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
            req.body = { email: 'test@example.com', password: 'testpassword' };

            mockVerifyJWT.mockResolvedValueOnce({ 
                valid: false, 
                error: 'Some other JWT error' 
            });

            await handler(req, res);

            expect(mockCreateAuthCookie).toHaveBeenCalledWith(res, 'existing-jwt');
            expect(mockGenerateJWT).not.toHaveBeenCalled();
            expect(res._getStatusCode()).toBe(200);
        });
    });

    describe('Edge cases', () => {
        it('should handle missing JWT in user lookup response', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });

            req.body = { email: 'test@example.com', password: 'testpassword' };
            
            const mockResponse = {
                ok: true,
                json: async () => ({
                    error: false,
                    email: 'test@example.com',
                    password: 'hashed-password'
                    // jwt is missing
                })
            };
            mockFetch.mockResolvedValueOnce(mockResponse as Response);

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const jsonData = JSON.parse(res._getData());
            expect(jsonData.error).toBe(true);
            expect(jsonData.message).toContain('jwt is undefined');
        });

        it('should handle network errors', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
            req.body = { email: 'test@example.com', password: 'testpassword' };

            
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const jsonData = JSON.parse(res._getData());
            expect(jsonData.error).toContain('Network error');
        });

        it('should use override fetch URL when provided', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST',
            });
            req.body = { email: 'test@example.com', password: 'testpassword' };

            
            const mockResponse = {
                ok: true,
                json: async () => ({
                    error: false,
                    email: 'test@example.com',
                    password: 'hashed-password',
                    jwt: 'existing-jwt'
                })
            };
            mockFetch.mockResolvedValueOnce(mockResponse as Response);
            mockArgon2.verify.mockResolvedValueOnce(true);
            mockVerifyJWT.mockResolvedValueOnce({ valid: true, payload: '' });

            await handler(req, res, 'https://override-url.com');

            expect(mockFetch).toHaveBeenCalledWith(
                'https://override-url.com/user/lookup',
                expect.any(Object)
            );
        });
    });

    describe('Unsupported HTTP methods', () => {
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
});    