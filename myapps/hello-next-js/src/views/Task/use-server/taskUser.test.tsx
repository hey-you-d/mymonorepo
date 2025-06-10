// Mock the server functions
jest.mock('../../../viewModels/Task/use-server/getTasksUserViewModel', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  checkAuthTokenCookieExist: jest.fn(),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskUser } from './taskUser';
import { registerUser, loginUser, logoutUser, checkAuthTokenCookieExist } from '@/viewModels/Task/use-server/getTasksUserViewModel';

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
  tasksFormMessage: 'tasksFormMessage',
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

let spyConsoleError: jest.SpyInstance<any, any>;

describe('TaskUser Component', () => {
    const mockSetUserAuthenticated = jest.fn();
  
    beforeEach(() => {
        jest.clearAllMocks();
        mockSessionStorage.getItem.mockReturnValue(null);

        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    });


    afterEach(() => {
        // Restore console.error
        spyConsoleError.mockRestore();
    });

    describe('Authentication State Management', () => {
        it('should check auth token on mount and set user as authenticated if token exists', async () => {
            (checkAuthTokenCookieExist as jest.Mock).mockResolvedValue(true);
            
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            await waitFor(() => {
                expect(checkAuthTokenCookieExist).toHaveBeenCalled();
                expect(mockSetUserAuthenticated).toHaveBeenCalledWith(true);
            });
        });

        it('should set user as unauthenticated if no auth token exists', async () => {
            (checkAuthTokenCookieExist as jest.Mock).mockResolvedValue(false);
            
            render(<TaskUser userAuthenticated={true} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            await waitFor(() => {
                expect(checkAuthTokenCookieExist).toHaveBeenCalled();
                expect(mockSetUserAuthenticated).toHaveBeenCalledWith(false);
            });
        });
    });

    describe('Unauthenticated User Interface', () => {
        beforeEach(() => {
            (checkAuthTokenCookieExist as jest.Mock).mockResolvedValue(false);
        });

        it('should render login form when user is not authenticated', () => {
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            expect(screen.getByText('Email')).toBeInTheDocument;
            expect(screen.getByText('Password')).toBeInTheDocument;
            expect(screen.getByPlaceholderText('Email')).toBeInTheDocument;
            expect(screen.getByPlaceholderText('Password')).toBeInTheDocument;
            expect(screen.getByText('Login')).toBeInTheDocument;
            expect(screen.getByText('Register')).toBeInTheDocument;
        });

        it('should initialize email from sessionStorage', () => {
            mockSessionStorage.getItem.mockReturnValue('test@example.com');
            
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument;
        });

        it('should update email input and save to sessionStorage', () => {
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            
            expect(emailInput.value).toBe('test@example.com');
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('email', 'test@example.com');
        });

        it('should update password input', () => {
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            
            expect(passwordInput.value).toBe('password123');
        });
    });

    describe('Authenticated User Interface', () => {
        beforeEach(() => {
            (checkAuthTokenCookieExist as jest.Mock).mockResolvedValue(true);
        });

        it('should render logout interface when user is authenticated', async () => {
            render(<TaskUser userAuthenticated={true} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            await waitFor(() => {
                expect(screen.getByText('You are logged in')).toBeInTheDocument;
                expect(screen.getByText('Logout')).toBeInTheDocument;
                expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument;
                expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument;
            });
        });
    });

    describe('Form Validation', () => {
        beforeEach(() => {
            (checkAuthTokenCookieExist as jest.Mock).mockResolvedValue(false);
        });

        it('should show email validation error for invalid email format', async () => {
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const loginButton = screen.getByText('Login');
            
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.click(loginButton);
            
            await waitFor(() => {
                expect(screen.getByText('incorrect email format')).toBeInTheDocument;
            });    
        });

        it('should show password validation error for short password', async () => {
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByText('Login');
            
            fireEvent.change(passwordInput, { target: { value: '123' } });
            fireEvent.click(loginButton);
            
            await waitFor(() => {
                expect(screen.getByText('password must not be less than 6 chars')).toBeInTheDocument;
            });    
        });

        it('should clear validation messages when valid input is provided', async () => {
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByText('Login');
            
            // First, trigger validation errors
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.change(passwordInput, { target: { value: '123' } });
            fireEvent.click(loginButton);
            
            await waitFor(() => {
                expect(screen.getByText('incorrect email format')).toBeInTheDocument;
                expect(screen.getByText('password must not be less than 6 chars')).toBeInTheDocument;
            });
            
            // Then provide valid inputs
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);
            
            await waitFor(() => {
                expect(screen.queryByText('incorrect email format')).not.toBeInTheDocument;
                expect(screen.queryByText('password must not be less than 6 chars')).not.toBeInTheDocument;
            });    
        });
    });
    
    describe('Login Functionality', () => {
        beforeEach(() => {
            (checkAuthTokenCookieExist as jest.Mock).mockResolvedValue(false);
        });

        it('should successfully login user with valid credentials', async () => {
            (loginUser as jest.Mock).mockResolvedValue(true);
            
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByText('Login');
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);
            
            expect(screen.getByText('logging in...')).toBeInTheDocument;
            
            await waitFor(() => {
                expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockSetUserAuthenticated).toHaveBeenCalledWith(true);
                expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('email');
            });
        });

        it('should handle login failure', async () => {
            (loginUser as jest.Mock).mockResolvedValue(false);
            
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByText('Login');
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);
            
            await waitFor(() => {
                expect(screen.getByText('Login failed: either wrong email or password')).toBeInTheDocument;
            });
        });

        it('should not attempt login with invalid form data', async () => {
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const loginButton = screen.getByText('Login');
            fireEvent.click(loginButton);
            
            await waitFor(() => {
                expect(loginUser).not.toHaveBeenCalled();
                expect(screen.getByText('incorrect email format')).toBeInTheDocument;
                expect(screen.getByText('password must not be less than 6 chars')).toBeInTheDocument;
            });
        });
    });

    describe('Registration Functionality', () => {
        beforeEach(() => {
            (checkAuthTokenCookieExist as jest.Mock).mockResolvedValue(false);
        });

        it('should successfully register user with valid credentials', async () => {
            (registerUser as jest.Mock).mockResolvedValue(true);
            
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const registerButton = screen.getByText('Register');
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(registerButton);
            
            expect(screen.getByText('registering...')).toBeInTheDocument;
            
            await waitFor(() => {
                expect(registerUser).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockSetUserAuthenticated).toHaveBeenCalledWith(true);
                expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('email');
            });
        });

        it('should handle registration failure', async () => {
            (registerUser as jest.Mock).mockResolvedValue(false);
            
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const registerButton = screen.getByText('Register');
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(registerButton);
            
            await waitFor(() => {
                expect(screen.getByText('User Registration attempt failed')).toBeInTheDocument;
            });
        });
    });
    
    describe('Logout Functionality', () => {
        beforeEach(() => {
            (checkAuthTokenCookieExist as jest.Mock).mockResolvedValue(true);
        });


        it('should successfully logout user', async () => {
            (logoutUser as jest.Mock).mockResolvedValue(true);
            
            render(<TaskUser userAuthenticated={true} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const logoutButton = screen.getByText('Logout');
            fireEvent.click(logoutButton);
            
            await waitFor(() => {
                expect(logoutUser).toHaveBeenCalled();
                expect(mockSetUserAuthenticated).toHaveBeenCalledWith(false);
            });
        });

        it('should handle logout failure', async () => {
            (logoutUser as jest.Mock).mockResolvedValue(false);
            
            render(<TaskUser userAuthenticated={true} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const logoutButton = screen.getByText('Logout');
            fireEvent.click(logoutButton);
            
            await waitFor(() => {
                expect(screen.getByText('User Logout attempt failed')).toBeInTheDocument;
            });
        });
    });
    
    describe('Edge Cases and Error Handling', () => {
        beforeEach(() => {
            (checkAuthTokenCookieExist as jest.Mock).mockResolvedValue(false);
        });

        it('should clear form fields after successful login', async () => {
            (loginUser as jest.Mock).mockResolvedValue(true);
            
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
            const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
            const loginButton = screen.getByText('Login');
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);
            
            await waitFor(() => {
                expect(emailInput.value).toBe('');
                expect(passwordInput.value).toBe('');
            });
        });

        it('should clear form fields after successful registration', async () => {
            (registerUser as jest.Mock).mockResolvedValue(true);
            
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
            const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
            const registerButton = screen.getByText('Register');
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(registerButton);
            
            await waitFor(() => {
                expect(emailInput.value).toBe('');
                expect(passwordInput.value).toBe('');
            });
        });

        it('should handle empty sessionStorage gracefully', () => {
            mockSessionStorage.getItem.mockReturnValue(null);
            
            render(<TaskUser userAuthenticated={false} setUserAuthenticated={mockSetUserAuthenticated} />);
            
            const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
            expect(emailInput.value).toBe('');
        });
    });    
});