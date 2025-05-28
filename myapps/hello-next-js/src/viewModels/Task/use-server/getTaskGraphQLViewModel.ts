'use server';

import { fetchGraphQL } from '@/models/Task/use-server/TaskGraphqlClient';
import { Task } from '@/types/Task';

export const getTasksDBRows = async () => {
    const query = `
        query {
            tasks {
                id
                title
                detail
                completed
            }
        }
    `;
    
    try {
        const data: { tasks: Task[] } = await fetchGraphQL(query);
        return data.tasks;
    } catch (e) {
        console.error("getTaskGraphQLViewModel | Failed to fetch tasks db rows:", e);
        throw e;
    }
};

export const createRow = async(_: Task[], title: string, detail: string) => {
    const mutation = `
        mutation CreateTask($title: String!, $detail: String!) {
            createTask(title: $title, detail: $detail) {
                id
                title
                detail
                completed
                created_at
            }
        }
    `;

    try {
        const variables = { title, detail };
        const data: { createTask: Task } = await fetchGraphQL(mutation, variables);

        return data.createTask;
    } catch (e) {
        console.error("getTaskGraphQLViewModel | Failed to create a new row:", e);
        throw e;
    }
}

export const deleteAllRows = async() => {
    const mutation = `
        mutation DeleteTasks {
            deleteTasks {
            id
            title
            detail
            completed
            created_at
            }
        }
    `;

    try {
        // for reference: instead of returning all deleted records, returns an empty array
        //const data: { deleteTasks: Task[] }  = await fetchGraphQL(mutation);
        //return data.deleteTasks;
        await fetchGraphQL(mutation);
        return [] as Task[];
    } catch (e) {
        console.error("getTaskGraphQLViewModel | Failed to delete all rows:", e);
        throw e;
    }
}

export const seedTaskDB = async() => {
    const mutation = `
        mutation SeedTasks {
        seedTasks {
            id
            title
            detail
            completed
            created_at
        }
        }
    `;

    try {
        const data: { seedTasks: Task[] } = await fetchGraphQL(mutation);        
        return data.seedTasks;
    } catch (e) {
        console.error("getTaskGraphQLViewModel | Failed to seed db table:", e);
        throw e;
    }
}

export const updateRowFromId = async(_: Task[], id: number, title: string, detail: string, completed: boolean) => {
    const mutation = `
        mutation UpdateTask($id: ID!, $title: String!, $detail: String!, $completed: Boolean!) {
            updateTask(id: $id, title: $title, detail: $detail, completed: $completed) {
                id
                title
                detail
                completed
                created_at
            }
        }
    `;

    try {
        const variables = { id, title, detail, completed };
        const data: { updateTask: Task } = await fetchGraphQL(mutation, variables);
  
        return data.updateTask;
    } catch (e) {
        console.error(`getTaskGraphQLViewModel | Failed update row with id ${id}:`, e);
        throw e;
    }
}
