import { UserModel } from './UserModel';
import { API_BASE_URL } from '../../constants/User';
import { User } from '../types/User';

global.fetch = jest.fn(); // Mock fetch globally

describe('UserModel', () => {
  const userModel = new UserModel(API_BASE_URL);

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls between tests
  });

  it('should fetch user data successfully', async () => {
    const mockUser: User = { name: 'John Doe', email: 'john@example.com', avatar: "abc", createdAt: "xyz" };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUser),
    });

    const result = await userModel.fetchUser('123');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/v1/users/123`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(mockUser);
  });

  it('should throw an error when fetch fails', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(userModel.fetchUser('999')).rejects.toThrow('response.json is not a function');
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/v1/users/999`, expect.any(Object));
  });

  it('should handle network errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network Error'));

    await expect(userModel.fetchUser('123')).rejects.toThrow('Network Error');

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
