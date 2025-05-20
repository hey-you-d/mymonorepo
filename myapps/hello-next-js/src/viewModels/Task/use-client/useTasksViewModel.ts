'use client'; 
import { useState, useCallback, useMemo, useEffect } from 'react';
import { TaskModel } from '@/models/Task/use-client/TaskModel';
import { Task } from '@/types/Task';

export const useTaskViewModel = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Memoize userModel so it is created only once unless apiEndpoint changes
  const taskModel = useMemo(() => new TaskModel(), []);

  const getTasksDBRows = useCallback(async () => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.getTasksDBRows();
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
      const result: Task[] = await taskModel.deleteAllRows();
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
      const result: Task[] = await taskModel.seedTasksDB();
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
      const result: Task[] = await taskModel.getRowFromId(id);
      setTasks(result);
    } catch (error) {
      console.error(`Failed to get row for id ${id}:`, error);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  const createRow = useCallback(async (tasks: Task[], title: string, detail: string) => {
    setLoading(true);
    try {
      const result: Task[] = await taskModel.createRow(title, detail);
      
      const updatedTasksDescOrder = [result[0], ...tasks].sort((a, b) => b.id - a.id);

      setTasks(updatedTasksDescOrder);
    } catch (error) {
      console.error("Failed to create a new row in the db: ", error);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);

  //  TODO: refactor
  const updateRowFromId = useCallback(async (id: number, title: string, detail: string, completed: boolean) => {
    setLoading(true);
    try {
      await taskModel.updateRowFromId(id, title, detail, completed);
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
      await taskModel.deleteRowFromId(id);
      setTasks([]);
    } catch (error) {
      console.error(`Failed to delete row for id ${id}:`, error);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);
  
  // CSR approach -> first ever call of getTasksDBRows to populate the tasks array
  useEffect(() => {
    getTasksDBRows();
  }, [getTasksDBRows]);
  
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
