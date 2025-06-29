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
import { catchedErrorMessage } from '@/lib/app/error';
import type { Task } from '@/types/Task';
import { revalidateTag } from "next/cache";

const fnSignature = "use-server | view-model | getTasksViewModelWithSwr";

export const fetcher = async (): Promise<Task[] | null> => {
    try {
      const result: Task[] | undefined = await swrFetcher();
      return result ?? null;
    } catch (error) {
      const errorMsg = await catchedErrorMessage(fnSignature, "fetcher", error as Error);
      throw new Error(errorMsg);
    }
};

export const getTasksDBRows = async (): Promise<{ tasks: Task[] | null }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
    try {
      const tasks: Task[] | undefined = await getTasksDBRowsTaskModel(TASKS_SQL_BASE_API_URL);

      if (tasks) {
        // Revalidate the swr cache tag - this works with Next.js fetch cache
        revalidateTag("tasks-api-swr-tag");
      }
      return { tasks: tasks ?? null };
    } catch (error) {
      const errorMsg = await catchedErrorMessage(fnSignature, "getTasksDBRows", error as Error);
      throw new Error(errorMsg);
    } 
};

export const deleteAllRows = async (): Promise<void> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
    try {
      await deleteAllRowsTaskModel(TASKS_SQL_BASE_API_URL);
      
      // Revalidate the swr cache tag - this works with Next.js fetch cache
      revalidateTag("tasks-api-swr-tag");
    } catch (error) {
      const errorMsg = await catchedErrorMessage(fnSignature, "deleteAllRows", error as Error);
      throw new Error(errorMsg);
    } 
};

export const seedTasksDB = async (): Promise<void> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
    try {
      await seedTasksDBTaskModel(TASKS_SQL_BASE_API_URL);

      // Revalidate the swr cache tag - this works with Next.js fetch cache
      revalidateTag("tasks-api-swr-tag");
    } catch (error) {
      const errorMsg = await catchedErrorMessage(fnSignature, "seedTasksDB", error as Error);
      throw new Error(errorMsg);
    } 
};

export const getRowFromId = async (id: number): Promise<{ task: Task | null }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
    try {
      const task: Task | null | undefined = await getRowFromIdTaskModel(id, TASKS_SQL_BASE_API_URL);

      if (task) {
        // Revalidate the swr cache tag - this works with Next.js fetch cache
        revalidateTag("tasks-api-swr-tag");  
      }

      return { task: task ?? null };
    } catch (error) {
      const errorMsg = await catchedErrorMessage(fnSignature, `getRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    }
};

export const createRow = async (title: string, detail: string): Promise<void> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
    try {
      await createRowTaskModel(title, detail, TASKS_SQL_BASE_API_URL);
      
      // Revalidate the swr cache tag - this works with Next.js fetch cache
      revalidateTag("tasks-api-swr-tag");
    } catch (error) {
      const errorMsg = await catchedErrorMessage(fnSignature, "createRow", error as Error);
      throw new Error(errorMsg);
    } 
};

export const updateRowFromId = async (id: number, title: string, detail: string, completed: boolean): Promise<void> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
    try {
      await updateRowFromIdTaskModel(id, title, detail, completed, TASKS_SQL_BASE_API_URL);
      
      // Revalidate the swr cache tag - this works with Next.js fetch cache
      revalidateTag("tasks-api-swr-tag");
    } catch (error) {
      const errorMsg = await catchedErrorMessage(fnSignature, `updateRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    }
};

export const deleteRowFromId = async (id: number): Promise<{ tasks: Task[] | null }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { TASKS_SQL_BASE_API_URL } = await import("@/lib/app/common");
  
    try {
      await deleteRowFromIdTaskModel(id, TASKS_SQL_BASE_API_URL);
      
      // Revalidate the swr cache tag - this works with Next.js fetch cache
      revalidateTag("tasks-api-swr-tag");  

      return { tasks: null };
    } catch (error) {
      const errorMsg = await catchedErrorMessage(fnSignature, `deleteRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    } 
};
