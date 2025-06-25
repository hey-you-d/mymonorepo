"use client"
import { TASKS_BFF_BASE_API_URL } from "@/lib/app/common";
import { UserModelType } from "@/types/Task";
import { notOkErrorMessage, catchedErrorMessage } from "@/lib/app/error";

const headers = {
    "Content-Type": "application/json",
};

const fnSignature = "use-client | model | TaskUserModel";

export class TaskUserModel {    
    constructor() {}

    async registerUser(email: string, password: string, overrideFetchUrl?: string): Promise<UserModelType | undefined> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}`;
        try {
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
                const errorMsg = await notOkErrorMessage(fnSignature, "registerUser", response);
                throw new Error(errorMsg);
            }

            const result: UserModelType | undefined = await response.json();
            
            return result;
        } catch(error) {
            const errorMsg = await catchedErrorMessage(fnSignature, "registerUser", error as Error);
            throw new Error(errorMsg);
        }
    }

    async loginUser(email: string, password: string, overrideFetchUrl?: string): Promise<UserModelType | undefined> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}`;

        try {
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
                const errorMsg = await notOkErrorMessage(fnSignature, "loginUser", response);
                throw new Error(errorMsg);
            }

            const result: UserModelType | undefined = await response.json();

            return result;
        } catch(error) {
            const errorMsg = await catchedErrorMessage(fnSignature, "loginUser", error as Error);
            throw new Error(errorMsg);
        }
    }

    async logoutUser(overrideFetchUrl?: string): Promise<UserModelType | undefined> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}`;

        try {
            const response = await fetch(`${finalUrl}/user/logout`, {
                method: 'GET',
                headers,
                credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
            });

            if (!response.ok) {
                const errorMsg = await notOkErrorMessage(fnSignature, "logoutUser", response);
                throw new Error(errorMsg);
            }

            const result: UserModelType | undefined = await response.json();
            
            return result;
        } catch(error) {
            const errorMsg = await catchedErrorMessage(fnSignature, "logoutUser", error as Error);
            throw new Error(errorMsg);
        }
    }

    async checkAuthTokenCookieExist(overrideFetchUrl?: string): Promise<{ outcome: boolean, message: string }> {
        // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
        // In this case, we must supply an absolute URL  
        const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}`;

        try {
            const response = await fetch(`${finalUrl}/user/httpcookie`, {
                method: 'GET',
                headers,
                credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
            });

            if (!response.ok) {
                const errorMsg = await notOkErrorMessage(fnSignature, "checkAuthTokenCookieExist", response);
                throw new Error(errorMsg);
            }

            const result: { outcome: boolean, message: string } = await response.json();
            
            return result;
        } catch(error) {
            const errorMsg = await catchedErrorMessage(fnSignature, "checkAuthTokenCookieExist", error as Error);
            throw new Error(errorMsg);
        }
    }
}
