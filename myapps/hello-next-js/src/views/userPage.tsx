'use client';
// The View connects the ViewModel and UI component.
import React from 'react';
import { useUserViewModel } from '../viewModels/useUserViewModel';
import { UserProfile } from '../components/UserProfile';
import axios, { AxiosInstance } from 'axios';

// for reference: can be moved into a separate module
const apiClient: AxiosInstance = axios.create({
  //baseURL: `https://${process.env.NEXT_PUBLIC_API_CLIENT_ID}.mockapi.io/api`,
  baseURL: "https://67e0cf0458cc6bf78522f5a9.mockapi.io/api",
  timeout: 5000,
  headers: {
      "Content-Type": "application/json"
  }
});

export const UserPage = ({ userId }: { userId: string }) => {
  const { user, loading, refreshUser } = useUserViewModel(apiClient, userId);

  if (loading) return <p>Loading...</p>;

  return <UserProfile user={user} onRefresh={refreshUser} /> ;
};
