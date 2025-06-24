'use server';

import { fetchGraphQL } from '@/models/Task/use-server/TaskGraphqlClient';
import type { Task } from '@/types/Task';

const fnSignature = "use-server | view-model | getTaskGraphQLViewModel";
const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
}

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
    } catch (error) {
        const errorMsg = await catchedErrorMessage("getTasksDBRows", error as Error);
        throw new Error(errorMsg);
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
    } catch (error) {
        const errorMsg = await catchedErrorMessage("createRow", error as Error);
        throw new Error(errorMsg);
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
    } catch (error) {
        const errorMsg = await catchedErrorMessage("deleteAllRows", error as Error);
        throw new Error(errorMsg);
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
    } catch (error) {
        const errorMsg = await catchedErrorMessage("seedTaskDB", error as Error);
        throw new Error(errorMsg);
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
    } catch (error) {
        const errorMsg = await catchedErrorMessage(`updateRowFromId [id: ${id}]`, error as Error);
        throw new Error(errorMsg);
    }
}
