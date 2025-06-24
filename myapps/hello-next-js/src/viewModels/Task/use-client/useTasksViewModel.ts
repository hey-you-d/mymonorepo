'use client'; 
import { useState, useCallback, useMemo, useEffect } from 'react';
import { TaskModel } from '@/models/Task/use-client/TaskModel';
import type { Task } from '@/types/Task';

const fnSignature = "use-client | view-model | useTasksViewModel";
const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
}

export const useTaskViewModel = () => {
  const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Memoize userModel so it is created only once unless apiEndpoint changes
  const taskModel = useMemo(() => new TaskModel(), []);

  const getTasksDBRows = useCallback(async () => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.getTasksDBRows();
      setTasks(result);
    } catch (error) {
      const errorMsg = await catchedErrorMessage("getTasksDBRows", error as Error);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const deleteAllRows = useCallback(async () => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.deleteAllRows();
      setTasks(result);
    } catch (error) {
      const errorMsg = await catchedErrorMessage("deleteAllRows", error as Error);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);
  
  const seedTasksDB = useCallback(async () => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.seedTasksDB();
      setTasks(result);
    } catch (error) {
      const errorMsg = await catchedErrorMessage("seedTasksDB", error as Error);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const getRowFromId = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.getRowFromId(id);
      setTasks(result);
    } catch (error) {
      const errorMsg = await catchedErrorMessage(`getRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const createRow = useCallback(async (tasks: Task[], title: string, detail: string) => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.createRow(title, detail);
      setTasks([result[0], ...tasks]);
    } catch (error) {
      const errorMsg = await catchedErrorMessage("createRow", error as Error);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const updateRowFromId = useCallback(async (tasks: Task[], id: number, title: string, detail: string, completed: boolean) => {
    setLoading(true);
    try {
      const updatedRow: Task = await taskModel.updateRowFromId(id, title, detail, completed);

      const updatedTasks = tasks.map((item, index) => 
        tasks[index].id === updatedRow.id ? updatedRow : item
      );

      setTasks(updatedTasks);
    } catch (error) {
      const errorMsg = await catchedErrorMessage(`updateRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const deleteRowFromId = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await taskModel.deleteRowFromId(id);
      setTasks([]);
    } catch (error) {
      const errorMsg = await catchedErrorMessage(`deleteRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);
  
  // For reference: CSR approach -> first ever call of getTasksDBRows to populate the tasks array
  useEffect(() => {
    // For reference: only required to populate the data after inital page load (run once only)
    if (!tasks) {
      // For reference: Wrapping it in an async IIFE lets you await it and safely suppress any rejection.
      (async () => {
        try {
          await getTasksDBRows();
        } catch (err) {
          // For reference: Optional - already logged inside getTasksDBRows, so we don't need to log here
          // this try catch statement is needed to make this component to be unit-testable
        }
      })();
    }
  }, [tasks, getTasksDBRows]);

  return {
    tasks,
    loading,
    getTasksDBRows,
    seedTasksDB,
    deleteAllRows,
    createRow,
    getRowFromId,
    updateRowFromId,
    deleteRowFromId,
  };
};
