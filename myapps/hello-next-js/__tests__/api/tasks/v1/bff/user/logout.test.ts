import { createMocks, RequestMethod } from 'node-mocks-http';
import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../../../../pages/api/tasks/v1/bff/user/logout';
import { JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";
import { APP_ENV, LIVE_SITE_MODE, LOCALHOST_MODE } from "@/lib/app/featureFlags";

// Mock the dependencies
jest.mock('../../../../../../src/lib/app/common', () => ({
  JWT_TOKEN_COOKIE_NAME: 'test-jwt-token'
}));

jest.mock('../../../../../../src/lib/app/featureFlags', () => ({
  APP_ENV: 'TEST',
  LIVE_SITE_MODE: {
    cookie: {
      path: '/live',
      secure: true
    }
  },
  LOCALHOST_MODE: {
    cookie: {
      path: '/local',
      secure: false
    }
  }
}));

jest.mock('cookie', () => ({
    serialize: jest.fn()
}));

// Mock console methods
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('/bff/user/logout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('GET method', () => {
        it('should successfully delete cookie and return 200 with LOCALHOST environment', async () => {
            // Mock APP_ENV to be different from LIVE
            const mockAppEnv = jest.requireMock('../../../../../../src/lib/app/featureFlags');
            mockAppEnv.APP_ENV = 'LOCALHOST';

            const mockSerialize = serialize as jest.MockedFunction<typeof serialize>;
            mockSerialize.mockReturnValue('test-jwt-token=; Path=/local; HttpOnly; Max-Age=0; SameSite=Strict');

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
            });

            await handler(req, res);

            expect(mockSerialize).toHaveBeenCalledWith('test-jwt-token', '', {
                httpOnly: true,
                secure: false, // LOCALHOST_MODE.cookie.secure
                path: '/local', // LOCALHOST_MODE.cookie.path
                sameSite: 'strict',
                maxAge: 0,
            });

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                error: false,
                message: expect.stringContaining('successful test-jwt-token cookie deletion')
            });

            expect(res._getHeaders()['set-cookie']).toBe('test-jwt-token=; Path=/local; HttpOnly; Max-Age=0; SameSite=Strict');
            expect(consoleLogSpy).toHaveBeenCalledWith(
                expect.stringContaining('tasks/v1 | BFF | user/logout.ts | POST | successful test-jwt-token cookie deletion')
            );
        });

        it('should successfully delete cookie and return 200 with LIVE environment', async () => {
            // Mock APP_ENV to be LIVE
            const mockAppEnv = jest.requireMock('../../../../../../src/lib/app/featureFlags');
            mockAppEnv.APP_ENV = 'LIVE';

            const mockSerialize = serialize as jest.MockedFunction<typeof serialize>;
            mockSerialize.mockReturnValue('test-jwt-token=; Path=/live; HttpOnly; Secure; Max-Age=0; SameSite=Strict');

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
            });

            await handler(req, res);

            expect(mockSerialize).toHaveBeenCalledWith('test-jwt-token', '', {
                httpOnly: true,
                secure: true, // LIVE_SITE_MODE.cookie.secure
                path: '/live', // LIVE_SITE_MODE.cookie.path
                sameSite: 'strict',
                maxAge: 0,
            });

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                error: false,
                message: expect.stringContaining('successful test-jwt-token cookie deletion')
            });

            expect(res._getHeaders()['set-cookie']).toBe('test-jwt-token=; Path=/live; HttpOnly; Secure; Max-Age=0; SameSite=Strict');
        });

        it('should handle errors and return 500', async () => {
            const mockSerialize = serialize as jest.MockedFunction<typeof serialize>;
            mockSerialize.mockImplementation(() => {
                throw new Error('Serialization failed');
            });

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: expect.stringContaining('catched error: Error - Serialization failed')
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('tasks/v1 | BFF | user/logout.ts | POST | catched error: Error - Serialization failed')
            );
        });

        it('should handle errors with custom error types', async () => {
            const mockSerialize = serialize as jest.MockedFunction<typeof serialize>;
            mockSerialize.mockImplementation(() => {
                const customError = new Error('Custom error message');
                customError.name = 'CustomError';
                throw customError;
            });

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: 'GET',
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: expect.stringContaining('catched error: CustomError - Custom error message')
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('tasks/v1 | BFF | user/logout.ts | POST | catched error: CustomError - Custom error message')
            );
        });
    });

    describe('Unsupported HTTP methods', () => {
        it.each(['PUT', 'DELETE', 'POST'] as RequestMethod[])(
            'should return 405 Method Not Allowed for %s requests',
            async (method) => {
                // Arrange
                const { req, res } = createMocks({ method });

                // Act
                await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

                // Assert
                expect(res._getStatusCode()).toBe(405);
                expect(res._getHeaders()).toEqual({ allow: ['GET'] });
                expect(res._getData()).toBe(`Method ${method} Not Allowed`);
            }
        );
    });
});
