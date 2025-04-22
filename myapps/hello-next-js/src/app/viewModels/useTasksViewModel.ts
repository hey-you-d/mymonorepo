// The ViewModel manages state and business logic, bridging the model and the view. 
import { useState, useCallback, useMemo, useEffect } from 'react';
import { TaskModel } from '../models/TaskModel';
import { Task } from '../types/Task';

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
      await taskModel.seedTasksDB();
    } catch (error) {
      console.error("Failed to seed tasks db:", error);
    } finally {
      setLoading(false);
    }
  }, [taskModel]);
  
  useEffect(() => {
    getTasksDBRows();
  }, [getTasksDBRows]);
  
  return {
    tasks,
    loading,
    seedTasksDB,
    getTasksDBRows,
    deleteAllRows
  };
};
