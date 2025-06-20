"use client"
import { TASKS_BFF_BASE_API_URL } from "@/lib/app/common";
import { UserModelType } from "@/types/Task";

const headers = {
    "Content-Type": "application/json",
};

export class TaskUserModel {    
    constructor() {}

    async registerUser(email: string, password: string, overrideFetchUrl?: string): Promise<UserModelType | undefined> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}`;
       
        const response = await fetch(`${finalUrl}/user/register`, {
            method: 'POST',
            headers,
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
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

        const result: UserModelType | undefined = await response.json();
        
        return result;
    }

    async loginUser(email: string, password: string, overrideFetchUrl?: string): Promise<UserModelType | undefined> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}`;

        const response = await fetch(`${finalUrl}/user/lookup`, {
            method: 'POST',
            headers,
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
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

        const result: UserModelType | undefined = await response.json();

        return result;
    }

    async logoutUser(overrideFetchUrl?: string): Promise<UserModelType | undefined> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}`;

        const response = await fetch(`${finalUrl}/user/logout`, {
            method: 'GET',
            headers,
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TaskUserModel - Error user logout attempt: ${response.status} - ${response.statusText}`, errorText);
            throw new Error(`TaskUserModel - Error user logout attempt: ${response.status}`);
        }

        const result: UserModelType | undefined = await response.json();
        
        return result;
    }

    async checkAuthTokenCookieExist(overrideFetchUrl?: string): Promise<{ outcome: boolean, message: string }> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}`;

        const response = await fetch(`${finalUrl}/user/httpcookie`, {
            method: 'GET',
            headers,
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
        });

        if (!response.ok) {
            const errorText = await response.text();
            const errMessage = `TaskUserModel - Error check auth_token cookie attempt: ${response.status} - ${response.statusText} - ${errorText}`; 
            console.error(errMessage);
            throw new Error(errMessage);
        }

        const result: { outcome: boolean, message: string } = await response.json();
        
        return result;
    }
}
