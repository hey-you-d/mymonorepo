import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserViewModel } from './useUserViewModel';
import { UserModel } from '../models/UserModel';
import { API_BASE_URL } from '../../constants/User';
import { User } from '../types/User';

jest.mock('../models/UserModel'); // Mock UserModel

describe('useUserViewModel', () => {
  const mockUser: User = { name: 'John Doe', email: 'john@example.com', avatar: "abc", createdAt: "xyz" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user data successfully', async () => {
    (UserModel as jest.Mock).mockImplementation(() => ({
      fetchUser: jest.fn().mockResolvedValue(mockUser),
    }));

    const { result } = renderHook(() => useUserViewModel(API_BASE_URL, '123'));

    // Wait until loading is false
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('should allow refreshing user data', async () => {
    const fetchUserMock = jest.fn().mockResolvedValue(mockUser);

    (UserModel as jest.Mock).mockImplementation(() => ({
      fetchUser: fetchUserMock,
    }));

    const { result } = renderHook(() => useUserViewModel(API_BASE_URL, '123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.refreshUser(); // Call refresh function
    });

    await waitFor(() => expect(fetchUserMock).toHaveBeenCalledTimes(2));
  });

  it('should handle API errors gracefully', async () => {
    (UserModel as jest.Mock).mockImplementation(() => ({
      fetchUser: jest.fn().mockRejectedValue(new Error('API Error')),
    }));

    const { result } = renderHook(() => useUserViewModel(API_BASE_URL, '123'));

    await waitFor(() => expect(result.current.loading).toBe(true));

    expect(result.current.user).toBeNull(); // Should not set user on error
    expect(result.current.loading).toBe(true);
  });
});
