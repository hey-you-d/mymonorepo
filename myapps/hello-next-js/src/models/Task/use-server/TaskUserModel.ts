"use server"
import { TASKS_API_HEADER } from "@/lib/app/common";
import type { UserModelType } from '@/types/Task';

export const registerUser = async (email: string, password: string, jwt: string, overrideFetchUrl?: string): Promise<UserModelType> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  // JWT auth is not needed for the user registration process.
  // JWT will become accessible via cookie after successful registration.
  try {
    const response = await fetch(`${finalUrl}/user/register`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(),
        body: JSON.stringify({
          email,
          password,
          jwt,
        }),
    });

    if (!response.ok) {
      console.error(`user-server | TaskUserModel | Error registration attempt | response not OK: ${response.status} - ${response.statusText}`);
      throw new Error(`user-server | TaskUserModel | Error registration attempt | response not OK: ${response.status} ${response.statusText}`);
    }

    const result: UserModelType = await response.json();
    return result;
  } catch(error) {
    console.error(`user-server | TaskUserModel | Error registration attempt | unknown error: ${(error as Error).name} - ${(error as Error).message}`);
    throw new Error(`user-server | TaskUserModel | Error registration attempt | unknown error: ${(error as Error).name} - ${(error as Error).message}`);
  } 
}

export const logInUser = async (email: string, overrideFetchUrl?: string): Promise<UserModelType> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  // JWT auth is not needed for login process.
  // JWT will become accessible via cookie after successful login not before.
  try {
    const response = await fetch(`${finalUrl}/user/lookup`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(),
        body: JSON.stringify({
          email,
        }),
    });

    if (!response.ok) {
        console.error(`user-server | TaskUserModel | Error login attempt | response not OK: ${response.status} - ${response.statusText}`);
        throw new Error(`user-server | TaskUserModel | Error login attempt | response not OK: ${response.status} ${response.statusText}`);
    }

    const result: UserModelType = await response.json();
    return result;
  } catch(error) {
    console.error(`user-server | TaskUserModel | Error login attempt | unknown error: ${(error as Error).name} - ${(error as Error).message}`);
    throw new Error(`user-server | TaskUserModel | Error login attempt | unknown error: ${(error as Error).name} - ${(error as Error).message}`);
  } 
};

export const updateJwt = async (email: string, jwt: string, overrideFetchUrl?: string): Promise<UserModelType> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");

  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  try {
    const response = await fetch(`${finalUrl}/user/update-jwt`, {
        method: 'PATCH',
        headers: await TASKS_API_HEADER(), // part of the login process, JWT auth is not needed
        body: JSON.stringify({
            email,
            jwt,
        }),
        credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
    });
    
    if (!response.ok) {
        console.error(`user-server | TaskUserModel | Error replacing expired JWT | response not OK: ${response.status} - ${response.statusText}`);
        throw new Error(`user-server | TaskUserModel | Error replacing expired JWT | response not OK: ${response.status} ${response.statusText}`);
    } 

    const result: UserModelType = await response.json();
    return result;
  } catch(error) {
    console.error(`user-server | TaskUserModel | Error replacing expired JWT | unknown error: ${(error as Error).name} - ${(error as Error).message}`);
    throw new Error(`user-server | TaskUserModel | Error replacing expired JWT | unknown error: ${(error as Error).name} - ${(error as Error).message}`);
  } 
};
