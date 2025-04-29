// The Model manages the data and business logic of the app.
import { TASKS_BFF_BASE_API_URL } from "../../../constants/tasksBff";

export class TaskModel {    
    constructor() {}

    async getTasksDBRows() {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            console.error("Error fetching all rows: ", `${response.status} - ${response.statusText}`);
        }

        const result = await response.json();

        return result;
      } catch(error) {
        console.error("Error fetching all rows: ", error );

        throw error;
      } 
    }
  
    async deleteAllRows() {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/delete-rows`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // <- Just read as text
            console.error("Error deleting DB Table rows: ", `${response.status} - ${response.statusText}`);
            throw new Error(`Error fetching row: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
      } catch(error) {
        console.error("Error deleting DB Table rows: ", error );

        throw error;
      } 
    }

    async seedTasksDB() {
      try {
        const response = await fetch(`${TASKS_BFF_BASE_API_URL}/seed-table`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // <- Just read as text
            console.error("Error seeding tasks DB: ", `${response.status} - ${response.statusText}`);
            throw new Error(`Error fetching row: ${response.status}`);
        }

        const result = await response.json();
        return result.rows;
      } catch(error) {
        console.error("Error seeding tasks DB: ", error );

        throw error;
      } 
    }

    async getRowFromId(id: number) {
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

        return result;
      } catch(error) {
        console.error(`Error fetching row for id ${id}: `, error );

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
            throw new Error(`Error fetching row: ${response.status}`);
        }

        // to prevent receiving the following warning: 
        // API handler should not return a value, received object.
        // make this fn returns void by comment out the return value below
        //const result = await response.json();
        //return result;
      } catch(error) {
        console.error(`Error fetching row for id ${id}: `, error );

        throw error;
      } 
    }
}
