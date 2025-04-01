// src/models/UserModel.js

// The Model manages the data and business logic of the app.

import { User } from '../types/User';

export class UserModel {
    private baseUrl: string;
    
    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
    }
  
    async fetchUser(userId: string) {
      try {
        const response = await fetch(`${this.baseUrl}/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            //console.error("Error fetching user data:", `${response.status} - ${response.statusText}`);
        }
        
        return await response.json() as User;
      } catch(error) {
        //console.error("Error fetching user data:", error);

        throw error;
      } 
    }
}