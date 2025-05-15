'use client';
import { useState } from 'react';
import { ApolloError, gql, useQuery, useMutation } from '@apollo/client';
import { Task } from '../types/Task';

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
    const [isLoading, setIsLoading] = useState(true);
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
    // dev note: with Apollo Client, to achieve "run once" behavior but still respond to query results is to 
    // handle it inside the useQuery call, hence the purpose behind getAllTasksHandler obj. 
    // This technique can be used to replace the CSR with useEffect
    const getAllTasksHandler = {
        onCompleted: (data: { tasks: Task[] } | undefined) => {
            if(data?.tasks) {
                setTasks(data.tasks);
                setIsLoading(false);
            }
        },
        onError: (error: ApolloError) => {
            setErrorMsg(error.message);
            setIsLoading(false);
        }
    }
    //const { loading: getTasksLoading } = useQuery(GET_ALL_TASKS, getAllTasksHandler);
    useQuery(GET_ALL_TASKS, getAllTasksHandler);

    const createRow = async(title: string, detail: string) => {    
        try {
            const { data: mutatedData } = await createTask({ variables: { title, detail } });

            // dev note: createTaskError and createTaskLoading are from the initial hook state — 
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
                throw new Error('No task returned');
            }

            // dev note: Use Functional setTasks to Avoid Stale State
            // This ensures the update works even if multiple tasks are added quickly, 
            // preventing race conditions from stale closures.
            setTasks(prev => [mutatedData.createTask, ...prev]);
        } catch (e) {
            if (e instanceof Error) {
                setErrorMsg(e.message ? `error: ${e.message}` : 'Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    }
    
    const deleteAllRows = async() => {  
        try {
            const { data: mutatedData } = await deleteTasks();

            // dev note: check the dev note in the createRow function
            /*
            if (deleteTasksError && deleteTasksError instanceof ApolloError) {
                setErrorMsg(deleteTasksError.message);
            }
    
            if (deleteTasksLoading) {
                setIsLoading(true);
            }
            */

            if (!mutatedData?.deleteTasks) {
                throw new Error('No task returned');
            }
            
            setTasks([]);
        } catch (e) {
            if (e instanceof Error) {
                setErrorMsg(e.message ? `error: ${e.message}` : 'Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    }

    const seedTaskDB = async() => {
        try {
            const { data: mutatedData } = await seedTasks();     

            // dev note: check the dev note in the createRow function
            /*
            if (seedTasksError && seedTasksError instanceof ApolloError) {
                setErrorMsg(seedTasksError.message);
            }
    
            if (seedTasksLoading) {
                setIsLoading(true);
            }
            */
            if (!mutatedData?.seedTasks) {
                throw new Error('No task returned');
            }

            // dev note: Use Functional setTasks to Avoid Stale State
            // This ensures the update works even if multiple tasks are added quickly, 
            // preventing race conditions from stale closures.
            // dev note 2: the returned data structure:
            // result: { data: { seedTasks: [{ id: '1', ... }, { id: '2', ... }] } }
            // hence, can't do [mutatedData.seedTasks, ...prev]
            // otherwise, it will result in nested array: [[task1, task2], ...prev]) -> X
            //setTasks(prev => [...mutatedData.seedTasks, ...prev]);
            // dev note 3: I can 100% guarantee that prev is [], hence
            setTasks([...mutatedData.seedTasks]);
        } catch (e) {
            if (e instanceof Error) {
                setErrorMsg(e.message ? `error: ${e.message}` : 'Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    }

    const updateRowFromId = async(id: number, title: string, detail: string, completed: boolean) => {  
        try {
            const { data: mutatedData } = await updateTask({ variables: { id, title, detail, completed } });

            // dev note: check the dev note in the createRow function
            /*
            if (updateTaskError && updateTaskError instanceof ApolloError) {
                setErrorMsg(updateTaskError.message);
            }

            if (updateTaskLoading) {
                setIsLoading(true);
            }
            */
            if (!mutatedData?.updateTask) {
                throw new Error('No task returned');
            }

            // dev note: update only the changed task in the list
            setTasks(prev =>
                prev.map(task => (task.id === mutatedData.updateTask.id ? mutatedData.updateTask : task))
            );
            
        } catch (e) {
            if (e instanceof Error) {
                setErrorMsg(e.message ? `error: ${e.message}` : 'Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    }
  
    return {
        tasks,
        loading: isLoading,
        error: errorMsg,
        seedTaskDB,
        deleteAllRows,
        createRow,
        updateRowFromId,
    };
}