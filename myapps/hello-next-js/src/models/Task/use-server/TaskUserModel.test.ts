// Mock the dependencies
const mockApiHeader = {
  'Content-Type': 'application/json',
  'x-api-key': 'dummy-test-key',
};

jest.mock('../../../lib/app/common', () => ({
    TASKS_API_HEADER: jest.fn(),
    TASKS_SQL_BASE_API_URL: '/api/tasks/v1/sql'
}));

import { registerUser, logInUser } from './TaskUserModel';
import { TASKS_API_HEADER } from '../../../lib/app/common';

// Mock fetch globally
global.fetch = jest.fn();

const mock_TASKS_API_HEADER = TASKS_API_HEADER as jest.MockedFunction<typeof TASKS_API_HEADER>;

describe('TaskUserModel', () => {
    let spyConsoleError: jest.SpyInstance<any, any>;

    beforeAll(() => {
        jest.resetModules(); // clear cached modules to allow mocking
    });
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset the mock function
        mock_TASKS_API_HEADER.mockResolvedValue(mockApiHeader);
        // hide console.error to reduce noise on the console output
        spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
    });

    afterEach(() => {
        spyConsoleError.mockRestore();
        jest.restoreAllMocks();
    });

    describe('registerUser', () => {
        const mockUserData = {
            id: 1,
            email: 'test@example.com',
            createdAt: '2024-01-01T00:00:00Z'
        };

        it('should successfully register a user', async () => { 
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockUserData),
                status: 200,
                statusText: 'OK'
            });
            
            const result = await registerUser('test@example.com', 'password123', 'jwt-token');

            expect(mock_TASKS_API_HEADER).toHaveBeenCalled();
            expect(fetch).toHaveBeenCalledWith('/api/tasks/v1/sql/user/register', {
                method: 'POST',
                headers: mockApiHeader,
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123',
                    jwt: 'jwt-token'
                })
            });
            expect(result).toEqual(mockUserData);
        });

        it('should use override URL when provided', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockUserData),
                status: 200,
                statusText: 'OK'
            });

            const overrideUrl = 'https://custom-api.example.com';
            await registerUser('test@example.com', 'password123', 'jwt-token', overrideUrl);

            expect(mock_TASKS_API_HEADER).toHaveBeenCalled();
            expect(fetch).toHaveBeenCalledWith(`${overrideUrl}/user/register`, {
                method: 'POST',
                headers: mockApiHeader,
                body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
                jwt: 'jwt-token'
                })
            });
        });

        it('should handle HTTP error responses', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request'
            });

            await expect(registerUser('test@example.com', 'password123', 'jwt-token'))
                .rejects
                .toThrow('Error registering user credential in DB: 400 Bad Request');

            expect(spyConsoleError).toHaveBeenCalledWith(
                'Error registering user credential: ',
                '400 - Bad Request'
            );
        });

        it('should handle network errors', async () => {
            const networkError = new Error('Network error');
            (fetch as jest.Mock).mockRejectedValueOnce(networkError);

            await expect(registerUser('test@example.com', 'password123', 'jwt-token'))
                .rejects
                .toThrow('Network error');

            expect(spyConsoleError).toHaveBeenCalledWith(
                'Error registering user credential: ',
                networkError
            );
        });

        it('should handle JSON parsing errors', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
                status: 200,
                statusText: 'OK'
            });

            await expect(registerUser('test@example.com', 'password123', 'jwt-token'))
                .rejects
                .toThrow('Invalid JSON');
        });
    });

    describe('logInUser', () => {
        const mockUserData = {
            id: 1,
            email: 'test@example.com',
            lastLogin: '2024-01-01T00:00:00Z'
        };

        it('should successfully log in a user', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockUserData),
                status: 200,
                statusText: 'OK'
            });

            const result = await logInUser('test@example.com');

            expect(mock_TASKS_API_HEADER).toHaveBeenCalled();
            expect(fetch).toHaveBeenCalledWith('/api/tasks/v1/sql/user/lookup', {
                method: 'POST',
                headers: mockApiHeader,
                body: JSON.stringify({
                    email: 'test@example.com'
                })
            });
            expect(result).toEqual(mockUserData);
        });

        it('should use override URL when provided', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockUserData),
                status: 200,
                statusText: 'OK'
            });

            const overrideUrl = 'https://custom-api.example.com';
            await logInUser('test@example.com', overrideUrl);

            expect(mock_TASKS_API_HEADER).toHaveBeenCalled();
            expect(fetch).toHaveBeenCalledWith(`${overrideUrl}/user/lookup`, {
                method: 'POST',
                headers: mockApiHeader,
                body: JSON.stringify({
                email: 'test@example.com'
                })
            });
        });

        it('should handle HTTP error responses', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            await expect(logInUser('test@example.com'))
                .rejects
                .toThrow('Error logging in user: 404 Not Found');

            expect(spyConsoleError).toHaveBeenCalledWith(
                'Error logging in user: ',
                '404 - Not Found'
            );
        });

        it('should handle network errors', async () => {
            const networkError = new Error('Network error');
            (fetch as jest.Mock).mockRejectedValueOnce(networkError);

            await expect(logInUser('test@example.com'))
                .rejects
                .toThrow('Network error');

            expect(spyConsoleError).toHaveBeenCalledWith(
                'Error logging in user: ',
                networkError
            );
        });

        it('should handle unauthorized access', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            });

            await expect(logInUser('test@example.com'))
                .rejects
                .toThrow('Error logging in user: 401 Unauthorized');
        });
    });

    describe('Edge Cases', () => {
        it('should handle TASKS_API_HEADER throwing an error', async () => {
            // Mock TASKS_API_HEADER to throw an error for this test
            mock_TASKS_API_HEADER.mockRejectedValueOnce(new Error('Header error'));

            await expect(registerUser('test@example.com', 'password123', 'jwt-token'))
                .rejects
                .toThrow('Header error');
        });

        it('should handle empty email for registerUser', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request'
            });

            await expect(registerUser('', 'password123', 'jwt-token'))
                .rejects
                .toThrow('Error registering user credential in DB: 400 Bad Request');
        });

        it('should handle empty email for logInUser', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request'
            });

            await expect(logInUser(''))
                .rejects
                .toThrow('Error logging in user: 400 Bad Request');
        });    
    });
});