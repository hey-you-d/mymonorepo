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
import type { Task } from '@/types/Task';

const fnSignature = "use-server | view-model | getTasksViewModel";
const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
}

export const getTasksDBRows = async (): Promise<{ tasks: Task[] }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      const tasks: Task[] | undefined = await getTasksDBRowsTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
      return { tasks: tasks ?? [] };
    } catch (error) {
      const errorMsg = await catchedErrorMessage("getTasksDBRows", error as Error);
      throw new Error(errorMsg);
    } 
};

export const deleteAllRows = async (): Promise<{ tasks: Task[] }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      const tasks: Task[] | undefined = await deleteAllRowsTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
      return { tasks: tasks ?? [] };
    } catch (error) {
      const errorMsg = await catchedErrorMessage("deleteAllRows", error as Error);
      throw new Error(errorMsg);
    } 
};

export const seedTasksDB = async (): Promise<{ tasks: Task[] }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      const tasks: Task[] | undefined = await seedTasksDBTaskModel(`${BASE_URL}/api/tasks/v1/sql`);
      return { tasks: tasks ?? [] };
    } catch (error) {
      const errorMsg = await catchedErrorMessage("seedTasksDB", error as Error);
      throw new Error(errorMsg);
    } 
};

export const getRowFromId = async (id: number): Promise<{ task: Task | null }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      const task: Task | null | undefined = await getRowFromIdTaskModel(id, `${BASE_URL}/api/tasks/v1/sql`);
      
      return { task: task ?? null };
    } catch (error) {
      const errorMsg = await catchedErrorMessage(`getRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    }
};

export const createRow = async (tasks: Task[], title: string, detail: string): Promise<{ tasks: Task[] }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      const result: Task[] | undefined = await createRowTaskModel(title, detail, `${BASE_URL}/api/tasks/v1/sql`);
      
      const updatedTasksDescOrder = result ? [result[0], ...tasks].sort((a, b) => b.id - a.id) : [];
      
      return { tasks: updatedTasksDescOrder }
    } catch (error) {
      const errorMsg = await catchedErrorMessage("createRow", error as Error);
      throw new Error(errorMsg);
    } 
};

export const updateRowFromId = async (tasks: Task[], id: number, title: string, detail: string, completed: boolean): Promise<{ tasks: Task[] | null }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      const updatedRow: Task | undefined = await updateRowFromIdTaskModel(id, title, detail, completed, `${BASE_URL}/api/tasks/v1/sql`);

      if (updatedRow) {
        const updatedTasks = tasks.map((item, index) => 
          tasks[index].id === updatedRow.id ? updatedRow : item
        );

        return { tasks: updatedTasks };
      }

      return { tasks: null };
    } catch (error) {
      const errorMsg = await catchedErrorMessage(`updateRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    }
};

export const deleteRowFromId = async (id: number): Promise<{ tasks: Task[] | null }> => {
    // for reference:
    // "use server" should only be used in files that contain 
    // server actions (async functions for form handling, etc.), not in regular React components or utility files.
    const { BASE_URL } = await import("@/lib/app/common");
  
    try {
      await deleteRowFromIdTaskModel(id, `${BASE_URL}/api/tasks/v1/sql`);
      // for reference: createRowTaskModel returns the a single task only (the deleted one), 
      // we need the updated tasks to rehydrate the client component
      //const tasks = await getTasksDBRowsTaskModel();
      return { tasks: null };
    } catch (error) {
      const errorMsg = await catchedErrorMessage(`deleteRowFromId [id: ${id}]`, error as Error);
      throw new Error(errorMsg);
    } 
};
