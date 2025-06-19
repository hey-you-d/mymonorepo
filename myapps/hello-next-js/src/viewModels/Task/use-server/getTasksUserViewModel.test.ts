import {
  getJwtSecret,
  createAuthCookie,
  generateHashedPassword,
  generateJWT,
  registerUser,
  loginUser,
  logoutUser,
  checkAuthTokenCookieExist
} from './getTasksUserViewModel';

// Mock external dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
  argon2id: 'argon2id'
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

jest.mock('../../../lib/app/awsSecretManager', () => ({
  getSecret: jest.fn()
}));

jest.mock('../../../models/Task/use-server/TaskUserModel', () => ({
  registerUser: jest.fn(),
  logInUser: jest.fn()
}));

jest.mock('../../../lib/app/featureFlags', () => ({
  APP_ENV: 'TEST',
  LOCALHOST_MODE: {
    cookie: {
      secure: false,
      path: '/'
    }
  },
  LIVE_SITE_MODE: {
    cookie: {
      secure: true,
      path: '/app'
    }
  }
}));

jest.mock('../../../lib/app/common', () => ({
  JWT_TOKEN_COOKIE_NAME: 'auth_token',
  TASKS_SQL_BASE_API_URL: 'http://test-api.com',
  VERIFY_JWT_STRING: jest.fn().mockResolvedValue({ valid: true, payload: "" }),
}));

import { cookies } from 'next/headers';
import { getSecret } from '@/lib/app/awsSecretManager';
import argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import { registerUser as registerUserModel, logInUser as logInUserModel } from '@/models/Task/use-server/TaskUserModel';
import { VERIFY_JWT_STRING } from '@/lib/app/common';

describe("getTasksUserViewModel", () => {
    interface MockCookieStore {
        set: jest.Mock;
        get: jest.Mock;
        delete: jest.Mock;
    }

    interface MockCookie {
        value: string;
    }

    let spyConsoleError: jest.SpyInstance<any, any>;
    let mockCookieStore: MockCookieStore;

    beforeAll(() => {
        // mock the http only auth_token cookie. 
        // The presence of this cookie indicates that the user has logged in
        jest.doMock('next/headers', () => ({
            cookies: jest.fn(() => ({
                get: (name: string) => {
                    if (name === 'auth_token') {
                        return { value: 'mocked-token' };
                    }
                    return undefined;
                },
            })),
        }));
    });

    beforeEach(() => {
        jest.clearAllMocks();

        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
        
        // Setup mock cookie store
        mockCookieStore = {
            set: jest.fn(),
            get: jest.fn(),
            delete: jest.fn()
        };
        
        (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
        (VERIFY_JWT_STRING as jest.Mock).mockResolvedValue({ valid: true, payload: "" }),
        
        // Setup environment variables
        process.env.AWS_REGION = 'us-east-1';

        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    });

    afterEach(() => {
        jest.resetAllMocks();

        spyConsoleError.mockRestore();
    });

    describe('getJwtSecret', () => {
        it('should successfully retrieve JWT secret from AWS Secret Manager', async () => {
            const mockSecret = { jwtSecret: 'test-secret-123' };
            (getSecret as jest.Mock).mockResolvedValue(mockSecret);

            const result = await getJwtSecret();

            expect(getSecret).toHaveBeenCalledWith(
                'dev/hello-next-js/jwt-secret',
                'us-east-1'
            );
            expect(result).toEqual(mockSecret);
        });

        it('should throw error when AWS_REGION is missing', async () => {
            delete process.env.AWS_REGION;

            await expect(getJwtSecret()).rejects.toThrow('AWS Region is missing');
        });

        it('should handle AWS Secret Manager errors', async () => {
            const error = new Error('AWS Secret Manager error');
            (getSecret as jest.Mock).mockRejectedValue(error);

            await expect(getJwtSecret()).rejects.toThrow('AWS Secret Manager error');
        });
    });

    describe('createAuthCookie', () => {
        const testJwt = 'test.jwt.token';
    
        it('should create auth cookie successfully in localhost mode', async () => {
            mockCookieStore.get.mockReturnValue({ value: testJwt });

            const result = await createAuthCookie(testJwt);

            expect(mockCookieStore.set).toHaveBeenCalledWith('auth_token', testJwt, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 3600,
                path: '/'
            });
            expect(result).toBe(true);
        });

        it('should create auth cookie successfully in live mode', async () => {
            // Mock live environment
            jest.doMock('../../../lib/app/featureFlags', () => ({
                APP_ENV: 'LIVE',
                LOCALHOST_MODE: {
                    cookie: { secure: false, path: '/' }
                },
                LIVE_SITE_MODE: {
                    cookie: { secure: true, path: '/app' }
                }
            }));

            mockCookieStore.get.mockReturnValue({ value: testJwt } as MockCookie);

            const result = await createAuthCookie(testJwt);

            expect(result).toBe(true);
        });

         it('should return false when cookie creation fails', async () => {
            mockCookieStore.get.mockReturnValue({ value: 'different-token' } as MockCookie);

            const result = await createAuthCookie(testJwt);

            expect(result).toBe(false);
        });

        it('should return false when cookie is not found after creation', async () => {
            mockCookieStore.get.mockReturnValue(null);

            const result = await createAuthCookie(testJwt);

            expect(result).toBe(false);
        });
    });
    
    describe('generateHashedPassword', () => {
        it('should generate hashed password with correct parameters', async () => {
        const password = 'testPassword123';
        const hashedPassword = 'hashed_password_string';
        (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);

        const result = await generateHashedPassword(password);

        expect(argon2.hash).toHaveBeenCalledWith(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 5,
            parallelism: 1
        });
        expect(result).toBe(hashedPassword);
        });
    });

    describe('generateJWT', () => {
        it('should generate JWT token successfully', async () => {
        const email = 'test@example.com';
        const hashedPwd = 'hashed_password';
        const jwtSecret = 'secret_key';
        const expectedToken = 'jwt.token.here';
        
        (sign as jest.Mock).mockResolvedValue(expectedToken);

        const result = await generateJWT(email, hashedPwd, jwtSecret);

        expect(sign).toHaveBeenCalledWith(
            { email, hashedPassword: hashedPwd },
            jwtSecret,
            { expiresIn: '900000' } // 90000sec = 15mins
        );
        expect(result).toBe(expectedToken);
        });
    });

    describe('registerUser', () => {
        const email = 'newuser@example.com';
        const password = 'newPassword123';
        const hashedPwd = 'hashed_new_password';
        const jwt = 'new.jwt.token';
        const jwtSecret = { jwtSecret: 'secret_key' };

        beforeEach(() => {
            (argon2.hash as jest.Mock).mockResolvedValue(hashedPwd);
            (getSecret as jest.Mock).mockResolvedValue(jwtSecret);
            (sign as jest.Mock).mockResolvedValue(jwt);
            mockCookieStore.get.mockReturnValue({ value: jwt } as MockCookie);
        });
    
        it('should successfully register a new user', async () => {
            // Mock that email doesn't exist (should throw or return error)
            (logInUserModel as jest.Mock).mockResolvedValue({ error: 'User not found' });
            (registerUserModel as jest.Mock).mockResolvedValue({ jwt });

            const result = await registerUser(email, password);

            expect(logInUserModel).toHaveBeenCalledWith(email, 'http://test-api.com');
            expect(registerUserModel).toHaveBeenCalledWith(email, hashedPwd, jwt, 'http://test-api.com');
            expect(result).toBe(true);
        });

        it('should return false when email already exists', async () => {
            // Mock that email exists
            (logInUserModel as jest.Mock).mockResolvedValue({
                email: 'existing@example.com',
                password: 'hash',
                jwt: 'existing.jwt'
            });

            const result = await registerUser(email, password);

            expect(result).toBe(false);
            expect(registerUserModel).not.toHaveBeenCalled();
        });

        it('should return false when JWT is not provided in registration response', async () => {
            (logInUserModel as jest.Mock).mockResolvedValue({ error: 'User not found' });
            (registerUserModel as jest.Mock).mockResolvedValue({ jwt: '' });

            const result = await registerUser(email, password);

            expect(result).toBe(false);
        });

        it('should handle registration errors and call logout', async () => {
            (logInUserModel as jest.Mock).mockResolvedValue({ error: 'User not found' });
            const error = new Error('Registration failed');
            (registerUserModel as jest.Mock).mockRejectedValue(error);

            await expect(registerUser(email, password)).rejects.toThrow('Registration failed');
            expect(mockCookieStore.delete).toHaveBeenCalledWith('auth_token');
        });

        it('should handle email lookup errors during registration', async () => {
            const error = new Error('Database connection failed');
            (logInUserModel as jest.Mock).mockRejectedValue(error);

            await expect(registerUser(email, password)).rejects.toThrow('Database connection failed');
        });
    }); 
    
    describe('loginUser', () => {
        const email = 'user@example.com';
        const password = 'userPassword123';
        const hashedPwd = 'hashed_user_password';
        const jwt = 'user.jwt.token';

        it('should successfully login user with correct credentials', async () => {
            (logInUserModel as jest.Mock).mockResolvedValue({
                email,
                password: hashedPwd,
                jwt
            });
            (VERIFY_JWT_STRING as jest.Mock).mockResolvedValue({
                valid: true,
                payload: "",
            });    
            (argon2.verify as jest.Mock).mockResolvedValue(true);
            mockCookieStore.get.mockReturnValue({ value: jwt } as MockCookie);

            const result = await loginUser(email, password);

            expect(logInUserModel).toHaveBeenCalledWith(email, 'http://test-api.com');
            expect(argon2.verify).toHaveBeenCalledWith(hashedPwd, password);
            expect(result).toBe(true);
        });

        it('should return false when password verification fails', async () => {
            (logInUserModel as jest.Mock).mockResolvedValue({
                email,
                password: hashedPwd,
                jwt
            });
            (argon2.verify as jest.Mock).mockResolvedValue(false);

            const result = await loginUser(email, password);

            expect(result).toBe(false);
        });

        it('should return false when user is not found', async () => {
            (logInUserModel as jest.Mock).mockResolvedValue({ error: 'User not found' });

            const result = await loginUser(email, password);

            expect(result).toBe(false);
            expect(argon2.verify).not.toHaveBeenCalled();
        });

        it('should handle login errors and call logout', async () => {
            const error = new Error('Login failed');
            (logInUserModel as jest.Mock).mockRejectedValue(error);

            await expect(loginUser(email, password)).rejects.toThrow('Login failed');
            expect(mockCookieStore.delete).toHaveBeenCalledWith('auth_token');
        });
    });

    describe('logoutUser', () => {
        it('should successfully logout user by deleting cookie', async () => {
            mockCookieStore.get.mockReturnValue(null);

            const result = await logoutUser();

            expect(mockCookieStore.delete).toHaveBeenCalledWith('auth_token');
            expect(result).toBe(true);
        });

        it('should successfully logout when cookie value is empty', async () => {
            mockCookieStore.get.mockReturnValue({ value: '' } as MockCookie);

            const result = await logoutUser();

            expect(result).toBe(true);
        });

        it('should return false when cookie still exists after deletion attempt', async () => {
            mockCookieStore.get.mockReturnValue({ value: 'still.there.token' } as MockCookie);

            const result = await logoutUser();

            expect(result).toBe(false);
        });

        it('should handle logout errors', async () => {
            const error = new Error('Cookie deletion failed');
            mockCookieStore.delete.mockImplementation(() => { throw error; });

            await expect(logoutUser()).rejects.toThrow('Cookie deletion failed');
        });
    });

    describe('checkAuthTokenCookieExist', () => {
        it('should return true when auth token cookie exists and has value', async () => {
            mockCookieStore.get.mockReturnValue({ value: 'existing.jwt.token' } as MockCookie);

            const result = await checkAuthTokenCookieExist();

            expect(mockCookieStore.get).toHaveBeenCalledWith('auth_token');
            expect(result).toStrictEqual({ outcome: true, message: "" });
        });

        it('should return false when auth token cookie does not exist', async () => {
            mockCookieStore.get.mockReturnValue(null);

            const result = await checkAuthTokenCookieExist();

            expect(result).toStrictEqual({message: "use-server | getTasksUserViewModel | Unknown Error when checking auth_token", "outcome": false});
        });

        it('should return false when auth token cookie exists but has empty value', async () => {
            mockCookieStore.get.mockReturnValue({ value: '' } as MockCookie);

            const result = await checkAuthTokenCookieExist();

            expect(result).toStrictEqual({message: "use-server | getTasksUserViewModel | Unknown Error when checking auth_token", outcome: false});
        });

        it('should handle cookie check errors', async () => {
            const error = new Error('Cookie access failed');
            mockCookieStore.get.mockImplementation(() => { throw error; });

            await expect(checkAuthTokenCookieExist()).rejects.toThrow('Cookie access failed');
        });
    });

    describe('Integration scenarios', () => {
        it('should handle complete registration flow', async () => {
            const email = 'integration@example.com';
            const password = 'integrationPassword123';
            
            (VERIFY_JWT_STRING as jest.Mock).mockResolvedValue({
                valid: true,
                payload: "",
            }); 

            // Mock successful registration flow
            (logInUserModel as jest.Mock).mockResolvedValue({ error: 'User not found' });
            (argon2.hash as jest.Mock).mockResolvedValue('hashed_integration_password');
            (getSecret as jest.Mock).mockResolvedValue({ jwtSecret: 'integration_secret' });
            (sign as jest.Mock).mockResolvedValue('integration.jwt.token');
            (registerUserModel as jest.Mock).mockResolvedValue({ jwt: 'integration.jwt.token' });
            mockCookieStore.get.mockReturnValue({ value: 'integration.jwt.token' } as MockCookie);

            const result = await registerUser(email, password);

            expect(result).toBe(true);
            expect(mockCookieStore.set).toHaveBeenCalled();
        });

        it('should handle complete login flow', async () => {
            const email = 'login@example.com';
            const password = 'loginPassword123';

            (VERIFY_JWT_STRING as jest.Mock).mockResolvedValue({
                valid: true,
                payload: "",
            }); 
      
            // Mock successful login flow
            (logInUserModel as jest.Mock).mockResolvedValue({
                email,
                password: 'hashed_login_password',
                jwt: 'login.jwt.token'
            });
            (argon2.verify as jest.Mock).mockResolvedValue(true);
            mockCookieStore.get.mockReturnValue({ value: 'login.jwt.token' } as MockCookie);

            const result = await loginUser(email, password);

            expect(result).toBe(true);
            expect(mockCookieStore.set).toHaveBeenCalled();
        });
    });
});