'use client';
import { useState } from 'react';
import { ApolloError, gql, useQuery, useMutation } from '@apollo/client';
import { Task } from "@/types/Task";
import { catchedErrorMessage, customResponseMessage } from '@/lib/app/error';

const fnSignature = "use-client | view-model | useTaskApolloClientViewModel";

export const GET_ALL_TASKS = gql`
    query {
        tasks {
            id
            title
            detail
            completed
        }
    }
`;

export const DELETE_ALL_TASKS = gql`
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

export const SEED_TASKS = gql`
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

export const CREATE_A_TASK = gql`
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

export const UPDATE_A_TASK = gql`
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

export const useTaskApolloClientViewModel = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // All of the mutation query functions
    //const [createTask, { data: suppliedCreateTaskData, loading: createTaskLoading, error: createTaskError }] = useMutation(CREATE_A_TASK);
    //const [deleteTasks, { data: suppliedDeleteTasksData, loading: deleteTasksLoading, error: deleteTasksError }] = useMutation(DELETE_ALL_TASKS);
    //const [seedTasks, { data: suppliedSeedTasksData, loading: seedTasksLoading, error: seedTasksError }] = useMutation(SEED_TASKS);
    //const [updateTask, { data: suppliedUpdateTaskData, loading: updateTaskLoading, error: updateTaskError }] = useMutation(UPDATE_A_TASK);
    const [createTask] = useMutation(CREATE_A_TASK);
    const [deleteTasks] = useMutation(DELETE_ALL_TASKS);
    const [seedTasks] = useMutation(SEED_TASKS);
    const [updateTask] = useMutation(UPDATE_A_TASK);

    // Run the query to populate the table
    // for reference: with Apollo Client, to achieve "run once" behavior but still respond to query results is to 
    // handle it inside the useQuery call, hence the purpose behind getAllTasksHandler obj. 
    // This technique can be used to replace the CSR with useEffect
    const getAllTasksHandler = {
        onCompleted: (data: { tasks: Task[] } | undefined) => {
            if(data?.tasks) {
                setTasks(data.tasks);
            }
        },
        /* // Apollo Client doesn't handle async callbacks properly. This could cause issues.
        onError: async (error: ApolloError) => {
            setErrorMsg(await customResponseMessage(fnSignature, "getAllTasksHandler - onError", error.message));
            setIsLoading(false);
        }
        */
        onError: (error: ApolloError) => {
            // Make this synchronous to avoid issues
            customResponseMessage(fnSignature, "getAllTasksHandler - onError", error.message)
                .then(msg => setErrorMsg(msg))
                .catch(err => setErrorMsg(`Error handling failed: ${err.message}`));
        }    
    }
    
    const { loading: queryLoading, error: queryError } = useQuery(GET_ALL_TASKS, getAllTasksHandler);

    // Use Apollo's loading state combined with any custom loading states
    const isLoading = queryLoading;

    const createRow = async(_: Task[], title: string, detail: string) => {    
        try {
            const { data: mutatedData } = await createTask({ variables: { title, detail } });

            // for reference: createTaskError and createTaskLoading are from the initial hook state — 
            // they don’t update after the mutation. Apollo mutation hook returns a result from 
            // await createTask(...), and the correct way to get errors or loading state after a mutation is 
            // from the result object, not the hook state. 
            /*
            if (createTaskError && createTaskError instanceof ApolloError) {
                setErrorMsg(createTaskError.message);
            }

            if (createTaskLoading) {
                setIsLoading(true);
            }
            */    
            if (!mutatedData?.createTask) {
                const errMsg = await customResponseMessage(fnSignature, "createRow", "no task returned");
                throw new Error(errMsg);
            }

            // for reference: Use Functional setTasks to Avoid Stale State
            // This ensures the update works even if multiple tasks are added quickly, 
            // preventing race conditions from stale closures.
            setTasks(prev => [mutatedData.createTask, ...prev]);
            // Clear any previous error messages on success
            setErrorMsg(null);
        } catch (e) {
            const errorMessage = await catchedErrorMessage(fnSignature, "createRow", e as Error);
            setErrorMsg(errorMessage);
        }
    }
    
    const deleteAllRows = async() => {  
        try {
            const { data: mutatedData } = await deleteTasks();

            // for reference: check the dev note in the createRow function
            /*
            if (deleteTasksError && deleteTasksError instanceof ApolloError) {
                setErrorMsg(deleteTasksError.message);
            }
    
            if (deleteTasksLoading) {
                setIsLoading(true);
            }
            */

            if (!mutatedData?.deleteTasks) {
                const errMsg = await customResponseMessage(fnSignature, "deleteAllRows", "no task returned");
                throw new Error(errMsg);
            }
            
            setTasks([]);
            // Clear any previous error messages on success
            setErrorMsg(null);
        } catch (e) {
            const errorMessage = await catchedErrorMessage(fnSignature, "deleteAllRows", e as Error);
            setErrorMsg(errorMessage);
        }
    }

    const seedTaskDB = async() => {
        try {
            const { data: mutatedData } = await seedTasks();     

            // for reference: check the dev note in the createRow function
            /*
            if (seedTasksError && seedTasksError instanceof ApolloError) {
                setErrorMsg(seedTasksError.message);
            }
    
            if (seedTasksLoading) {
                setIsLoading(true);
            }
            */
            if (!mutatedData?.seedTasks) {
                const errMsg = await customResponseMessage(fnSignature, "seedTaskDB", "no task returned");
                throw new Error(errMsg);
            }

            // for reference: Use Functional setTasks to Avoid Stale State
            // This ensures the update works even if multiple tasks are added quickly, 
            // preventing race conditions from stale closures.
            // dev note 2: the returned data structure:
            // result: { data: { seedTasks: [{ id: '1', ... }, { id: '2', ... }] } }
            // hence, can't do [mutatedData.seedTasks, ...prev]
            // otherwise, it will result in nested array: [[task1, task2], ...prev]) -> X
            //setTasks(prev => [...mutatedData.seedTasks, ...prev]);
            // dev note 3: I can 100% guarantee that prev is [], hence
            setTasks([...mutatedData.seedTasks]);
            // Clear any previous error messages on success
            setErrorMsg(null);
        } catch (e) {
            const errorMessage = await catchedErrorMessage(fnSignature, "seedTaskDB", e as Error);
            setErrorMsg(errorMessage);
        }
    }

    const updateRowFromId = async(_: Task[], id: number, title: string, detail: string, completed: boolean) => {  
        try {
            const { data: mutatedData } = await updateTask({ variables: { id, title, detail, completed } });

            // for reference: check the dev note in the createRow function
            /*
            if (updateTaskError && updateTaskError instanceof ApolloError) {
                setErrorMsg(updateTaskError.message);
            }

            if (updateTaskLoading) {
                setIsLoading(true);
            }
            */
            if (!mutatedData?.updateTask) {
                const errMsg = await customResponseMessage(fnSignature, "updateRowFromId", "no task returned");
                throw new Error(errMsg);
            }

            // for reference: update only the changed task in the list
            setTasks(prev =>
                prev.map(task => (task.id === mutatedData.updateTask.id ? mutatedData.updateTask : task))
            );
            // Clear any previous error messages on success
            setErrorMsg(null);
        } catch (e) {
            const errorMessage = await catchedErrorMessage(fnSignature, `updateRowFromId [id: ${id}]`, e as Error);
            setErrorMsg(errorMessage);
        }
    }
  
    return {
        tasks,
        loading: isLoading,
        error: errorMsg || queryError?.message, // Combine custom errors with Apollo errors
        seedTaskDB,
        deleteAllRows,
        createRow,
        updateRowFromId,
    };
}