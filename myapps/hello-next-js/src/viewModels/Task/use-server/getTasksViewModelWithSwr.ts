'use server'; 
import {
  swrFetcher, 
  getTasksDBRows as getTasksDBRowsTaskModel,
  deleteAllRows as deleteAllRowsTaskModel,
  seedTasksDB as seedTasksDBTaskModel,
  getRowFromId as getRowFromIdTaskModel,
  createRow as createRowTaskModel,
  updateRowFromId as updateRowFromIdTaskModel,
  deleteRowFromId as deleteRowFromIdTaskModel
} from '@/models/Task/use-server/TaskModel';
import type { Task } from '@/types/Task';
import { revalidateTag } from "next/cache";

const fnSignature = "use-server | view-model | getTasksViewModelWithSwr";
const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
}

export const fetcher = async (): Promise<Task[] | null> => {
    try {
      const result: Task[] | undefined = await swrFetcher();
      return result ?? null;
    } catch (error) {
      const errorMsg = await catchedErrorMessage("fetcher", error as Error);
      throw new Error(errorMsg);
    }
};

export const getTasksDBRows = async (): Promise<{ tasks: Task[] | null }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      const tasks: Task[] | undefined = await getTasksDBRowsTaskModel(`${BASE_URL}/api/tasks/v1/sql`);

      if (tasks) {
        // Revalidate the swr cache tag - this works with Next.js fetch cache
        revalidateTag("tasks-api-swr-tag");
      }
      return { tasks: tasks ?? null };
    } catch (error) {
      const errorMsg = await catchedErrorMessage("getTasksDBRows", error as Error);
      throw new Error(errorMsg);
    } 
};

export const deleteAllRows = async (): Promise<void> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      await deleteAllRowsTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
      
      // Revalidate the swr cache tag - this works with Next.js fetch cache
      revalidateTag("tasks-api-swr-tag");
    } catch (error) {
      const errorMsg = await catchedErrorMessage("deleteAllRows", error as Error);
      throw new Error(errorMsg);
    } 
};

export const seedTasksDB = async (): Promise<void> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      await seedTasksDBTaskModel(`${BASE_URL}/api/tasks/v1/sql`);

      // Revalidate the swr cache tag - this works with Next.js fetch cache
      revalidateTag("tasks-api-swr-tag");
    } catch (error) {
      const errorMsg = await catchedErrorMessage("seedTasksDB", error as Error);
      throw new Error(errorMsg);
    } 
};

export const getRowFromId = async (id: number): Promise<{ task: Task | null }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      const task: Task | null | undefined = await getRowFromIdTaskModel(id, `${BASE_URL}/api/tasks/v1/sql`);

      if (task) {
        // Revalidate the swr cache tag - this works with Next.js fetch cache
        revalidateTag("tasks-api-swr-tag");  
      }

      return { task: task ?? null };
    } catch (error) {
      const errorMsg = await catchedErrorMessage(`getRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    }
};

export const createRow = async (title: string, detail: string): Promise<void> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      await createRowTaskModel(title, detail, `${BASE_URL}/api/tasks/v1/sql`);
      
      // Revalidate the swr cache tag - this works with Next.js fetch cache
      revalidateTag("tasks-api-swr-tag");
    } catch (error) {
      const errorMsg = await catchedErrorMessage("createRow", error as Error);
      throw new Error(errorMsg);
    } 
};

export const updateRowFromId = async (id: number, title: string, detail: string, completed: boolean): Promise<void> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      await updateRowFromIdTaskModel(id, title, detail, completed, `${BASE_URL}/api/tasks/v1/sql`);
      
      // Revalidate the swr cache tag - this works with Next.js fetch cache
      revalidateTag("tasks-api-swr-tag");
    } catch (error) {
      const errorMsg = await catchedErrorMessage(`updateRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    }
};

export const deleteRowFromId = async (id: number): Promise<{ tasks: Task[] | null }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      await deleteRowFromIdTaskModel(id, `${BASE_URL}/api/tasks/v1/sql`);
      
      // Revalidate the swr cache tag - this works with Next.js fetch cache
      revalidateTag("tasks-api-swr-tag");  

      return { tasks: null };
    } catch (error) {
      const errorMsg = await catchedErrorMessage(`deleteRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    } 
};
