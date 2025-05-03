import { useMemo, useCallback, useEffect } from 'react';
import { TaskModel } from '../models/TaskModel';
import { Task } from '../types/Task';
import useSWR, { mutate } from 'swr';
import { TASKS_BFF_BASE_API_URL, DATA_FETCH_MODE } from "../../../constants/tasksBff";

const fetcher = async () => {
    console.log("URL ", TASKS_BFF_BASE_API_URL);
    try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            console.error("Error fetching all rows: ", `${response.status} - ${response.statusText}`);
        }

        const result:Task[] = await response.json();

        return result;
    } catch(error) {
        console.error("Error fetching all rows: ", error );

        throw error;
    } 
};

export const useTaskViewModelWithSwr = () => {
  // Memoize the task model to ensure it's not recreated unnecessarily
  const taskModel = useMemo(() => new TaskModel(), []);

  // Use SWR to automatically fetch tasks (no need to set up the tasks state, and loading state)
  const { data: tasks, error, isLoading } = useSWR<Task[]>("Tasks-API", fetcher);

  // Function to manually fetch tasks and trigger SWR cache update
  const getTasksDBRows = useCallback(async () => {
    try {
      const result: Task[] = await taskModel.getTasksDBRows();
      mutate("Tasks-API", result, false);  // Update SWR cache without refetching
    } catch (error) {
      console.error("Failed to fetch tasks db rows:", error);
      mutate("Tasks-API", [], false); // Explicitly clear cache
    }
  }, [taskModel]);

  // Function to delete all rows and update tasks in SWR cache
  const deleteAllRows = useCallback(async () => {
    try {
      const result: Task[] = await taskModel.deleteAllRows();
      mutate("Tasks-API", result, false);  // Update SWR cache
    } catch (error) {
      console.error("Failed to delete all tasks:", error);
      mutate("Tasks-API", [], false); // Explicitly clear cache
    }
  }, [taskModel]);

  // Function to seed tasks in DB and update SWR cache
  const seedTasksDB = useCallback(async () => {
    try {
      const result: Task[] = await taskModel.seedTasksDB();
      mutate("Tasks-API", result, false);  // Update SWR cache
    } catch (error) {
      console.error("Failed to seed tasks db:", error);
      mutate("Tasks-API", [], false); // Explicitly clear cache
    }
  }, [taskModel]);

  // Function to fetch a task by ID and update the tasks state
  const getRowFromId = useCallback(async (id: number) => {
    try {
      const result: Task[] = await taskModel.getRowFromId(id);
      mutate("Tasks-API", result, false);  // Update SWR cache
    } catch (error) {
      console.error(`Failed to get task for id ${id}:`, error);
      mutate("Tasks-API", [], false); // Explicitly clear cache
    }
  }, [taskModel]);

  // Function to create a task and update SWR cache
  const createRow = useCallback(async (title: string, detail: string) => {
    try {
      await taskModel.createRow(title, detail);
      const result: Task[] = await taskModel.getTasksDBRows();  // Get updated tasks
      mutate("Tasks-API", result, false);  // Update SWR cache
    } catch (error) {
      console.error("Failed to create a task:", error);
      mutate("Tasks-API", [], false); // Explicitly clear cache
    }
  }, [taskModel]);

  // Function to update a task and update SWR cache
  const updateRowFromId = useCallback(async (id: number, title: string, detail: string, completed: boolean) => {
    try {
      await taskModel.updateRowFromId(id, title, detail, completed);
      const result: Task[] = await taskModel.getTasksDBRows();  // Get updated tasks
      mutate("Tasks-API", result, false);  // Update SWR cache
    } catch (error) {
      console.error(`Failed to update task for id ${id}:`, error);
      mutate("Tasks-API", [], false); // Explicitly clear cache
    }
  }, [taskModel]);

  // Function to delete a task and update SWR cache
  const deleteRowFromId = useCallback(async (id: number) => {
    try {
      await taskModel.deleteRowFromId(id);
      const result: Task[] = await taskModel.getTasksDBRows();  // Get updated tasks
      mutate("Tasks-API", result, false);  // Update SWR cache
    } catch (error) {
      console.error(`Failed to delete task for id ${id}:`, error);
      mutate("Tasks-API", [], false); // Explicitly clear cache
    }
  }, [taskModel]);

  // first ever call of getTasksDBRows to populate the tasks array
  useEffect(() => {
    if (DATA_FETCH_MODE === "useEffect") {
      getTasksDBRows();
    }
  }, [getTasksDBRows]);

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
