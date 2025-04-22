// The Model manages the data and business logic of the app.
export class TaskModel {    
    constructor() {}

    async getTasksDBRows() {
      try {
        const response = await fetch("/api/tasks/v1/sql/", {
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
        const response = await fetch("/api/tasks/v1/sql/delete-rows", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            console.error("Error deleting DB Table rows: ", `${response.status} - ${response.statusText}`);
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
        const response = await fetch("/api/tasks/v1/sql/seed-table", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            console.error("Error seeding tasks DB: ", `${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        return result.rows;
      } catch(error) {
        console.error("Error seeding tasks DB: ", error );

        throw error;
      } 
    }
}
