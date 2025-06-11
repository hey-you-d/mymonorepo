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

    beforeEach(() => {
        taskUserModel = new TaskUserModel();
        mockFetch.mockClear();
        jest.clearAllMocks();
        // Clear console.error mock
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
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
                        credentials: 'include',
                    },
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
            ).rejects.toThrow('TaskUserModel - Error registering a new user: 400');

            expect(console.error).toHaveBeenCalledWith(
                'TaskUserModel - Error registering a new user: 400 - Bad Request',
                'User already exists'
            );
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
                    credentials: 'include',
                },
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
            ).rejects.toThrow('TaskUserModel - Error user login attempt: 401');

            expect(console.error).toHaveBeenCalledWith(
                'TaskUserModel - Error user login attempt: 401 - Unauthorized',
                'Invalid credentials'
            );
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
                    credentials: 'include',
                },
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
            ).rejects.toThrow('TaskUserModel - Error user logout attempt: 500');

            expect(console.error).toHaveBeenCalledWith(
                'TaskUserModel - Error user logout attempt: 500 - Internal Server Error',
                'Server error'
            );
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
                    credentials: 'include',
                },
                }
            );
            expect(result).toBe(true);
        });
        it('should return false when auth token cookie does not exist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({ outcome: false }),
            } as any);

            const result = await taskUserModel.checkAuthTokenCookieExist();

            expect(result).toBe(false);
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
            expect(result).toBe(true);
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
            ).rejects.toThrow('TaskUserModel - Error check auth_token cookie attempt: 403');

            expect(console.error).toHaveBeenCalledWith(
                'TaskUserModel - Error check auth_token cookie attempt: 403 - Forbidden',
                'Access denied'
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
            ).rejects.toThrow('TaskUserModel - Error user login attempt: 404');

            expect(console.error).toHaveBeenCalledWith(
                'TaskUserModel - Error user login attempt: 404 - Not Found',
                ''
            );
        });
    });
});