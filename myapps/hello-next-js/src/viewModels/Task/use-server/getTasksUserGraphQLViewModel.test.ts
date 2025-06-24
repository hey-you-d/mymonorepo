import { loginUser, registerUser } from './getTasksUserGraphQLViewModel';
import { fetchGraphQL } from '@/models/Task/use-server/TaskUserGraphqlClient';
import argon2 from 'argon2';
import {
  logoutUser,
  createAuthCookie,
  generateHashedPassword,
} from './getTasksUserViewModel';
import { generateJWT, getJwtSecret } from '@/lib/app/common';
// Mock all dependencies
jest.mock('../../../models/Task/use-server/TaskUserGraphqlClient');
jest.mock('argon2');
jest.mock('./getTasksUserViewModel');
jest.mock('../../../lib/app/common');

const mockFetchGraphQL = fetchGraphQL as jest.MockedFunction<typeof fetchGraphQL>;
const mockArgon2Verify = argon2.verify as jest.MockedFunction<typeof argon2.verify>;
const mockLogoutUser = logoutUser as jest.MockedFunction<typeof logoutUser>;
const mockCreateAuthCookie = createAuthCookie as jest.MockedFunction<typeof createAuthCookie>;
const mockGenerateHashedPassword = generateHashedPassword as jest.MockedFunction<typeof generateHashedPassword>;

const mockGenerateJWT = generateJWT as jest.MockedFunction<typeof generateJWT>;
const mockGetJwtSecret = getJwtSecret as jest.MockedFunction<typeof getJwtSecret>;

describe('GetTasksUserGraphQLViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loginUser', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockHashedPassword = 'hashed_password_123';
    const mockJwt = 'mock.jwt.token';

    it('should successfully login user with valid credentials', async () => {
      // Arrange
      const mockUserData = {
        email: mockEmail,
        password: mockHashedPassword,
        jwt: mockJwt,
        error: false,
        message: "successful operation",
      };
      
      mockFetchGraphQL.mockResolvedValueOnce(mockUserData);
      mockArgon2Verify.mockResolvedValueOnce(true);
      mockCreateAuthCookie.mockResolvedValueOnce(true);

      // Act
      const result = await loginUser(mockEmail, mockPassword);

      // Assert
      expect(mockFetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('query LookUpUser'),
        { email: mockEmail }
      );
      expect(mockArgon2Verify).toHaveBeenCalledWith(mockHashedPassword, mockPassword);
      expect(mockCreateAuthCookie).toHaveBeenCalledWith(mockJwt);
      expect(result).toBe(true);
    });

    it('should return false when user lookup has error', async () => {
      // Arrange
      const mockUserData = {
        message: "uh oh",
        error: true,
        email: "",
        password: "",
        jwt: ""
      };
      
      mockFetchGraphQL.mockResolvedValueOnce(mockUserData);

      // Act
      const result = await loginUser(mockEmail, mockPassword);

      // Assert
      expect(mockFetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('query LookUpUser'),
        { email: mockEmail }
      );
      expect(mockArgon2Verify).not.toHaveBeenCalled();
      expect(mockCreateAuthCookie).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when user data is incomplete', async () => {
      // Arrange
      const mockUserData = {
        email: mockEmail,
        // Missing password
        jwt: mockJwt,
        error: false,
        message: "",
      };
      
      mockFetchGraphQL.mockResolvedValueOnce(mockUserData);

      // Act
      const result = await loginUser(mockEmail, mockPassword);

      // Assert
      expect(mockArgon2Verify).not.toHaveBeenCalled();
      expect(mockCreateAuthCookie).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when password verification fails', async () => {
      // Arrange
      const mockUserData = {
        email: mockEmail,
        password: mockHashedPassword,
        jwt: mockJwt,
        error: false,
        message: ""
      };
      
      mockFetchGraphQL.mockResolvedValueOnce(mockUserData);
      mockArgon2Verify.mockResolvedValueOnce(false); // Wrong password

      // Act
      const result = await loginUser(mockEmail, mockPassword);

      // Assert
      expect(mockArgon2Verify).toHaveBeenCalledWith(mockHashedPassword, mockPassword);
      expect(mockCreateAuthCookie).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when JWT is missing after password verification', async () => {
      // Arrange
      const mockUserData = {
        email: mockEmail,
        password: mockHashedPassword,
        // Missing JWT
        error: false,
        message: "",
      };
      
      mockFetchGraphQL.mockResolvedValueOnce(mockUserData);
      mockArgon2Verify.mockResolvedValueOnce(true);

      // Act
      const result = await loginUser(mockEmail, mockPassword);

      // Assert
      expect(mockArgon2Verify).not.toHaveBeenCalled();
      expect(mockCreateAuthCookie).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should throw error when fetchGraphQL fails', async () => {
      // Arrange
      const mockError = new Error('GraphQL fetch failed');
      mockFetchGraphQL.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(loginUser(mockEmail, mockPassword)).rejects.toThrow('GraphQL fetch failed');
      expect(console.error).toHaveBeenCalledWith("use-server | view-model | getTasksUserGraphQLViewModel | loginUser | catched error: Error - GraphQL fetch failed");
    });   
  });
  
  describe('registerUser', () => {
    const mockEmail = 'newuser@example.com';
    const mockPassword = 'newpassword123';
    const mockHashedPassword = 'hashed_new_password_123';
    const mockJwt = 'new.jwt.token';
    const mockJwtSecret = 'super_secret_key';

    it('should successfully register a new user', async () => {
      // Arrange
      const mockLookupResult = { error: true, message: "user dont exist" }; // User doesn't exist
      const mockRegistrationResult = {
        jwt: mockJwt,
        error: false,
        message: "ok",
      };
      
      mockFetchGraphQL
        .mockResolvedValueOnce(mockLookupResult) // Lookup call
        .mockResolvedValueOnce(mockRegistrationResult); // Registration call
      mockGenerateHashedPassword.mockResolvedValueOnce(mockHashedPassword);
      mockGetJwtSecret.mockResolvedValueOnce({ jwtSecret: mockJwtSecret });
      mockGenerateJWT.mockResolvedValueOnce(mockJwt);
      mockCreateAuthCookie.mockResolvedValueOnce(true);

      // Act
      const result = await registerUser(mockEmail, mockPassword);

      // Assert
      expect(mockFetchGraphQL).toHaveBeenNthCalledWith(1,
        expect.stringContaining('query LookUpUser'),
        { email: mockEmail }
      );
      expect(mockGenerateHashedPassword).toHaveBeenCalledWith(mockPassword);
      expect(mockGetJwtSecret).toHaveBeenCalled();
      expect(mockGenerateJWT).toHaveBeenCalledWith(mockEmail, mockHashedPassword, mockJwtSecret);
      expect(mockFetchGraphQL).toHaveBeenNthCalledWith(2,
        expect.stringContaining('mutation RegisterUser'),
        { email: mockEmail, password: mockHashedPassword, jwt: mockJwt }
      );
      expect(mockCreateAuthCookie).toHaveBeenCalledWith(mockJwt);
      expect(result).toBe(true);
    });

    it('should return false when email already exists', async () => {
      // Arrange
      const mockExistingUser = {
        email: mockEmail,
        password: 'existing_password',
        jwt: 'existing_jwt',
        error: false,
        message: "ok",
      };
      
      mockFetchGraphQL.mockResolvedValueOnce(mockExistingUser);

      // Act
      const result = await registerUser(mockEmail, mockPassword);

      // Assert
      expect(mockFetchGraphQL).toHaveBeenCalledTimes(1);
      expect(mockGenerateHashedPassword).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when registration fails to return JWT', async () => {
      // Arrange
      const mockLookupResult = { error: true, message: "uh oh" }; // User doesn't exist
      const mockRegistrationResult = {
        // missing jwt
        error: false,
        message: "ok",
      };
      
      mockFetchGraphQL
        .mockResolvedValueOnce(mockLookupResult)
        .mockResolvedValueOnce(mockRegistrationResult);
      mockGenerateHashedPassword.mockResolvedValueOnce(mockHashedPassword);
      mockGetJwtSecret.mockResolvedValueOnce({ jwtSecret: mockJwtSecret });
      mockGenerateJWT.mockResolvedValueOnce(mockJwt);

      // Act
      const result = await registerUser(mockEmail, mockPassword);

      // Assert
      expect(mockCreateAuthCookie).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when registration returns empty JWT', async () => {
      // Arrange
      const mockLookupResult = { error: true, message: "" };
      const mockRegistrationResult = {
        jwt: '', // Empty JWT
        error: false,
        message: "not possible"
      };
      
      mockFetchGraphQL
        .mockResolvedValueOnce(mockLookupResult)
        .mockResolvedValueOnce(mockRegistrationResult);
      mockGenerateHashedPassword.mockResolvedValueOnce(mockHashedPassword);
      mockGetJwtSecret.mockResolvedValueOnce({ jwtSecret: mockJwtSecret });
      mockGenerateJWT.mockResolvedValueOnce(mockJwt);

      // Act
      const result = await registerUser(mockEmail, mockPassword);

      // Assert
      expect(mockCreateAuthCookie).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when cookie creation fails', async () => {
      // Arrange
      const mockLookupResult = { error: true, message: "" };
      const mockRegistrationResult = {
        jwt: mockJwt,
        error: false,
        message: "",
      };
      
      mockFetchGraphQL
        .mockResolvedValueOnce(mockLookupResult)
        .mockResolvedValueOnce(mockRegistrationResult);
      mockGenerateHashedPassword.mockResolvedValueOnce(mockHashedPassword);
      mockGetJwtSecret.mockResolvedValueOnce({ jwtSecret: mockJwtSecret });
      mockGenerateJWT.mockResolvedValueOnce(mockJwt);
      mockCreateAuthCookie.mockResolvedValueOnce(false); // Cookie creation failed

      // Act
      const result = await registerUser(mockEmail, mockPassword);

      // Assert
      expect(mockCreateAuthCookie).toHaveBeenCalledWith(mockJwt);
      expect(result).toBe(false);
    });

    it('should throw error and logout when user lookup during registration fails', async () => {
      // Arrange
      const mockError = new Error('Lookup failed during registration');
      mockFetchGraphQL.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(registerUser(mockEmail, mockPassword)).rejects.toThrow('Lookup failed during registration');
      expect(console.error).toHaveBeenCalledWith("use-server | view-model | getTasksUserGraphQLViewModel | registerUser -> lookupUserQuery | catched error: Error - Lookup failed during registration");
    });

    it('should throw error and logout when registration mutation fails', async () => {
      // Arrange
      const mockLookupResult = { error: true, message: "" };
      const mockError = new Error('Registration mutation failed');
      
      mockFetchGraphQL
        .mockResolvedValueOnce(mockLookupResult)
        .mockRejectedValueOnce(mockError);
      mockGenerateHashedPassword.mockResolvedValueOnce(mockHashedPassword);
      mockGetJwtSecret.mockResolvedValueOnce({ jwtSecret: mockJwtSecret });
      mockGenerateJWT.mockResolvedValueOnce(mockJwt);

      // Act & Assert
      await expect(registerUser(mockEmail, mockPassword)).rejects.toThrow('Registration mutation failed');
      expect(mockLogoutUser).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("use-server | view-model | getTasksUserGraphQLViewModel | registerUser | catched error: Error - Registration mutation failed");
    });

     it('should throw error and logout when password hashing fails', async () => {
      // Arrange
      const mockLookupResult = { error: true, message: "" };
      const mockError = new Error('Password hashing failed');
      
      mockFetchGraphQL.mockResolvedValueOnce(mockLookupResult);
      mockGenerateHashedPassword.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(registerUser(mockEmail, mockPassword)).rejects.toThrow('Password hashing failed');
    });

    it('should throw error and logout when JWT generation fails', async () => {
      // Arrange
      const mockLookupResult = { error: true, message: "" };
      const mockError = new Error('JWT generation failed');
      
      mockFetchGraphQL.mockResolvedValueOnce(mockLookupResult);
      mockGenerateHashedPassword.mockResolvedValueOnce(mockHashedPassword);
      mockGetJwtSecret.mockResolvedValueOnce({ jwtSecret: mockJwtSecret });
      mockGenerateJWT.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(registerUser(mockEmail, mockPassword)).rejects.toThrow('JWT generation failed');
    });
  });
});  
  