// Mock the TaskUserModel
jest.mock('../../../models/Task/use-client/TaskUserModel');

import { renderHook, act } from '@testing-library/react';
import useTaskUserViewModel from './useTaskUserViewModel';
import { TaskUserModel } from '@/models/Task/use-client/TaskUserModel';
import { UserModelType } from "@/types/Task";

describe('useTaskUserViewModel', () => {
    let mockTaskUserModel: {
        registerUser: any,
        loginUser: any,
        logoutUser: any,
        checkAuthTokenCookieExist: any,
    };
    let spyConsoleError: jest.SpyInstance<any, any>;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Create mock instance
        mockTaskUserModel = {
            registerUser: jest.fn(),
            loginUser: jest.fn(),
            logoutUser: jest.fn(),
            checkAuthTokenCookieExist: jest.fn(),
        };
        
        // Mock the constructor to return our mock instance
        (TaskUserModel as jest.Mock).mockImplementation(() => mockTaskUserModel);
        
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    });

    afterEach(() => {
        // Restore console.error
        spyConsoleError.mockRestore();

        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with loading state as true', () => {
            const { result } = renderHook(() => useTaskUserViewModel());
        
            expect(result.current.loading).toBe(true);
        });

        it('should create TaskUserModel instance only once', () => {
            const { result, rerender } = renderHook(() => useTaskUserViewModel());
        
            expect(TaskUserModel).toHaveBeenCalledTimes(1);
        
            // Re-render the hook
            rerender();
        
            // Should still be called only once (memoized)
            expect(TaskUserModel).toHaveBeenCalledTimes(1);
        });
    });

    describe('registerUser', () => {
        it('should register user successfully and return true', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            mockTaskUserModel.registerUser.mockResolvedValue(mockUser);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            let registerResult;
            await act(async () => {
                registerResult = await result.current.registerUser('test@example.com', 'password123');
            });
            
            expect(mockTaskUserModel.registerUser).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(registerResult).toBe(true);
            expect(result.current.loading).toBe(false);
        });

        it('should return false when user has error property', async () => {
            const mockUserWithError = { id: '1', email: 'test@example.com', error: 'Some error' };
            mockTaskUserModel.registerUser.mockResolvedValue(mockUserWithError);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            let registerResult;
            await act(async () => {
                registerResult = await result.current.registerUser('test@example.com', 'password123');
            });
            
            expect(registerResult).toBe(false);
            expect(result.current.loading).toBe(false);
        });

        it('should return false when result is undefined', async () => {
            mockTaskUserModel.registerUser.mockResolvedValue(undefined);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            let registerResult;
            await act(async () => {
                registerResult = await result.current.registerUser('test@example.com', 'password123');
            });

            expect(result.current.loading).toBe(false);    
            expect(registerResult).toBe(false);            
        });

        it('should handle registration error and set loading to false', async () => {
            const error = new Error('Registration failed');
            mockTaskUserModel.registerUser.mockRejectedValue(error);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            await act(async () => {
                await expect(result.current.registerUser('test@example.com', 'password123')).rejects.toThrow('Registration failed');
            });
            
            expect(console.error).toHaveBeenCalledWith("use-client | view-model | useTaskUserViewModel | registerUser | catched error: Error - Registration failed");
            expect(result.current.loading).toBe(false);
        });

        it('should set loading to true during registration', async () => {
            mockTaskUserModel.registerUser.mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve({ id: '1' }), 100))
            );
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            act(() => {
                result.current.registerUser('test@example.com', 'password123');
            });
            
            expect(result.current.loading).toBe(true);
        });
    });

    describe('loginUser', () => {
        it('should login user successfully and return true', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            mockTaskUserModel.loginUser.mockResolvedValue(mockUser);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            let loginResult;
            await act(async () => {
                loginResult = await result.current.loginUser('test@example.com', 'password123');
            });
            
            expect(mockTaskUserModel.loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(loginResult).toBe(true);
            expect(result.current.loading).toBe(false);
        });

        it('should return false when user has error property', async () => {
            const mockUserWithError = { id: '1', email: 'test@example.com', error: 'Invalid credentials' };
            mockTaskUserModel.loginUser.mockResolvedValue(mockUserWithError);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            let loginResult;
            await act(async () => {
                loginResult = await result.current.loginUser('test@example.com', 'password123');
            });
            
            expect(loginResult).toBe(false);
            expect(result.current.loading).toBe(false);
        });

        it('should handle login error and set loading to false', async () => {
            const error = new Error('Login failed');
            mockTaskUserModel.loginUser.mockRejectedValue(error);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            await act(async () => {
                await expect(result.current.loginUser('test@example.com', 'password123')).rejects.toThrow('Login failed');
            });
            
            expect(console.error).toHaveBeenCalledWith("use-client | view-model | useTaskUserViewModel | loginUser | catched error: Error - Login failed"
);
            expect(result.current.loading).toBe(false);
        });
    });

    describe('logoutUser', () => {
        it('should logout user successfully and return true', async () => {
            const mockUser = { success: true };
            mockTaskUserModel.logoutUser.mockResolvedValue(mockUser);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            let logoutResult;
            await act(async () => {
                logoutResult = await result.current.logoutUser();
            });
            
            expect(mockTaskUserModel.logoutUser).toHaveBeenCalledWith();
            expect(logoutResult).toBe(true);
            expect(result.current.loading).toBe(false);
        });

        it('should return false when result has error property', async () => {
            const mockResultWithError = { error: 'Logout failed' };
            mockTaskUserModel.logoutUser.mockResolvedValue(mockResultWithError);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            let logoutResult;
            await act(async () => {
                logoutResult = await result.current.logoutUser();
            });
            
            expect(logoutResult).toBe(false);
            expect(result.current.loading).toBe(false);
        });

        it('should handle logout error and set loading to false', async () => {
            const error = new Error('Logout failed');
            mockTaskUserModel.logoutUser.mockRejectedValue(error);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            await act(async () => {
                await expect(result.current.logoutUser()).rejects.toThrow('Logout failed');
            });
            
            expect(console.error).toHaveBeenCalledWith("use-client | view-model | useTaskUserViewModel | logoutUser | catched error: Error - Logout failed");
            expect(result.current.loading).toBe(false);
        });
    });

    describe('checkAuthTokenCookieExist', () => {
        it('should check auth token cookie and return true', async () => {
            mockTaskUserModel.checkAuthTokenCookieExist.mockResolvedValue(true);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            let checkResult;
            await act(async () => {
                checkResult = await result.current.checkAuthTokenCookieExist();
            });
            
            expect(mockTaskUserModel.checkAuthTokenCookieExist).toHaveBeenCalledWith();
            expect(checkResult).toBe(true);
            expect(result.current.loading).toBe(false);
        });

        it('should check auth token cookie and return false', async () => {
            mockTaskUserModel.checkAuthTokenCookieExist.mockResolvedValue(false);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            let checkResult;
            await act(async () => {
                checkResult = await result.current.checkAuthTokenCookieExist();
            });
            
            expect(checkResult).toBe(false);
            expect(result.current.loading).toBe(false);
        });

        it('should handle check auth token error and set loading to false', async () => {
            const error = new Error('Check auth token failed');
            mockTaskUserModel.checkAuthTokenCookieExist.mockRejectedValue(error);
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            await act(async () => {
                await expect(result.current.checkAuthTokenCookieExist()).rejects.toThrow('Check auth token failed');
            });
            
            expect(console.error).toHaveBeenCalledWith("use-client | view-model | useTaskUserViewModel | checkAuthTokenCookieExist | catched error: Error - Check auth token failed");
            expect(result.current.loading).toBe(false);
            });
    });

    describe('edge cases', () => {
        it('should maintain stable callback references', () => {
            const { result, rerender } = renderHook(() => useTaskUserViewModel());
            
            const initialCallbacks = {
                registerUser: result.current.registerUser,
                loginUser: result.current.loginUser,
                logoutUser: result.current.logoutUser,
                checkAuthTokenCookieExist: result.current.checkAuthTokenCookieExist,
            };
            
            rerender();
            
            expect(result.current.registerUser).toBe(initialCallbacks.registerUser);
            expect(result.current.loginUser).toBe(initialCallbacks.loginUser);
            expect(result.current.logoutUser).toBe(initialCallbacks.logoutUser);
            expect(result.current.checkAuthTokenCookieExist).toBe(initialCallbacks.checkAuthTokenCookieExist);
        });

        it('should handle multiple concurrent operations correctly', async () => {
            mockTaskUserModel.registerUser.mockResolvedValue({ id: '1' });
            mockTaskUserModel.loginUser.mockResolvedValue({ id: '1' });
            
            const { result } = renderHook(() => useTaskUserViewModel());
            
            await act(async () => {
                const promises = [
                    result.current.registerUser('test1@example.com', 'password1'),
                    result.current.loginUser('test2@example.com', 'password2'),
                ];
                
                await Promise.all(promises);
            });
            
            expect(mockTaskUserModel.registerUser).toHaveBeenCalledWith('test1@example.com', 'password1');
            expect(mockTaskUserModel.loginUser).toHaveBeenCalledWith('test2@example.com', 'password2');
            expect(result.current.loading).toBe(false);
        });
    });
});
