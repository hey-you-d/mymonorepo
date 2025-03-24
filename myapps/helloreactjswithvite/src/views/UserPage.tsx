// src/views/container/userPage.ts

// The View connects the ViewModel and UI component.

import React from 'react';
import { useUserViewModel } from '../viewModels/useUserViewModel';
import { UserProfile } from '../components/UserProfile';

export const UserPage = ({ userId }: { userId: string }) => {
  //const baseURL: `https://${process.env.NEXT_PUBLIC_API_CLIENT_ID}.mockapi.io/api`;
  const baseURL = "https://67e0cf0458cc6bf78522f5a9.mockapi.io/api";
  const { user, loading, refreshUser } = useUserViewModel(baseURL, userId);

  if (loading) return <p>Loading...</p>;

  return <UserProfile user={user} onRefresh={refreshUser} /> ;
};
