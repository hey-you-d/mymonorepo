// src/app/viewModels/useUserViewModel.ts

// The ViewModel manages state and business logic, bridging the model and the view. 

import { AxiosInstance } from 'axios';
import { useState, useEffect } from 'react';
import { UserModel } from '../models/UserModel';
import { User } from '../types/User';

export const useUserViewModel = (apiClient: AxiosInstance, userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const userModel = new UserModel(apiClient);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await userModel.fetchUser(userId);
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null); // Ensure user is set to null on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return {
    user,
    loading,
    refreshUser: fetchUser
  };
};
