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

export const getTasksDBRows = async () => {
    try {
      const tasks: Task[] = await getTasksDBRowsTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
      return { tasks };
    } catch (error) {
      console.error("Failed to fetch tasks db rows:", error);
      throw error;
    } 
};

export const deleteAllRows = async () => {
    try {
      await deleteAllRowsTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
    } catch (error) {
      console.error("Failed to delete tasks db rows:", error);
      throw error;
    } 
};

export const seedTasksDB = async () => {
    try {
      await seedTasksDBTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
      //const tasks: Task[] = await seedTasksDBTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
      //return { tasks };
    } catch (error) {
      console.error("Failed to seed tasks db:", error);
      throw error;
    } 
};

export const getRowFromId = async (id: number) => {
    try {
      const tasks: Task[] = await getRowFromIdTaskModel(id, `${BASE_URL}/api/tasks/v1/sql`);
      return { tasks };
    } catch (error) {
      console.error(`Failed to get row for id ${id}:`, error);
      throw error;
    }
};

export const createRow = async (title: string, detail: string) => {
    try {
      await createRowTaskModel(title, detail, `${BASE_URL}/api/tasks/v1/sql`);
      // then refresh the tasks state
      await getTasksDBRowsTaskModel();
      //const tasks: Task[] = await getTasksDBRowsTaskModel();
      //return { tasks }
    } catch (error) {
      console.error("Failed to create a new row in the db: ", error);
      throw error;
    } 
};

export const updateRowFromId = async (id: number, title: string, detail: string, completed: boolean) => {
    try {
      await updateRowFromIdTaskModel(id, title, detail, completed, `${BASE_URL}/api/tasks/v1/sql`);
      // then refresh the tasks state
      await getTasksDBRowsTaskModel();
      //const tasks: Task[] = await taskModel.getTasksDBRows();
      //return { tasks };
    } catch (error) {
      console.error(`Failed to update row for id ${id}:`, error);
      throw error;
    }
};

export const deleteRowFromId = async (id: number) => {
    try {
      await deleteRowFromIdTaskModel(id, `${BASE_URL}/api/tasks/v1/sql`);
    } catch (error) {
      console.error(`Failed to delete row for id ${id}:`, error);
      throw error;
    } 
};
