// src/views/container/userPage.ts

// The View connects the ViewModel and UI component.
import { useUserViewModel } from '../viewModels/useUserViewModel';
import { UserProfile } from '../components/UserProfile';
import { API_BASE_URL } from '../../constants/User';

export const UserPage = ({ userId }: { userId: string }) => {
  //const baseURL: `https://${process.env.NEXT_PUBLIC_API_CLIENT_ID}.mockapi.io/api`;
  const { user, loading, refreshUser } = useUserViewModel(API_BASE_URL, userId);
  console.log("USER PAGE ", userId);
  if (loading) return <p>Loading...</p>;

  return <UserProfile user={user} onRefresh={refreshUser} /> ;
};
