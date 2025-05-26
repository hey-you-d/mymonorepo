"use client"
import { TASKS_BFF_BASE_API_URL } from "@/lib/app/common";
import { Task } from "@/types/Task";

export const swrFetcher = async () => {
  try {
      const response = await fetch(`${TASKS_BFF_BASE_API_URL}/`, {
          method: 'GET',
          headers: {
              "Content-Type": "application/json",
          }
      });

      if (!response.ok) {
          console.error("Error fetching all rows: ", `${response.status} - ${response.statusText}`);
          throw new Error(`Database Fetch failed: ${response.status} ${response.statusText}`);
      }
      const result:Task[] = await response.json();
  
      return result;
  } catch(error) {
      console.error("Error fetching all rows: ", error );
      throw error; // Important: propagate error to SWR
  }
}

export class TaskModel {    
    constructor() {}

    // for debugging only
    async getJwt(): Promise<{jwtSecret: string}> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/jwt`, {
          method: 'GET',
          headers: {
              "Content-Type": "application/json",
          }
        });

        if (!response.ok) {
          console.error("Error: JWT Fetch failed: ", `${response.status} - ${response.statusText}`);
          // If the response isn't OK, throw an error to be caught in the catch block
          throw new Error(`Error: JWT Fetch failed: ${response.status} ${response.statusText}`);
        }

        const result:{ jwtSecret:string } = await response.json();
      
        return result;
      } catch(error) {
        console.error("Error fetching JWT: ", error );

        throw error;
      }
    }

    async getTasksDBRows(overrideFetchUrl?: string): Promise<Task[]> {
      // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
      // In this case, we must supply an absolute URL  
      const finalUrl = overrideFetchUrl ? overrideFetchUrl : `${TASKS_BFF_BASE_API_URL}/`;

      try {
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            console.error("Error fetching all rows: ", `${response.status} - ${response.statusText}`);
            // If the response isn't OK, throw an error to be caught in the catch block
            throw new Error(`Error fetching all rows: ${response.status} ${response.statusText}`);
        }

        const result:Task[] = await response.json();

        return result;
      } catch(error) {
        console.error("Error fetching all rows: ", error );

        throw error;
      } 
    }
  
    async deleteAllRows(): Promise<Task[]> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/delete-rows`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // <- Just read as text
            console.error("Error deleting DB Table rows: ", `${response.status} - ${response.statusText} - ${errorText}`);
            throw new Error(`Error deleting DB Table rows: ${response.status}`);
        }
        
        const result: Task[] = await response.json();
        return result;
      } catch(error) {
        console.error("Error deleting DB Table rows: ", error );

        throw error;
      } 
    }

    async seedTasksDB(): Promise<Task[]> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/seed-table`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // <- Just read as text
            console.error("Error seeding tasks DB: ", `${response.status} - ${response.statusText} - ${errorText}`);
            throw new Error(`Error seeding tasks DB: ${response.status}`);
        }

        const result = await response.json();
        return result.rows;
      } catch(error) {
        console.error("Error seeding tasks DB: ", error );

        throw error;
      } 
    }

    async getRowFromId(id: number): Promise<Task[]> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/${id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // <- Just read as text
            console.error(`Error fetching row for id ${id}: ${response.status} - ${response.statusText}`, errorText);
            throw new Error(`Error fetching row: ${response.status}`);
          }

        const result = await response.json();

        return result.rows;
      } catch(error) {
        console.error(`Error fetching row for id ${id}: `, error );

        throw error;
      } 
    }

    async createRow(title: string, detail: string): Promise<Task[]> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/create-row`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              detail
            }),
        });

        if (!response.ok) {
            const errorText = await response.text(); // <- Just read as text
            console.error(`Error creating row: ${response.status} - ${response.statusText}`, errorText);
            throw new Error(`Error creating row: ${response.status}`);
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
        console.error("Error creating row: ", error );

        throw error;
      } 
    }

    async updateRowFromId(id: number, title: string, detail: string, completed: boolean): Promise<Task> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              detail,
              completed,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text(); // <- Just read as text
            console.error(`Error updating row for id ${id}: ${response.status} - ${response.statusText}`, errorText);
            throw new Error(`Error updating row: ${response.status}`);
        }

        const result = await response.json();

        return result;
      } catch(error) {
        console.error(`Error updating row for id ${id}: `, error );

        throw error;
      } 
    }

    async deleteRowFromId(id: number): Promise<void> {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // <- Just read as text
            console.error(`Error deleting row for id ${id}: ${response.status} - ${response.statusText}`, errorText);
            throw new Error(`Error deleting row: ${response.status}`);
        }
      } catch(error) {
        console.error(`Error fetching row for id ${id}: `, error );

        throw error;
      } 
    }
}
