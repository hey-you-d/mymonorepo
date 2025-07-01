'use client';
import { useMemo, useCallback } from 'react';
import { TaskModel, swrFetcher } from '@/models/Task/use-client/TaskModel';
import { catchedErrorMessage } from '@/lib/app/error';
import type { Task } from '@/types/Task';
import useSWR, { mutate, SWRConfiguration } from 'swr';

const fnSignature = "use-client | view-model | useTasksViewModelWithSwr";

const fetcher = async () => {
    return await swrFetcher();
    // alternatively...
    //const taskModel = new TaskModel();
    //const result: Task[] = await taskModel.getTasksDBRows();

    //return result;
};

export const useTaskViewModelWithSwr = () => {
  // Memoize the task model to ensure it's not recreated unnecessarily
  const taskModel = useMemo(() => new TaskModel(), []);

  // configure useSWR to retry only once after an error (like a 500 DB error) by using its onErrorRetry option
  const swrErrorRetry: SWRConfiguration['onErrorRetry'] = (
    error: Error, 
    key: string, 
    config: SWRConfiguration, 
    revalidate: (options: { retryCount: number }) => void, 
    { retryCount }: { retryCount: number }) => {
        const status = (error as Error & { status?: number }).status;
        if (status === 500 || retryCount >= 1) return;
        revalidate({ retryCount });
  }

  // Use SWR to automatically fetch tasks (no need to set up the tasks state, and loading state)
  const { data: tasks, error, isLoading } = useSWR<Task[]>("Tasks-API", fetcher, { onErrorRetry: swrErrorRetry });

  // Function to manually fetch tasks and trigger SWR cache update
  const getTasksDBRows = useCallback(async () => {
    try {
      const result: Task[] = await taskModel.getTasksDBRows();
      mutate("Tasks-API", result, false);  // Update SWR cache without refetching
    } catch (error) {
      mutate("Tasks-API", [], false); // Explicitly clear cache
      const errorMsg = await catchedErrorMessage(fnSignature, "getTasksDBRows", error as Error);
      throw new Error(errorMsg);
    }
  }, [taskModel]);

  // Function to delete all rows and update tasks in SWR cache
  const deleteAllRows = useCallback(async () => {
    try {
      const result: Task[] = await taskModel.deleteAllRows();
      mutate("Tasks-API", result, false);  // Update SWR cache
    } catch (error) {
      mutate("Tasks-API", [], false); // Explicitly clear cache
      const errorMsg = await catchedErrorMessage(fnSignature, "deleteAllRows", error as Error);
      throw new Error(errorMsg);
    }
  }, [taskModel]);

  // Function to seed tasks in DB and update SWR cache
  const seedTasksDB = useCallback(async () => {
    try {
      const result: Task[] = await taskModel.seedTasksDB();
      mutate("Tasks-API", result, false);  // Update SWR cache
    } catch (error) {
      mutate("Tasks-API", [], false); // Explicitly clear cache
      const errorMsg = await catchedErrorMessage(fnSignature, "seedTasksDB", error as Error);
      throw new Error(errorMsg);
    }
  }, [taskModel]);

  // Function to fetch a task by ID and update the tasks state
  const getRowFromId = useCallback(async (id: number) => {
    try {
      const result: Task[] = await taskModel.getRowFromId(id);
      mutate("Tasks-API", result, false);  // Update SWR cache
    } catch (error) {
      mutate("Tasks-API", [], false); // Explicitly clear cache
      const errorMsg = await catchedErrorMessage(fnSignature, "getRowFromId", error as Error);
      throw new Error(errorMsg);
    }
  }, [taskModel]);

  // Function to create a task and update SWR cache
  const createRow = useCallback(async (tasks: Task[], title: string, detail: string) => {
    try {
      const result: Task[] = await taskModel.createRow(title, detail);

      mutate("Tasks-API", [result[0], ...tasks], false);  // Update SWR cache
    } catch (error) {
      mutate("Tasks-API", [], false); // Explicitly clear cache
      const errorMsg = await catchedErrorMessage(fnSignature, "createRow", error as Error);
      throw new Error(errorMsg);
    }
  }, [taskModel]);

  // Function to update a task and update SWR cache
  const updateRowFromId = useCallback(async (tasks: Task[], id: number, title: string, detail: string, completed: boolean) => {
    try {
      const updatedRow: Task = await taskModel.updateRowFromId(id, title, detail, completed);

      const updatedTasks = tasks.map((item, index) => 
        tasks[index].id === updatedRow.id ? updatedRow : item
      );

      mutate("Tasks-API", updatedTasks, false);  // Update SWR cache
    } catch (error) {
      mutate("Tasks-API", [], false); // Explicitly clear cache
      const errorMsg = await catchedErrorMessage(fnSignature, `updateRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    }
  }, [taskModel]);

  // Function to delete a task and update SWR cache
  const deleteRowFromId = useCallback(async (id: number) => {
    try {
      await taskModel.deleteRowFromId(id);

      mutate("Tasks-API", [], false);  // Update SWR cache
    } catch (error) {
      mutate("Tasks-API", [], false); // Explicitly clear cache
      const errorMsg = await catchedErrorMessage(fnSignature, `deleteRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    }
  }, [taskModel]);

  // SSR approach -> initial table population will come for the server side via getServerSideProps
  // in pages/task-crud-fullstack/with-swr.tsx

  return {
    tasks,           // Managed by SWR
    loading: isLoading,  // Loading state from SWR
    error,           // Error state from SWR
    getTasksDBRows,  // Get all tasks
    seedTasksDB,     // Seed tasks function
    deleteAllRows,   // Delete all tasks function
    createRow,       // Create task function
    getRowFromId,    // Get task by ID function
    updateRowFromId, // Update task by ID function
    deleteRowFromId, // Delete task by ID function
  };
};
