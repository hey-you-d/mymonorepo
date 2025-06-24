"use server"
import { cookies } from 'next/headers';
import { TASKS_API_HEADER, JWT_TOKEN_COOKIE_NAME } from "@/lib/app/common";
import { Task } from "@/types/Task";

const fnSignature = "use-server | model | TaskModel";
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
        const errorMsg = await notOkErrorMessage("swrFetcher", response);
        throw new Error(errorMsg);
      }
      const result:Task[] = await response.json();
  
      return result;
  } catch(error) {
      const errorMsg = await catchedErrorMessage("swrFetcher", error as Error);
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
        const errorMsg = await notOkErrorMessage("getTasksDBRows", response);
        throw new Error(errorMsg);
    }

    const result:Task[] = await response.json();
    return result;
  } catch(error) {
    const errorMsg = await catchedErrorMessage("getTasksDBRows", error as Error);
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
        const errorMsg = await notOkErrorMessage("deleteAllRows", response);
        throw new Error(errorMsg);
    }
    
    const result: Task[] = await response.json();
    return result;
  } catch(error) {
    const errorMsg = await catchedErrorMessage("deleteAllRows", error as Error);
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
        const errorMsg = await notOkErrorMessage("seedTasksDB", response);
        throw new Error(errorMsg);
    }

    const result = await response.json();
    return result.rows;
  } catch(error) {
    const errorMsg = await catchedErrorMessage("seedTasksDB", error as Error);
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
        const errorMsg = await notOkErrorMessage("getRowFromId", response);
        throw new Error(errorMsg);
      }

    const result: Task | null = await response.json();   
    return result;  
  } catch(error) {
    const errorMsg = await catchedErrorMessage("getRowFromId", error as Error);
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
        const errorMsg = await notOkErrorMessage("createRow", response);
        throw new Error(errorMsg);
    }

    const result = await response.json();
    
    return result.rows satisfies Task[];
  } catch(error) {
    const errorMsg = await catchedErrorMessage("createRow", error as Error);
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
        const errorMsg = await notOkErrorMessage("updateRowFromId", response);
        throw new Error(errorMsg);
    }

    const result = await response.json();

    return result;
  } catch(error) {
    const errorMsg = await catchedErrorMessage("updateRowFromId", error as Error);
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
        const errorMsg = await notOkErrorMessage("deleteRowFromId", response);
        throw new Error(errorMsg);
    }

    const result = await response.json();
    return result.rows;
  } catch(error) {
    const errorMsg = await catchedErrorMessage("deleteRowFromId", error as Error);
    throw new Error(errorMsg);
  } 
}
