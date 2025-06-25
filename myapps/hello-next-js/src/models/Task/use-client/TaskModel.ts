"use client"
import { TASKS_BFF_BASE_API_URL } from "@/lib/app/common";
import { Task } from "@/types/Task";
import { notOkErrorMessage, catchedErrorMessage } from "@/lib/app/error";

const fnSignature = "use-client | model | TaskModel";

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
          const errorMsg = await notOkErrorMessage(fnSignature, "swrFetcher", response);
          throw new Error(errorMsg);
      }
      const result:Task[] = await response.json();
  
      return result;
  } catch(error) {
      const errorMsg = await catchedErrorMessage(fnSignature, "swrFetcher", error as Error);
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
            const errorMsg = await notOkErrorMessage(fnSignature, "getTasksDBRows", response);
            throw new Error(errorMsg);
        }

        const result:Task[] = await response.json();

        return result;
      } catch(error) {
        const errorMsg = await catchedErrorMessage(fnSignature, "getTasksDBRows", error as Error);
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
            const errorMsg = await notOkErrorMessage(fnSignature, "deleteAllRows", response);
            throw new Error(errorMsg);
        }
        
        const result: Task[] = await response.json();
        return result;
      } catch(error) {
        const errorMsg = await catchedErrorMessage(fnSignature, "deleteAllRows", error as Error);
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
            const errorMsg = await notOkErrorMessage(fnSignature, "seedTasksDB", response);
            throw new Error(errorMsg);
        }

        const result = await response.json();
        return result.rows;
      } catch(error) {
        const errorMsg = await catchedErrorMessage(fnSignature, "seedTasksDB", error as Error);
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
            const errorMsg = await notOkErrorMessage(fnSignature, "getRowFromId", response);
            throw new Error(errorMsg);
          }

        const result = await response.json();

        return result.rows;
      } catch(error) {
        const errorMsg = await catchedErrorMessage(fnSignature, "getRowFromId", error as Error);
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
            const errorMsg = await notOkErrorMessage(fnSignature, "createRow", response);
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
        const errorMsg = await catchedErrorMessage(fnSignature, "createRow", error as Error);
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
            const errorMsg = await notOkErrorMessage(fnSignature, "updateRowFromId", response);
            throw new Error(errorMsg);
        }

        const result = await response.json();

        return result;
      } catch(error) {
        const errorMsg = await catchedErrorMessage(fnSignature, "updateRowFromId", error as Error);
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
            const errorMsg = await notOkErrorMessage(fnSignature, "deleteRowFromId", response);
            throw new Error(errorMsg);
        }
      } catch(error) {
        const errorMsg = await catchedErrorMessage(fnSignature, "deleteRowFromId", error as Error);
        throw new Error(errorMsg);
      } 
    }
}
