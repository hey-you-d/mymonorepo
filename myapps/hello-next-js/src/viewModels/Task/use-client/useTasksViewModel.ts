'use client'; 
import { useState, useCallback, useMemo, useEffect } from 'react';
import { TaskModel } from '@/models/Task/use-client/TaskModel';
import { Task } from '@/types/Task';

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
      setTasks(tasks);
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
      setTasks([]);
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
      setTasks([]);
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
      console.error("Failed to create a new row in the db: ", error);
      setTasks(tasks);
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
      console.error(`Failed to update row for id ${id}:`, error);
      setTasks(tasks);
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
      setTasks(tasks);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);
  
  // CSR approach -> first ever call of getTasksDBRows to populate the tasks array
  useEffect(() => {
    // only required to populate the data after inital page load (run once only)
    if (!tasks) {
      getTasksDBRows();
    }
  }, [tasks, getTasksDBRows]);
  
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
