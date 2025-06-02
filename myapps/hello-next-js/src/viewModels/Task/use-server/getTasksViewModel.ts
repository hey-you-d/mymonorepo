'use server'; 
import { 
  getTasksDBRows as getTasksDBRowsTaskModel,
  deleteAllRows as deleteAllRowsTaskModel,
  seedTasksDB as seedTasksDBTaskModel,
  getRowFromId as getRowFromIdTaskModel,
  createRow as createRowTaskModel,
  updateRowFromId as updateRowFromIdTaskModel,
  deleteRowFromId as deleteRowFromIdTaskModel
} from '@/models/Task/use-server/TaskModel';
import { Task } from '@/types/Task';
import { BASE_URL } from '@/lib/app/common';

export const getTasksDBRows = async (): Promise<{ tasks: Task[] }> => {
    try {
      const tasks: Task[] = await getTasksDBRowsTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
      return { tasks };
    } catch (error) {
      console.error("Failed to fetch tasks db rows:", error);
      throw error;
    } 
};

export const deleteAllRows = async (): Promise<{ tasks: Task[] }> => {
    try {
      const tasks: Task[] = await deleteAllRowsTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
      return { tasks: tasks };
    } catch (error) {
      console.error("Failed to delete tasks db rows:", error);
      throw error;
    } 
};

export const seedTasksDB = async (): Promise<{ tasks: Task[] }> => {
    try {
      const tasks: Task[] = await seedTasksDBTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
      return { tasks: tasks };
    } catch (error) {
      console.error("Failed to seed tasks db:", error);
      throw error;
    } 
};

export const getRowFromId = async (id: number): Promise<{ task: Task | null }> => {
    try {
      const task = await getRowFromIdTaskModel(id, `${BASE_URL}/api/tasks/v1/sql`);
      return { task: task };
    } catch (error) {
      console.error(`Failed to get row for id ${id}:`, error);
      throw error;
    }
};

export const createRow = async (tasks: Task[], title: string, detail: string): Promise<{ tasks: Task[] }> => {
    try {
      const result: Task[] = await createRowTaskModel(title, detail, `${BASE_URL}/api/tasks/v1/sql`);
      
      const updatedTasksDescOrder = [result[0], ...tasks].sort((a, b) => b.id - a.id);
      
      return { tasks: updatedTasksDescOrder }
    } catch (error) {
      console.error("Failed to create a new row in the db: ", error);
      throw error;
    } 
};

export const updateRowFromId = async (tasks: Task[], id: number, title: string, detail: string, completed: boolean): Promise<{ tasks: Task[] }> => {
    try {
      const updatedRow: Task = await updateRowFromIdTaskModel(id, title, detail, completed, `${BASE_URL}/api/tasks/v1/sql`);
      console.log("getTasksViewModel ", updatedRow);
      const updatedTasks = tasks.map((item, index) => 
        tasks[index].id === updatedRow.id ? updatedRow : item
      );

      return { tasks: updatedTasks };
    } catch (error) {
      console.error(`Failed to update row for id ${id}:`, error);
      throw error;
    }
};

export const deleteRowFromId = async (id: number): Promise<{ tasks: Task[] | null }> => {
    try {
      await deleteRowFromIdTaskModel(id, `${BASE_URL}/api/tasks/v1/sql`);
      // for reference: createRowTaskModel returns the a single task only (the deleted one), 
      // we need the updated tasks to rehydrate the client component
      //const tasks = await getTasksDBRowsTaskModel();
      return { tasks: null };
    } catch (error) {
      console.error(`Failed to delete row for id ${id}:`, error);
      throw error;
    } 
};
