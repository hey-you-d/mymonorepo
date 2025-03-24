// src/app/views/container/userPage.ts

// The View connects the ViewModel and UI component.

import React from 'react';
import { useUserViewModel } from '../viewModels/useUserViewModel';
import { UserProfile } from '../components/UserProfile';
import { apiClient } from '../api/apiClient';

export const UserPage = ({ userId }: { userId: string }) => {
  const { user, loading, refreshUser } = useUserViewModel(apiClient, userId);

  if (loading) return <p>Loading...</p>;

  return <UserProfile user={user} onRefresh={refreshUser} /> ;
};
