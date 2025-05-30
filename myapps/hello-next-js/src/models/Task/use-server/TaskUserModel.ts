"use server"
import { TASKS_SQL_BASE_API_URL, TASKS_API_HEADER } from "@/lib/app/common";
import { UserModelType } from '@/types/Task';

export const registerUser = async (email: string, password: string, jwt: string, overrideFetchUrl?: string): Promise<UserModelType> => {
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;

  try {
    const response = await fetch(`${finalUrl}/`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(),
        body: JSON.stringify({
          email,
          password,
          jwt,
        }),
    });

    if (!response.ok) {
        console.error("Error registering user credential in DB: ", `${response.status} - ${response.statusText}`);
        // If the response isn't OK, throw an error to be caught in the catch block
        throw new Error(`Error registering user credential in DB: ${response.status} ${response.statusText}`);
    }

    const result: UserModelType = await response.json();
    return result;
  } catch(error) {
    console.error("Error registering user credential in DB: ", error );

    throw error;
  } 
}