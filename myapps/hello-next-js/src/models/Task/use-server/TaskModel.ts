"use server"
import { cookies } from 'next/headers';
import { TASKS_API_HEADER, JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";
import { Task } from "@/types/Task";
import { notOkErrorMessage, catchedErrorMessage } from '@/lib/app/error';

const fnSignature = "use-server | model | TaskModel";
 
export const swrFetcher = async (): Promise<Task[] | undefined> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  try {
      const response = await fetch(`${TASKS_SQL_BASE_API_URL}/`, {
          method: 'GET',
          headers: await TASKS_API_HEADER(),
          next: { tags: ["tasks-api-swr-tag"] }, // for the swr's mutate fn - to facilitate client and server comm 
      });

      if (!response.ok) {
        const errorMsg = await notOkErrorMessage(fnSignature, "swrFetcher", response);
        throw new Error(errorMsg);
      }
      const result:Task[] = await response.json();
  
      return result;
  } catch(error) {
      const errorMsg = await catchedErrorMessage(fnSignature, "swrFetcher", error as Error);
      throw new Error(errorMsg);
  }
}

export const getTasksDBRows = async (overrideFetchUrl?: string): Promise<Task[] | undefined> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;

  try {
    const response = await fetch(`${finalUrl}/`, {
        method: 'GET',
        headers: await TASKS_API_HEADER(),
    });

    if (!response.ok) {
        const errorMsg = await notOkErrorMessage(fnSignature, "getTasksDBRows", response);
        throw new Error(errorMsg);
    }

    const result:Task[] = await response.json();
    return result;
  } catch(error) {
    const errorMsg = await catchedErrorMessage(fnSignature, "getTasksDBRows", error as Error);
    throw new Error(errorMsg);
  } 
}

export const deleteAllRows = async (overrideFetchUrl?: string): Promise<Task[] | undefined> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  const cookieStore = await cookies();
  const reqCookie = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
  try {
    const response = await fetch(`${finalUrl}/delete-rows`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(reqCookie?.value ?? ""),
    });

    if (!response.ok) {
        const errorMsg = await notOkErrorMessage(fnSignature, "deleteAllRows", response);
        throw new Error(errorMsg);
    }
    
    const result: Task[] = await response.json();
    return result;
  } catch(error) {
    const errorMsg = await catchedErrorMessage(fnSignature, "deleteAllRows", error as Error);
    throw new Error(errorMsg);
  } 
}

export const seedTasksDB = async (overrideFetchUrl?: string): Promise<Task[] | undefined> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  const cookieStore = await cookies();
  const reqCookie = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
  try {
    const response = await fetch(`${finalUrl}/seed-table`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(reqCookie?.value ?? ""),
    });

    if (!response.ok) {
        const errorMsg = await notOkErrorMessage(fnSignature, "seedTasksDB", response);
        throw new Error(errorMsg);
    }

    const result = await response.json();
    return result.rows;
  } catch(error) {
    const errorMsg = await catchedErrorMessage(fnSignature, "seedTasksDB", error as Error);
    throw new Error(errorMsg);
  } 
}

export const getRowFromId = async (id: number, overrideFetchUrl?: string): Promise<Task | null | undefined> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  const cookieStore = await cookies();
  const reqCookie = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
  try {
    const response = await fetch(`${finalUrl}/${id}`, {
        method: 'GET',
        headers: await TASKS_API_HEADER(reqCookie?.value ?? ""),
    });

    if (!response.ok) {
        if (response.status == 404) {
          return null;
        }
        const errorMsg = await notOkErrorMessage(fnSignature, "getRowFromId", response);
        throw new Error(errorMsg);
      }

    const result: Task | null = await response.json();   
    return result;  
  } catch(error) {
    const errorMsg = await catchedErrorMessage(fnSignature, "getRowFromId", error as Error);
    throw new Error(errorMsg);
  } 
}

export const createRow = async (title: string, detail: string, overrideFetchUrl?: string): Promise<Task[] | undefined> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  const cookieStore = await cookies();
  const reqCookie = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
  try {
    const response = await fetch(`${finalUrl}/create-row`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(reqCookie?.value ?? ""),
        body: JSON.stringify({
          title,
          detail
        }),
    });

    if (!response.ok) {
        const errorMsg = await notOkErrorMessage(fnSignature, "createRow", response);
        throw new Error(errorMsg);
    }

    const result = await response.json();
    
    return result.rows satisfies Task[];
  } catch(error) {
    const errorMsg = await catchedErrorMessage(fnSignature, "createRow", error as Error);
    throw new Error(errorMsg);
  } 
}

export const updateRowFromId = async  (id: number, title: string, detail: string, completed: boolean, overrideFetchUrl?: string): Promise<Task | undefined> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  const cookieStore = await cookies();
  const reqCookie = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
  try {
    const response = await fetch(`${finalUrl}/${id}`, {
        method: 'PUT',
        headers: await TASKS_API_HEADER(reqCookie?.value ?? ""),
        body: JSON.stringify({
          title,
          detail,
          completed,
        }),
    });

    if (!response.ok) {
        const errorMsg = await notOkErrorMessage(fnSignature, "updateRowFromId", response);
        throw new Error(errorMsg);
    }

    const result = await response.json();

    return result;
  } catch(error) {
    const errorMsg = await catchedErrorMessage(fnSignature, "updateRowFromId", error as Error);
    throw new Error(errorMsg);
  } 
}

export const deleteRowFromId = async (id: number, overrideFetchUrl?: string): Promise<void> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  const cookieStore = await cookies();
  const reqCookie = cookieStore.get(JWT_TOKEN_COOKIE_NAME);
  try {
    const response = await fetch(`${finalUrl}/${id}`, {
        method: 'DELETE',
        headers: await TASKS_API_HEADER(reqCookie?.value ?? ""),
    });

    if (!response.ok) {
        const errorMsg = await notOkErrorMessage(fnSignature, "deleteRowFromId", response);
        throw new Error(errorMsg);
    }

    const result = await response.json();
    return result.rows;
  } catch(error) {
    const errorMsg = await catchedErrorMessage(fnSignature, "deleteRowFromId", error as Error);
    throw new Error(errorMsg);
  } 
}
