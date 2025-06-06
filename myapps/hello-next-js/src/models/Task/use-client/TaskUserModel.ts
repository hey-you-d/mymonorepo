"use client"
import { TASKS_BFF_BASE_API_URL } from "@/lib/app/common";
import { UserModelType } from "@/types/Task";

export class TaskUserModel {    
    constructor() {}

    async registerUser(email: string, password: string, overrideFetchUrl?: string): Promise<UserModelType | undefined> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}/`;
       
        const response = await fetch(`${finalUrl}/user/register`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TaskUserModel - Error registering a new user: ${response.status} - ${response.statusText}`, errorText);
            throw new Error(`TaskUserModel - Error registering a new user: ${response.status}`);
        }

        const result: UserModelType = await response.json();
        
        return result;
    }

    async loginUser(email: string, password: string, overrideFetchUrl?: string): Promise<UserModelType | undefined> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}/`;

        const response = await fetch(`${finalUrl}/user/lookout`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TaskUserModel - Error user login attempt: ${response.status} - ${response.statusText}`, errorText);
            throw new Error(`TaskUserModel - Error user login attempt: ${response.status}`);
        }

        const result: UserModelType = await response.json();
        
        return result;
    }

    async logoutUser(overrideFetchUrl?: string): Promise<UserModelType | undefined> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}/`;

        const response = await fetch(`${finalUrl}/user/logout`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TaskUserModel - Error user logout attempt: ${response.status} - ${response.statusText}`, errorText);
            throw new Error(`TaskUserModel - Error user logout attempt: ${response.status}`);
        }

        const result: UserModelType = await response.json();
        
        return result;
    }
}