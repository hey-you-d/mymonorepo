// src/viewModels/useUserViewModel.ts

// The ViewModel manages state and business logic, bridging the model and the view. 

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserModel } from '../models/UserModel';
import { User } from '../types/User';

export const useUserViewModel = (baseUrl: string, userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Memoize userModel so it is created only once unless apiClient changes
  const userModel = useMemo(() => new UserModel(baseUrl), [baseUrl]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userModel.fetchUser(userId);
      setUser(data);
    } catch (error) {
      //console.error("Failed to fetch user:", error);
      setUser(null); // Ensure user is set to null on failure
    } finally {
      setLoading(false);
    }
  }, [userId, userModel]);

  useEffect(() => {
    fetchUser();
  }, [userId, fetchUser]);

  return {
    user,
    loading,
    refreshUser: fetchUser
  };
};
