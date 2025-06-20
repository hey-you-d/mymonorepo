"use client"
import { TASKS_BFF_BASE_API_URL } from "@/lib/app/common";
import { Task } from "@/types/Task";

const fnSignature = "use-client | model | TaskModel";
export const notOkErrorMessage = async (fnName: string, response: Response) => {
    const errorMsg = `${fnSignature} | ${fnName} | not ok response: ${response.status} - ${response.statusText} `;
    console.error(errorMsg);
    return errorMsg;
}

export const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
} 

export const swrFetcher = async () => {
  try {
      const response = await fetch(`${TASKS_BFF_BASE_API_URL}/`, {
          method: 'GET',
          headers: {
              "Content-Type": "application/json",
          },
          credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
      });

      if (!response.ok) {
          const errorMsg = await notOkErrorMessage("swrFetcher", response);
          throw new Error(errorMsg);
      }
      const result:Task[] = await response.json();
  
      return result;
  } catch(error) {
      const errorMsg = await catchedErrorMessage("swrFetcher", error as Error);
      throw new Error(errorMsg);
  }
}

export class TaskModel {    
    constructor() {}

    async getTasksDBRows(overrideFetchUrl?: string): Promise<Task[]> {
      // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
      // In this case, we must supply an absolute URL  
      const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}/`;

      try {
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
        });

        if (!response.ok) {
            const errorMsg = await notOkErrorMessage("getTasksDBRows", response);
            throw new Error(errorMsg);
        }

        const result:Task[] = await response.json();

        return result;
      } catch(error) {
        const errorMsg = await catchedErrorMessage("getTasksDBRows", error as Error);
        throw new Error(errorMsg);
      } 
    }
  
    async deleteAllRows(): Promise<Task[]> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/delete-rows`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
        });

        if (!response.ok) {
            const errorMsg = await notOkErrorMessage("deleteAllRows", response);
            throw new Error(errorMsg);
        }
        
        const result: Task[] = await response.json();
        return result;
      } catch(error) {
        const errorMsg = await catchedErrorMessage("deleteAllRows", error as Error);
        throw new Error(errorMsg);
      } 
    }

    async seedTasksDB(): Promise<Task[]> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/seed-table`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
        });

        if (!response.ok) {
            const errorMsg = await notOkErrorMessage("seedTasksDB", response);
            throw new Error(errorMsg);
        }

        const result = await response.json();
        return result.rows;
      } catch(error) {
        const errorMsg = await catchedErrorMessage("seedTasksDB", error as Error);
        throw new Error(errorMsg);
      } 
    }

    async getRowFromId(id: number): Promise<Task[]> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/${id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
        });

        if (!response.ok) {
            const errorMsg = await notOkErrorMessage("getRowFromId", response);
            throw new Error(errorMsg);
          }

        const result = await response.json();

        return result.rows;
      } catch(error) {
        const errorMsg = await catchedErrorMessage("getRowFromId", error as Error);
        throw new Error(errorMsg);
      } 
    }

    async createRow(title: string, detail: string): Promise<Task[]> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/create-row`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
            body: JSON.stringify({
              title,
              detail
            }),
        });

        if (!response.ok) {
            const errorMsg = await notOkErrorMessage("createRow", response);
            throw new Error(errorMsg);
        }

        const result = await response.json();
        
        return result.rows;
        
        /*
        return [
          {
            id: 9999,
            title: "fake title",
            detail: "fake detail",
            completed: false,
            created_at: "",
          }
        ];
        */
      } catch(error) {
        const errorMsg = await catchedErrorMessage("createRow", error as Error);
        throw new Error(errorMsg);
      } 
    }

    async updateRowFromId(id: number, title: string, detail: string, completed: boolean): Promise<Task> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
            body: JSON.stringify({
              title,
              detail,
              completed,
            }),
        });

        if (!response.ok) {
            const errorMsg = await notOkErrorMessage("updateRowFromId", response);
            throw new Error(errorMsg);
        }

        const result = await response.json();

        return result;
      } catch(error) {
        const errorMsg = await catchedErrorMessage("updateRowFromId", error as Error);
        throw new Error(errorMsg);
      } 
    }

    async deleteRowFromId(id: number): Promise<void> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/${id}`, {
            method: 'DELETE',
            credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            const errorMsg = await notOkErrorMessage("deleteRowFromId", response);
            throw new Error(errorMsg);
        }
      } catch(error) {
        const errorMsg = await catchedErrorMessage("deleteRowFromId", error as Error);
        throw new Error(errorMsg);
      } 
    }
}
