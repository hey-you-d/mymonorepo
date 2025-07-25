import { TaskUserModel } from './TaskUserModel';
import type { UserModelType } from '@/types/Task';

// Mock the TASKS_BFF_BASE_API_URL
jest.mock('../../../lib/app/common', () => ({
  TASKS_BFF_BASE_API_URL: 'http://localhost:3000/api'
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('TaskUserModel', () => {
    let taskUserModel: TaskUserModel;
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    const mockUserData: UserModelType = {
        email: 'test@example.com',
        password: "",
        jwt: "",
        admin: false,
        error: false,
        message: "",  
    };

    let spyConsoleError: jest.SpyInstance<any, any>;

    beforeEach(() => {
        jest.clearAllMocks();
        
        taskUserModel = new TaskUserModel();

        // Clear console.error mock
        spyConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        spyConsoleError.mockRestore();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('registerUser', () => {
        it('should successfully register a user with default URL', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockUserData),
            } as any);

            const result = await taskUserModel.registerUser('test@example.com', 'password123');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/user/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        email: 'test@example.com',
                        password: 'password123'
                    }),
                }
            );
            expect(result).toEqual(mockUserData);
        });
        it('should successfully register a user with override URL', async () => {
            const overrideUrl = 'http://custom-url.com/api';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockUserData),
            } as any);

            const result = await taskUserModel.registerUser('test@example.com', 'password123', overrideUrl);

            expect(mockFetch).toHaveBeenCalledWith(
                `${overrideUrl}/user/register`,
                expect.any(Object)
            );
            expect(result).toEqual(mockUserData);
        });
        it('should throw error when registration fails', async () => {
            const errorResponse = {
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                text: jest.fn().mockResolvedValueOnce('User already exists'),
            };
            mockFetch.mockResolvedValueOnce(errorResponse as any);

            await expect(
                taskUserModel.registerUser('test@example.com', 'password123')
            ).rejects.toThrow('use-client | model | TaskUserModel | registerUser | catched error: Error - use-client | model | TaskUserModel | registerUser | not ok response: 400 - Bad Request ');
        });
        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(
                taskUserModel.registerUser('test@example.com', 'password123')
            ).rejects.toThrow('Network error');
        });
    });

    describe('loginUser', () => {
        it('should successfully login a user with default URL', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockUserData),
            } as any);

            const result = await taskUserModel.loginUser('test@example.com', 'password123');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/user/lookup',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        email: 'test@example.com',
                        password: 'password123'
                    }),
                }
            );
            expect(result).toEqual(mockUserData);
        });
        it('should successfully login a user with override URL', async () => {
            const overrideUrl = 'http://custom-url.com/api';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockUserData),
            } as any);

            const result = await taskUserModel.loginUser('test@example.com', 'password123', overrideUrl);

            expect(mockFetch).toHaveBeenCalledWith(
                `${overrideUrl}/user/lookup`,
                expect.any(Object)
            );
            expect(result).toEqual(mockUserData);
        });
        it('should throw error when login fails', async () => {
            const errorResponse = {
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                text: jest.fn().mockResolvedValueOnce('Invalid credentials'),
            };
            mockFetch.mockResolvedValueOnce(errorResponse as any);

            await expect(
                taskUserModel.loginUser('test@example.com', 'wrongpassword')
            ).rejects.toThrow('use-client | model | TaskUserModel | loginUser | catched error: Error - use-client | model | TaskUserModel | loginUser | not ok response: 401 - Unauthorized ');
        });
    });

    describe('logoutUser', () => {
        it('should successfully logout a user with default URL', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockUserData),
            } as any);

            const result = await taskUserModel.logoutUser();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/user/logout',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            );
            expect(result).toEqual(mockUserData);
        });
        it('should successfully logout a user with override URL', async () => {
            const overrideUrl = 'http://custom-url.com/api';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockUserData),
            } as any);

            const result = await taskUserModel.logoutUser(overrideUrl);

            expect(mockFetch).toHaveBeenCalledWith(
                `${overrideUrl}/user/logout`,
                expect.any(Object)
            );
            expect(result).toEqual(mockUserData);
        });
        it('should throw error when logout fails', async () => {
            const errorResponse = {
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: jest.fn().mockResolvedValueOnce('Server error'),
            };
            mockFetch.mockResolvedValueOnce(errorResponse as any);

            await expect(
                taskUserModel.logoutUser()
            ).rejects.toThrow('use-client | model | TaskUserModel | logoutUser | catched error: Error - use-client | model | TaskUserModel | logoutUser | not ok response: 500 - Internal Server Error ');
        });
    });

    describe('checkAuthTokenCookieExist', () => {
        it('should return true when auth token cookie exists with default URL', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({ outcome: true }),
            } as any);

            const result = await taskUserModel.checkAuthTokenCookieExist();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/user/httpcookie',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            );
            expect(result).toStrictEqual({ outcome: true });
        });
        it('should return false when auth token cookie does not exist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({ outcome: false }),
            } as any);

            const result = await taskUserModel.checkAuthTokenCookieExist();

            expect(result).toStrictEqual({ outcome: false });
        });
        it('should work with override URL', async () => {
            const overrideUrl = 'http://custom-url.com/api';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({ outcome: true }),
            } as any);

            const result = await taskUserModel.checkAuthTokenCookieExist(overrideUrl);

            expect(mockFetch).toHaveBeenCalledWith(
                `${overrideUrl}/user/httpcookie`,
                expect.any(Object)
            );
            expect(result).toStrictEqual({ outcome: true });
        });
        it('should throw error when cookie check fails', async () => {
            const errorResponse = {
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                text: jest.fn().mockResolvedValueOnce('Access denied'),
            };
            mockFetch.mockResolvedValueOnce(errorResponse as any);

            await expect(
                taskUserModel.checkAuthTokenCookieExist()
            ).rejects.toThrow('use-client | model | TaskUserModel | checkAuthTokenCookieExist | catched error: Error - use-client | model | TaskUserModel | checkAuthTokenCookieExist | not ok response: 403 - Forbidden ');

            expect(console.error).toHaveBeenCalledWith(
                'use-client | model | TaskUserModel | checkAuthTokenCookieExist | catched error: Error - use-client | model | TaskUserModel | checkAuthTokenCookieExist | not ok response: 403 - Forbidden '
            );
        });
    });

    describe('constructor', () => {
        it('should create an instance of TaskUserModel', () => {
            const instance = new TaskUserModel();
            expect(instance).toBeInstanceOf(TaskUserModel);
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle JSON parsing errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
            } as any);

            await expect(
                taskUserModel.registerUser('test@example.com', 'password123')
            ).rejects.toThrow('Invalid JSON');
        });
        it('should handle empty response text in error cases', async () => {
            const errorResponse = {
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: jest.fn().mockResolvedValueOnce(''),
            };
            mockFetch.mockResolvedValueOnce(errorResponse as any);

            await expect(
                taskUserModel.loginUser('test@example.com', 'password123')
            ).rejects.toThrow('use-client | model | TaskUserModel | loginUser | catched error: Error - use-client | model | TaskUserModel | loginUser | not ok response: 404 - Not Found ');
        });
    });
});