"use server"
import { TASKS_API_HEADER } from "@/lib/app/common";
import { Task } from "@/types/Task";

export const swrFetcher = async (): Promise<Task[]> => {
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
          console.error("Error fetching all rows: ", `${response.status} - ${response.statusText}`);
          throw new Error(`Database Fetch failed: ${response.status} ${response.statusText}`);
      }
      const result:Task[] = await response.json();
  
      return result;
  } catch(error) {
      console.error("Error fetching all rows: ", error );
      
      throw error;
  }
}

export const getTasksDBRows = async (overrideFetchUrl?: string): Promise<Task[]> => {
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
        console.error("Error fetching all rows: ", `${response.status} - ${response.statusText}`);
        // If the response isn't OK, throw an error to be caught in the catch block
        throw new Error(`Error fetching all rows: ${response.status} ${response.statusText}`);
    }

    const result:Task[] = await response.json();
    return result;
  } catch(error) {
    console.error("Error fetching all rows: ", error );

    throw error;
  } 
}

export const deleteAllRows = async (overrideFetchUrl?: string): Promise<Task[]> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;

  try {
    const response = await fetch(`${finalUrl}/delete-rows`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(),
    });

    if (!response.ok) {
        const errorText = await response.text(); // <- Just read as text
        console.error("Error deleting DB Table rows: ", `${response.status} - ${response.statusText} - ${errorText}`);
        throw new Error(`Error deleting DB Table rows: ${response.status}`);
    }
    
    const result: Task[] = await response.json();
    return result;
  } catch(error) {
    console.error("Error deleting DB Table rows: ", error );

    throw error;
  } 
}

export const seedTasksDB = async (overrideFetchUrl?: string): Promise<Task[]> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  
  try {
    const response = await fetch(`${finalUrl}/seed-table`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(),
    });

    if (!response.ok) {
        const errorText = await response.text(); // <- Just read as text
        console.error("Error seeding tasks DB: ", `${response.status} - ${response.statusText} - ${errorText}`);
        throw new Error(`Error seeding tasks DB: ${response.status}`);
    }

    const result = await response.json();
    return result.rows;
  } catch(error) {
    console.error("Error seeding tasks DB: ", error );

    throw error;
  } 
}

export const getRowFromId = async (id: number, overrideFetchUrl?: string): Promise<Task | null> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  
  try {
    const response = await fetch(`${finalUrl}/${id}`, {
        method: 'GET',
        headers: await TASKS_API_HEADER(),
    });

    if (!response.ok) {
        if (response.status == 404) {
          return null;
        }
        const errorText = await response.text(); // <- Just read as text
        throw new Error(`Error fetching row: ${response.status} - ${response.statusText} - ${errorText}`);
      }

    const result: Task | null = await response.json();   
    return result;  
  } catch(error) {
    console.error(`Error fetching row for id ${id}: `, error );

    throw error;
  } 
}

export const createRow = async (title: string, detail: string, overrideFetchUrl?: string): Promise<Task[]> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  
  try {
    const response = await fetch(`${finalUrl}/create-row`, {
        method: 'POST',
        headers: await TASKS_API_HEADER(),
        body: JSON.stringify({
          title,
          detail
        }),
    });

    if (!response.ok) {
        const errorText = await response.text(); // <- Just read as text
        console.error(`Error creating row: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`Error creating row: ${response.status}`);
    }

    const result = await response.json();
    
    return result.rows satisfies Task[];
  } catch(error) {
    console.error("Error creating row: ", error );

    throw error;
  } 
}

export const updateRowFromId = async  (id: number, title: string, detail: string, completed: boolean, overrideFetchUrl?: string): Promise<Task> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
  
  try {
    const response = await fetch(`${finalUrl}/${id}`, {
        method: 'PUT',
        headers: await TASKS_API_HEADER(),
        body: JSON.stringify({
          title,
          detail,
          completed,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text(); // <- Just read as text
        console.error(`Error updating row for id ${id}: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`Error updating row: ${response.status}`);
    }

    const result = await response.json();

    return result;
  } catch(error) {
    console.error(`Error updating row for id ${id}: `, error );

    throw error;
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
  
  try {
    const response = await fetch(`${finalUrl}/${id}`, {
        method: 'DELETE',
        headers: await TASKS_API_HEADER(),
    });

    if (!response.ok) {
        const errorText = await response.text(); // <- Just read as text
        console.error(`Error deleting row for id ${id}: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`Error deleting row: ${response.status}`);
    }

    const result = await response.json();
    return result.rows;
  } catch(error) {
    console.error(`Error fetching row for id ${id}: `, error );

    throw error;
  } 
}

export const getJwt = async (overrideFetchUrl?: string): Promise<{jwtSecret: string}> => {
  // for reference:
  // "use server" should only be used in files that contain 
  // server actions (async functions for form handling, etc.), not in regular React components or utility files.
  const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
  // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
  // In this case, we must supply an absolute URL  
  const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;

  try {
    const response = await fetch(`${finalUrl}/jwt`, {
      method: 'GET',
      headers: await TASKS_API_HEADER(),
    });

    if (!response.ok) {
      console.error("Error: JWT Fetch failed: ", `${response.status} - ${response.statusText}`);
      // If the response isn't OK, throw an error to be caught in the catch block
      throw new Error(`Error: JWT Fetch failed: ${response.status} ${response.statusText}`);
    }

    const result:{ jwtSecret:string } = await response.json();
  
    return result;
  } catch(error) {
    console.error("Error fetching JWT: ", error );

    throw error;
  }
}
