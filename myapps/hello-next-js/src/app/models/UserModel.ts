// src/app/models/UserModel.js

// The Model manages the data and business logic of the app.

import { AxiosInstance } from 'axios';
import { User } from '../types/User';

export class UserModel {
    private apiClient: AxiosInstance;
    
    constructor(apiClient: AxiosInstance) {
      this.apiClient = apiClient;
    }
  
    async fetchUser(userId: string) {
      try {
        const response = await this.apiClient.get<User>(`/v1/users/${userId}`);

        return response.data;
      } catch(error) {
        //console.error("Error fetching user data:", error);

        throw error;
      } 
    }
}
