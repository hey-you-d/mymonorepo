import { renderHook, waitFor, act } from '@testing-library/react';
import { useUserViewModel } from './useUserViewModel';
import { AxiosInstance } from 'axios';

const resolvedOutput = {
    name: "Yudiman Kwanmas",
    email: "kwanmas.yudiman@outlook.com",
    avatars: "https://myavatar.com/yudimankwanmas",
    createdAt: "2025-03-24"
};

jest.mock("../models/UserModel", () => {
    return {
        UserModel: jest.fn().mockImplementation(() => {
            return {
                fetchUser: jest.fn().mockResolvedValue(resolvedOutput),
            }
        })
    }
});

describe("useUserViewModel", () => {
    it("fetches and sets user data", async () => {
        const mockApiClient: AxiosInstance = {} as AxiosInstance;
        
        const { result } = renderHook(() => useUserViewModel(mockApiClient, "1"));

        // initial loading state
        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBe(null);

        // wait for data to be fetched & state to update
        //await waitFor(() => {
            // after update, verify that user data is set and loading is false
            //expect(result.current.user).toEqual(resolvedOutput);
        //});

        await act(async () => {
            await Promise.resolve();
        });
        
        // after update, verify that user data is set and loading is false
        expect(result.current.user).toEqual(resolvedOutput);
    });
});
