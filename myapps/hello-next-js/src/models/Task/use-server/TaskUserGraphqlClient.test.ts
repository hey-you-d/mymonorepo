import { fetchGraphQL } from "./TaskUserGraphqlClient";

// Mock the dependencies
const mockApiHeader = {
  'Content-Type': 'application/json',
  'x-api-key': 'dummy-test-key',
};

jest.mock('../../../lib/app/common', () => ({
    TASKS_API_HEADER: jest.fn(),
    DOMAIN_URL: 'https://test-domain.com',
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('TaskUserGraphqlClient - fetchGraphQL', () => {
    const mockTasksApiHeader = require('../../../lib/app/common').TASKS_API_HEADER;

    beforeEach(() => {
        jest.clearAllMocks();
        mockTasksApiHeader.mockResolvedValue(mockApiHeader);
    });

    describe('successful requests', () => {
        it('should handle lookupUser query successfully', async () => {
            const mockResponse = {
                data: {
                    lookupUser: {
                        email: 'test@example.com',
                        hashed_pwd: 'hashed123',
                        jwt: 'jwt-token',
                        admin_access: false
                    }
                }
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await fetchGraphQL(
                'query { lookupUser(email: $email) { email } }',
                { email: 'test@example.com' }
            );

            expect(fetch).toHaveBeenCalledWith(
                'https://test-domain.com/api/tasks/v1/sql/user/graphql',
                {
                    method: 'POST',
                    headers: mockApiHeader,
                    body: JSON.stringify({
                        query: 'query { lookupUser(email: $email) { email } }',
                        variables: { email: 'test@example.com' }
                    }),
                }
            );

           expect(result).toEqual({
                email: 'test@example.com',
                password: 'hashed123',
                jwt: 'jwt-token',
                admin: false,
                error: false,
                message: 'successful graphql op'
            });
        });

        it('should handle registerUser mutation successfully', async () => {
            const mockResponse = {
                data: {
                    registerUser: {
                        email: 'newuser@example.com',
                        hashed_pwd: 'hashed456',
                        jwt: 'new-jwt-token',
                        admin_access: true
                    }
                }
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await fetchGraphQL(
                'mutation { registerUser(email: $email, password: $password, jwt: $jwt) { email } }',
                { 
                    email: 'newuser@example.com', 
                    password: 'password123',
                    jwt: 'temp-jwt'
                }
            );

            expect(result).toEqual({
                email: 'newuser@example.com',
                password: 'hashed456',
                jwt: 'new-jwt-token',
                admin: true,
                error: false,
                message: 'successful graphql op'
            });
        });

        it('should handle query without variables', async () => {
            const mockResponse = {
                data: {
                lookupUser: {
                    email: 'test@example.com',
                    hashed_pwd: 'hashed123',
                    jwt: 'jwt-token',
                    admin_access: false
                }
                }
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await fetchGraphQL('query { allUsers { email } }');

            expect(fetch).toHaveBeenCalledWith(
                'https://test-domain.com/api/tasks/v1/sql/user/graphql',
                {
                    method: 'POST',
                    headers: mockApiHeader,
                    body: JSON.stringify({
                        query: 'query { allUsers { email } }',
                        variables: undefined
                    }),
                }
            );
        });
    });

    describe("error handling", () => {
        it('should throw error for HTTP errors', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: jest.fn().mockResolvedValue('Not Found'),
            });

            await expect(
                fetchGraphQL('query { lookupUser }', { email: 'test@example.com' })
            ).rejects.toThrow('HTTP error 404: Not Found');
        });

        it('should throw error for GraphQL errors', async () => {
            const mockResponse = {
                errors: [
                { message: 'Field "nonexistent" doesn\'t exist' },
                { message: 'Syntax error' }
                ]
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            await expect(
                fetchGraphQL('query { nonexistent }')
            ).rejects.toThrow('Field "nonexistent" doesn\'t exist\nSyntax error');
        });

        it('should handle GraphQL errors with missing message', async () => {
            const mockResponse = {
                errors: [
                    { message: 'Valid error' },
                    { someOtherField: 'invalid error object' },
                    null
                ]
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            await expect(
                fetchGraphQL('query { test }')
            ).rejects.toThrow('Valid error\nerror in TaskUserGraphQLClient model component\nerror in TaskUserGraphQLClient model component');
        });
    });

    describe('user not found scenarios', () => {
        it('should return error when lookupUser returns null', async () => {
            const mockResponse = {
                data: {
                lookupUser: null
                }
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await fetchGraphQL(
                'query { lookupUser(email: $email) { email } }',
                { email: 'nonexistent@example.com' }
            );

            expect(result).toEqual({
                error: true,
                message: 'user not found'
            });
        });

        it('should return error when registerUser returns null', async () => {
            const mockResponse = {
                data: {
                registerUser: null
                }
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await fetchGraphQL(
                'mutation { registerUser(email: $email, password: $password, jwt: $jwt) { email } }',
                { 
                email: 'invalid@example.com', 
                password: 'password123',
                jwt: 'temp-jwt'
                }
            );

            expect(result).toEqual({
                error: true,
                message: 'user not found'
            });
        });

        it('should return error when no matching query pattern', async () => {
            const mockResponse = {
                data: {
                someOtherQuery: {
                    email: 'test@example.com',
                    hashed_pwd: 'hashed123',
                    jwt: 'jwt-token',
                    admin_access: false
                }
                }
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await fetchGraphQL(
                'query { someOtherQuery }',
                { otherParam: 'value' }
            );

            expect(result).toEqual({
                error: true,
                message: 'user not found'
            });
        });
    });

    describe("edge cases", () => {
        it('should handle empty variables object', async () => {
            const mockResponse = {
                data: {
                lookupUser: {
                    email: 'test@example.com',
                    hashed_pwd: 'hashed123',
                    jwt: 'jwt-token',
                    admin_access: false
                }
                }
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await fetchGraphQL('query { test }', {});

            expect(result).toEqual({
                error: true,
                message: 'user not found'
            });
        });

        it('should handle partial variables for lookupUser (missing password and jwt)', async () => {
            const mockResponse = {
                data: {
                lookupUser: {
                    email: 'test@example.com',
                    hashed_pwd: 'hashed123',
                    jwt: 'jwt-token',
                    admin_access: false
                }
                }
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await fetchGraphQL(
                'query { lookupUser(email: $email) { email } }',
                { email: 'test@example.com', someOtherParam: 'value' }
            );

            expect(result).toEqual({
                email: 'test@example.com',
                password: 'hashed123',
                jwt: 'jwt-token',
                admin: false,
                error: false,
                message: 'successful graphql op'
            });
        });

        it('should handle network errors', async () => {
            (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(fetchGraphQL('query { test }')).rejects.toThrow('Network error');
        });

        it('should handle JSON parsing errors', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
            });

            await expect(fetchGraphQL('query { test }')).rejects.toThrow('Invalid JSON');
        });
    });
});
