// src/viewModels/useUserViewModel.ts

// The ViewModel manages state and business logic, bridging the model and the view. 

import { useState, useEffect } from 'react';
import { UserModel } from '../models/UserModel';
import { User } from '../types/User';

export const useUserViewModel = (baseUrl: string, userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const userModel = new UserModel(baseUrl);

  const fetchUser = async () => {
    setLoading(true);
    const data = await userModel.fetchUser(userId);
    setUser(data);
    setLoading(false);
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
