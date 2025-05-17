'use server'; 
import { useState, useCallback, useMemo, useEffect } from 'react';
import { TaskModel } from '@/app/models/Task/use-server/TaskModel';
import { Task } from '@/app/types/Task';
import { BASE_URL } from '@/lib/app/common';

export const getTaskViewModel = async () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Memoize userModel so it is created only once unless apiEndpoint changes
  const taskModel = useMemo(() => new TaskModel(), []);

  const getTasksDBRows = useCallback(async () => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.getTasksDBRows(`${BASE_URL}/api/tasks/v1/sql`);
      setTasks(result);
    } catch (error) {
      console.error("Failed to fetch tasks db rows:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const deleteAllRows = useCallback(async () => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.deleteAllRows(`${BASE_URL}/api/tasks/v1/sql`);
      setTasks(result);
    } catch (error) {
      console.error("Failed to delete tasks db rows:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);
  
  const seedTasksDB = useCallback(async () => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.seedTasksDB(`${BASE_URL}/api/tasks/v1/sql`);
      setTasks(result);
    } catch (error) {
      console.error("Failed to seed tasks db:", error);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const getRowFromId = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.getRowFromId(id, `${BASE_URL}/api/tasks/v1/sql`);
      setTasks(result);
    } catch (error) {
      console.error(`Failed to get row for id ${id}:`, error);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const createRow = useCallback(async (title: string, detail: string) => {
    setLoading(true);
    try {
      await taskModel.createRow(title, detail, `${BASE_URL}/api/tasks/v1/sql`);
      // then refresh the tasks state
      const result: Task[] = await taskModel.getTasksDBRows();
      setTasks(result);
    } catch (error) {
      console.error("Failed to create a new row in the db: ", error);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const updateRowFromId = useCallback(async (id: number, title: string, detail: string, completed: boolean) => {
    setLoading(true);
    try {
      await taskModel.updateRowFromId(id, title, detail, completed, `${BASE_URL}/api/tasks/v1/sql`);
      // then refresh the tasks state
      const result: Task[] = await taskModel.getTasksDBRows();
      setTasks(result);
    } catch (error) {
      console.error(`Failed to update row for id ${id}:`, error);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const deleteRowFromId = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await taskModel.deleteRowFromId(id, `${BASE_URL}/api/tasks/v1/sql`);
      setTasks([]);
    } catch (error) {
      console.error(`Failed to delete row for id ${id}:`, error);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);
  
  await getTasksDBRows();
  
  return {
    tasks,
    loading,
    seedTasksDB,
    deleteAllRows,
    createRow,
    getRowFromId,
    updateRowFromId,
    deleteRowFromId,
  };
};
