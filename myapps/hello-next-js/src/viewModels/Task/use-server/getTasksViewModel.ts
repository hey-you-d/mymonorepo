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
      console.log("VIEWMODEL getRowFromId ", id, task);
      return { task: task };
    } catch (error) {
      console.error(`Failed to get row for id ${id}:`, error);
      throw error;
    }
};

export const createRow = async (title: string, detail: string): Promise<{ tasks: Task[] }> => {
    try {
      await createRowTaskModel(title, detail, `${BASE_URL}/api/tasks/v1/sql`);
      // for reference: createRowTaskModel returns the a single task only (the newly created one), 
      // we need the updated tasks to rehydrate the client component
      const tasks: Task[] = await getTasksDBRowsTaskModel();
      return { tasks }
    } catch (error) {
      console.error("Failed to create a new row in the db: ", error);
      throw error;
    } 
};

export const updateRowFromId = async (id: number, title: string, detail: string, completed: boolean): Promise<{ tasks: Task[] }> => {
    try {
      await updateRowFromIdTaskModel(id, title, detail, completed, `${BASE_URL}/api/tasks/v1/sql`);
      // for reference: createRowTaskModel returns the a single task only (the newly updated one), 
      // we need the updated tasks to rehydrate the client component
      const tasks: Task[] = await getTasksDBRowsTaskModel();
      return { tasks };
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
      //console.log("VIEWMODEL - delete row - ", tasks);
      return { tasks: null };
    } catch (error) {
      console.error(`Failed to delete row for id ${id}:`, error);
      throw error;
    } 
};
