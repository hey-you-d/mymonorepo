'use server'; 
import { TaskModel } from '@/models/Task/use-server/TaskModel';
import { Task } from '@/types/Task';
import { BASE_URL } from '@/lib/app/common';

export const getTasksDBRows = async () => {
    const taskModel = new TaskModel();

    try {
      const tasks: Task[] = await taskModel.getTasksDBRows(`${BASE_URL}/api/tasks/v1/sql`);
      return { tasks };
    } catch (error) {
      console.error("Failed to fetch tasks db rows:", error);
      throw error;
    } 
};

export const deleteAllRows = async () => {
    const taskModel = new TaskModel();
    
    try {
      await taskModel.deleteAllRows(`${BASE_URL}/api/tasks/v1/sql`);
    } catch (error) {
      console.error("Failed to delete tasks db rows:", error);
      throw error;
    } 
};

export const seedTasksDB = async () => {
    const taskModel = new TaskModel();
  
    try {
      await taskModel.seedTasksDB(`${BASE_URL}/api/tasks/v1/sql`);
      //const tasks: Task[] = await taskModel.seedTasksDB(`${BASE_URL}/api/tasks/v1/sql`);
      //return { tasks };
    } catch (error) {
      console.error("Failed to seed tasks db:", error);
      throw error;
    } 
};

export const getRowFromId = async (id: number) => {
    const taskModel = new TaskModel();
  
    try {
      const tasks: Task[] = await taskModel.getRowFromId(id, `${BASE_URL}/api/tasks/v1/sql`);
      return { tasks };
    } catch (error) {
      console.error(`Failed to get row for id ${id}:`, error);
      throw error;
    }
};

export const createRow = async (title: string, detail: string) => {
    try {
      await taskModel.createRow(title, detail, `${BASE_URL}/api/tasks/v1/sql`);
      // then refresh the tasks state
      await taskModel.getTasksDBRows();
      //const tasks: Task[] = await taskModel.getTasksDBRows();
      //return { tasks }
    } catch (error) {
      console.error("Failed to create a new row in the db: ", error);
      throw error;
    } 
};

export const updateRowFromId = async (id: number, title: string, detail: string, completed: boolean) => {
    try {
      await taskModel.updateRowFromId(id, title, detail, completed, `${BASE_URL}/api/tasks/v1/sql`);
      // then refresh the tasks state
      await taskModel.getTasksDBRows();
      //const tasks: Task[] = await taskModel.getTasksDBRows();
      //return { tasks };
    } catch (error) {
      console.error(`Failed to update row for id ${id}:`, error);
      throw error;
    }
};

export const deleteRowFromId = async (id: number) => {
    try {
      await taskModel.deleteRowFromId(id, `${BASE_URL}/api/tasks/v1/sql`);
    } catch (error) {
      console.error(`Failed to delete row for id ${id}:`, error);
      throw error;
    } 
};
