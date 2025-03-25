// src/components/UserProfile.js

// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.

import { MouseEventHandler } from 'react';
import { User } from '../types/User';

export const UserProfile = ({ user, onRefresh } : { user: User | null, onRefresh: MouseEventHandler<HTMLButtonElement> }) => {
  return user ? (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Avatar: {user.avatar}</p>
      <p>Created At: {user.createdAt}</p>
      <button onClick={onRefresh}>Refresh</button>
    </div>
  ) : (
    <p>Oops, user info not found</p>
  )
};
