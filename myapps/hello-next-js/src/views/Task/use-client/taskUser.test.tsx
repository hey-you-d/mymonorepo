import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskUser from './taskUser';
import type { TaskUserType } from '@/types/Task';
import useTaskUserViewModel from '@/viewModels/Task/use-client/useTaskUserViewModel';

// Mock the view model hook
jest.mock('../../../viewModels/Task/use-client/useTaskUserViewModel');

// Mock CSS modules
jest.mock('../../../app/page.module.css', () => ({
    tasksUserForm: 'tasksUserForm',
    tasksLabelEmail: 'tasksLabelEmail',
    tasksLabelPassword: 'tasksLabelPassword',
    tasksFieldEmail: 'tasksFieldEmail',
    tasksFieldPassword: 'tasksFieldPassword',
    tasksMessageEmail: 'tasksMessageEmail',
    tasksMessagePassword: 'tasksMessagePassword',
    tasksFormButtons: 'tasksFormButtons',
    tasksFormMessage: 'tasksFormMessage'
}));

// Mock sessionStorage
const mockSessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage
});

let spyConsoleError: jest.SpyInstance<any, any>;

describe('TaskUser Component (client-side variant)', () => {
    const mockSetUserAuthenticated = jest.fn();
    const mockRegisterUser = jest.fn();
    const mockLoginUser = jest.fn();
    const mockLogoutUser = jest.fn();
    const mockCheckAuthTokenCookieExist = jest.fn();

    const defaultProps: TaskUserType = {
        userAuthenticated: false,
        setUserAuthenticated: mockSetUserAuthenticated
    };

    const mockViewModel = {
        loading: false,
        registerUser: mockRegisterUser,
        loginUser: mockLoginUser,
        logoutUser: mockLogoutUser,
        checkAuthTokenCookieExist: mockCheckAuthTokenCookieExist
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useTaskUserViewModel as jest.Mock).mockReturnValue(mockViewModel);
        mockSessionStorage.getItem.mockReturnValue(null);
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    });

    afterEach(() => {
        // Restore console.error
        spyConsoleError.mockRestore();
    });

    describe('Initial render and authentication check', () => {
        it('renders login form when user is not authenticated', async () => {
            render(<TaskUser {...defaultProps} />);

            expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
            expect(screen.getByText('only logged-in users can interact with the table')).toBeInTheDocument();
        });


        it('renders logout view when user is authenticated', () => {
            render(<TaskUser {...defaultProps} userAuthenticated={true} />);

            expect(screen.getByText('You are logged in')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
            expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
            expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
        });

        it('loads email from sessionStorage on mount', () => {
            mockSessionStorage.getItem.mockReturnValue('test@example.com');
            
            render(<TaskUser {...defaultProps} />);

            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('email');
            expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
        });

        it('checks auth token cookie on mount', async () => {
            mockCheckAuthTokenCookieExist.mockResolvedValue(true);
            
            render(<TaskUser {...defaultProps} />);

            await waitFor(() => {
                expect(mockCheckAuthTokenCookieExist).toHaveBeenCalled();
                expect(mockSetUserAuthenticated).toHaveBeenCalledWith(true);
            });
        });

        it('sets user as unauthenticated when no auth token cookie exists', async () => {
            mockCheckAuthTokenCookieExist.mockResolvedValue(false);
            
            render(<TaskUser {...defaultProps} userAuthenticated={true} />);

            await waitFor(() => {
                expect(mockSetUserAuthenticated).toHaveBeenCalledWith(false);
            });
        });        
    });

    describe('Form validation', () => {
        it('validates email format', async () => {
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: 'Login' });

            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);

            expect(screen.getByText('incorrect email format')).toBeInTheDocument();
            expect(mockLoginUser).not.toHaveBeenCalled();
        });

        it('validates password length', async () => {
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: 'Login' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: '12345' } });
            fireEvent.click(loginButton);

            expect(screen.getByText('password must not be less than 6 chars')).toBeInTheDocument();
            expect(mockLoginUser).not.toHaveBeenCalled();
        });

        it('clears validation messages when input becomes valid', async () => {
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: 'Login' });

            // First, trigger validation errors
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.change(passwordInput, { target: { value: '123' } });
            fireEvent.click(loginButton);

            expect(screen.getByText('incorrect email format')).toBeInTheDocument();
            expect(screen.getByText('password must not be less than 6 chars')).toBeInTheDocument();

            // Then, fix the inputs
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);

            expect(screen.queryByText('incorrect email format')).not.toBeInTheDocument();
            expect(screen.queryByText('password must not be less than 6 chars')).not.toBeInTheDocument();
        });
    });

    describe('User login', () => {
        it('successfully logs in user', async () => {
            mockLoginUser.mockResolvedValue(true);
            
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: 'Login' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);

            expect(screen.getByText('logging in...')).toBeInTheDocument();

            await waitFor(() => {
                expect(mockLoginUser).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockSetUserAuthenticated).toHaveBeenCalledWith(true);
                expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('email');
            });
        });

        it('handles login failure', async () => {
            mockLoginUser.mockResolvedValue(false);
            
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: 'Login' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(screen.getByText('Login failed: either wrong email or password')).toBeInTheDocument();
            });
        });

        it('clears form fields after successful login', async () => {
            mockLoginUser.mockResolvedValue(true);
            
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: 'Login' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect((emailInput as HTMLInputElement).value).toBe('');
                expect((passwordInput as HTMLInputElement).value).toBe('');
            });
        });
    });

    describe('User registration', () => {
        it('successfully registers user', async () => {
            mockRegisterUser.mockResolvedValue(true);
            
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const registerButton = screen.getByRole('button', { name: 'Register' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(registerButton);

            expect(screen.getByText('registering...')).toBeInTheDocument();

            await waitFor(() => {
                expect(mockRegisterUser).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockSetUserAuthenticated).toHaveBeenCalledWith(true);
                expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('email');
            });
        });

        it('handles registration failure', async () => {
            mockRegisterUser.mockResolvedValue(false);
            
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const registerButton = screen.getByRole('button', { name: 'Register' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(registerButton);

            await waitFor(() => {
                expect(screen.getByText('User Registration attempt failed')).toBeInTheDocument();
            });
        });
    });

    describe('User logout', () => {
        it('successfully logs out user', async () => {
            mockLogoutUser.mockResolvedValue(true);
            
            render(<TaskUser {...defaultProps} userAuthenticated={true} />);

            const logoutButton = screen.getByRole('button', { name: 'Logout' });
            fireEvent.click(logoutButton);

            await waitFor(() => {
                expect(mockLogoutUser).toHaveBeenCalled();
                expect(mockSetUserAuthenticated).toHaveBeenCalledWith(false);
            });
        });

        it('handles logout failure', async () => {
            mockLogoutUser.mockResolvedValue(false);
            
            render(<TaskUser {...defaultProps} userAuthenticated={true} />);

            const logoutButton = screen.getByRole('button', { name: 'Logout' });
            fireEvent.click(logoutButton);

            await waitFor(() => {
                expect(screen.getByText('User Logout attempt failed')).toBeInTheDocument();
            });
        });
    });

    describe('Loading states', () => {
        it('disables buttons when loading', () => {
            (useTaskUserViewModel as jest.Mock).mockReturnValue({
                ...mockViewModel,
                loading: true
            });

            render(<TaskUser {...defaultProps} />);

            expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
        });

        it('disables logout button when loading', () => {
            (useTaskUserViewModel as jest.Mock).mockReturnValue({
                ...mockViewModel,
                loading: true
            });

            render(<TaskUser {...defaultProps} userAuthenticated={true} />);

            expect(screen.getByRole('button', { name: 'Logout' })).toBeDisabled();
        });
    });

    describe('SessionStorage interaction', () => {
        it('saves email to sessionStorage on input change', () => {
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('email', 'test@example.com');
        });

        it('removes email from sessionStorage on successful login', async () => {
            mockLoginUser.mockResolvedValue(true);
            
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: 'Login' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('email');
            });
        });

        it('removes email from sessionStorage on successful registration', async () => {
            mockRegisterUser.mockResolvedValue(true);
            
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const registerButton = screen.getByRole('button', { name: 'Register' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(registerButton);

            await waitFor(() => {
                expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('email');
            });
        });
    });

    describe('Edge cases', () => {
        it('handles empty email and password submission', () => {
            render(<TaskUser {...defaultProps} />);

            const loginButton = screen.getByRole('button', { name: 'Login' });
            fireEvent.click(loginButton);

            expect(screen.getByText('incorrect email format')).toBeInTheDocument();
            expect(screen.getByText('password must not be less than 6 chars')).toBeInTheDocument();
            expect(mockLoginUser).not.toHaveBeenCalled();
        });

        it('handles whitespace-only password', () => {
            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: 'Login' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: '      ' } });
            fireEvent.click(loginButton);

            expect(screen.getByText('password must not be less than 6 chars')).toBeInTheDocument();
            expect(mockLoginUser).not.toHaveBeenCalled();
        });

        it('prevents form submission during loading', () => {
            (useTaskUserViewModel as jest.Mock).mockReturnValue({
                ...mockViewModel,
                loading: true
            });

            render(<TaskUser {...defaultProps} />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: 'Login' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);

            expect(mockLoginUser).not.toHaveBeenCalled();
        });
    });
});