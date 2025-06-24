import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../../../pages/api/tasks/v1/bff/user/httpcookie';
import * as cookie from 'cookie';

// Mock the dependencies
jest.mock('../../../../../../src/lib/app/common', () => ({
  JWT_TOKEN_COOKIE_NAME: 'jwt_token',
  VERIFY_JWT_STRING: jest.fn(),
  verifyJwtErrorMsgs: {
    TokenExpiredError: 'TokenExpiredError'
  }
}));

jest.mock('../../../../../../src/lib/app/featureFlags', () => ({
  APP_ENV: 'LOCALHOST',
  LIVE_SITE_MODE: {
    cookie: {
      path: '/',
      secure: true
    }
  },
  LOCALHOST_MODE: {
    cookie: {
      path: '/',
      secure: false
    }
  }
}));

// Import mocked functions
import { VERIFY_JWT_STRING, verifyJwtErrorMsgs } from '@/lib/app/common';
import { APP_ENV, LIVE_SITE_MODE, LOCALHOST_MODE } from '@/lib/app/featureFlags';

const mockVerifyJwtString = VERIFY_JWT_STRING as jest.MockedFunction<typeof VERIFY_JWT_STRING>;

// Mock console methods to avoid noise in tests
const consoleSpy = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation()
};

describe('/bff/user/httpcookie', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy.log.mockClear();
        consoleSpy.error.mockClear();
    });

    afterAll(() => {
        consoleSpy.log.mockRestore();
        consoleSpy.error.mockRestore();
    });

    describe('GET method', () => {
        it('should return false when no cookies are present', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                headers: {}
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                outcome: false,
                message: expect.stringContaining('No cookies received in req.headers.cookie')
            });
        });

        it('should return false when cookie header is empty', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                headers: { cookie: '' }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                outcome: false,
                message: expect.stringContaining('No cookies received in req.headers.cookie')
            });
        });

        it('should return true when token is valid', async () => {
            const mockPayload = { userId: '123', exp: Date.now() + 3600000 };
            mockVerifyJwtString.mockResolvedValueOnce({
                valid: true,
                payload: mockPayload,
            });

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                headers: { cookie: 'jwt_token=valid.jwt.token' }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                outcome: true,
                message: mockPayload
            });
            expect(mockVerifyJwtString).toHaveBeenCalledWith('valid.jwt.token');
        });

        it('should return false when token is invalid (not expired)', async () => {
            mockVerifyJwtString.mockResolvedValueOnce({
                valid: false,
                error: 'Invalid signature'
            });

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                headers: { cookie: 'jwt_token=invalid.jwt.token' }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                outcome: false,
                message: 'Invalid signature'
            });
            expect(mockVerifyJwtString).toHaveBeenCalledWith('invalid.jwt.token');
        });

        it('should invalidate cookie and return false when token is expired', async () => {
            mockVerifyJwtString.mockResolvedValueOnce({
                valid: false,
                error: verifyJwtErrorMsgs.TokenExpiredError
            });

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                headers: { cookie: 'jwt_token=expired.jwt.token' }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                outcome: false,
                message: verifyJwtErrorMsgs.TokenExpiredError
            });

            // Check that cookie was invalidated
            const setCookieHeaders = res._getHeaders()['set-cookie'];
            expect(setCookieHeaders).toBeDefined();
            
            // Parse the set-cookie header
            const cookieHeader = Array.isArray(setCookieHeaders) ? setCookieHeaders[0] : setCookieHeaders;
            expect(cookieHeader).toContain('jwt_token=;');
            expect(cookieHeader).toContain('Max-Age=0');
            expect(cookieHeader).toContain('HttpOnly');
            expect(cookieHeader).toContain('SameSite=Strict');
        });
    });

    it('should use LIVE environment cookie settings when APP_ENV is LIVE', async () => {
        // Mock APP_ENV to be LIVE
        const originalAppEnv = require('../../../../../../src/lib/app/featureFlags').APP_ENV;
        require('../../../../../../src/lib/app/featureFlags').APP_ENV = 'LIVE';

        mockVerifyJwtString.mockResolvedValueOnce({
            valid: false,
            error: verifyJwtErrorMsgs.TokenExpiredError
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            headers: {
            cookie: 'jwt_token=expired.jwt.token'
            }
        });

        await handler(req, res);

        const setCookieHeaders = res._getHeaders()['set-cookie'];
        const cookieHeader = Array.isArray(setCookieHeaders) ? setCookieHeaders[0] : setCookieHeaders;
        
        // In LIVE mode, secure should be true
        expect(cookieHeader).toContain('Secure');

        // Restore original APP_ENV
        require('../../../../../../src/lib/app/featureFlags').APP_ENV = originalAppEnv;
    });

    it('should handle empty token value', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            headers: {
            cookie: 'jwt_token=; other_cookie=value'
            }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(JSON.parse(res._getData())).toEqual({
            outcome: false,
            message: expect.stringContaining('Error: unknown server error')
        });
    });

    it('should handle token with only whitespace', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            headers: { cookie: 'jwt_token=   ; other_cookie=value' }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(JSON.parse(res._getData())).toEqual({
            outcome: false,
            message: expect.stringContaining('Error: unknown server error')
        });
    });

    it('should handle VERIFY_JWT_STRING throwing an error', async () => {
        mockVerifyJwtString.mockRejectedValueOnce(new Error('JWT verification failed'));

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            headers: {
            cookie: 'jwt_token=some.jwt.token'
            }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(JSON.parse(res._getData())).toEqual({
            error: expect.stringContaining('catched error: Error - JWT verification failed')
        });
    });

    it('should handle cookie parsing error', async () => {
        // Mock cookie.parse to throw an error
        const originalParse = cookie.parse;
        const mockParse = jest.spyOn(cookie, 'parse').mockImplementationOnce(() => {
            throw new Error('Cookie parsing failed');
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            headers: {
            cookie: 'malformed-cookie'
            }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(JSON.parse(res._getData())).toEqual({
            error: expect.stringContaining('catched error: Error - Cookie parsing failed')
        });

        mockParse.mockRestore();
    });

    describe('Non-GET methods', () => {
        it('should return 405 for POST method', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'POST'
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(405);
            expect(res._getHeaders()['allow']).toEqual(['GET']);
        });

        it('should return 405 for PUT method', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'PUT'
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(405);
            expect(res._getHeaders()['allow']).toEqual(['GET']);
        });

        it('should return 405 for DELETE method', async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'DELETE'
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(405);
            expect(res._getHeaders()['allow']).toEqual(['GET']);
        });
    });

    describe('Logging', () => {
        it('should log custom messages', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            headers: {}
        });

        await handler(req, res);

        expect(consoleSpy.log).toHaveBeenCalledWith(
            expect.stringContaining('tasks/v1 | BFF | user/httpcookie.ts | GET | No cookies received in req.headers.cookie')
        );
        });

        it('should log error messages when JWT verification fails', async () => {
            mockVerifyJwtString.mockResolvedValueOnce({
                valid: false,
                error: 'Invalid token'
            });

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                headers: { cookie: 'jwt_token=invalid.token' }
            });

            await handler(req, res);

            expect(consoleSpy.log).toHaveBeenCalledWith(
                expect.stringContaining('VERIFY_JWT_STRING | Invalid token')
            );
        });

        it('should log caught errors', async () => {
            mockVerifyJwtString.mockRejectedValueOnce(new Error('Network error'));

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
                headers: { cookie: 'jwt_token=some.token' }
            });

            await handler(req, res);

            expect(consoleSpy.error).toHaveBeenCalledWith(
                expect.stringContaining('catched error: Error - Network error')
            );
        });
    });
});
