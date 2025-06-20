"use client"
import { TASKS_BFF_BASE_API_URL } from "@/lib/app/common";
import { UserModelType } from "@/types/Task";

const headers = {
    "Content-Type": "application/json",
};

const fnSignature = "use-client | model | TaskUserModel";
export const notOkErrorMessage = async (fnName: string, response: Response) => {
    const errorMsg = `${fnSignature} | ${fnName} | not ok response: ${response.status} - ${response.statusText} `;
    console.error(errorMsg);
    return errorMsg;
}

export const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
} 

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
                const errorMsg = await notOkErrorMessage("registerUser", response);
                throw new Error(errorMsg);
            }

            const result: UserModelType | undefined = await response.json();
            
            return result;
        } catch(error) {
            const errorMsg = await catchedErrorMessage("registerUser", error as Error);
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
                const errorMsg = await notOkErrorMessage("loginUser", response);
                throw new Error(errorMsg);
            }

            const result: UserModelType | undefined = await response.json();

            return result;
        } catch(error) {
            const errorMsg = await catchedErrorMessage("loginUser", error as Error);
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
                const errorMsg = await notOkErrorMessage("logoutUser", response);
                throw new Error(errorMsg);
            }

            const result: UserModelType | undefined = await response.json();
            
            return result;
        } catch(error) {
            const errorMsg = await catchedErrorMessage("logoutUser", error as Error);
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
                const errorMsg = await notOkErrorMessage("checkAuthTokenCookieExist", response);
                throw new Error(errorMsg);
            }

            const result: { outcome: boolean, message: string } = await response.json();
            
            return result;
        } catch(error) {
            const errorMsg = await catchedErrorMessage("checkAuthTokenCookieExist", error as Error);
            throw new Error(errorMsg);
        }
    }
}
