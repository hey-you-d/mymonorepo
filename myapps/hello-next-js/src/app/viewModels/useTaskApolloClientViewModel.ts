import { useState, useEffect } from 'react';
import { ApolloError, gql, useQuery, useMutation } from '@apollo/client';
import { Task } from '../types/Task';

const GET_ALL_TASKS = gql`
    query {
        tasks {
            id
            title
            detail
            completed
        }
    }
`;

const DELETE_ALL_TASKS = gql`
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

const SEED_TASKS = gql`
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

const CREATE_A_TASK = gql`
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

const UPDATE_A_TASK = gql`
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



export const useTaskGraphQLViewModel = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 2. Run the query
    const { data: getTasksData, loading: getTasksLoading, error: getTasksError } = useQuery(GET_ALL_TASKS);
    // 2. Prepare the mutation function
    /*
    const [createTask, { data: suppliedCreateTaskData, loading: createTaskLoading, error: createTaskError }] = useMutation(CREATE_A_TASK);
    const [deleteTasks, { data: suppliedDeleteTasksData, loading: deleteTasksLoading, error: deleteTasksError }] = useMutation(DELETE_ALL_TASKS);
    const [seedTasks, { data: suppliedSeedTasksData, loading: seedTasksLoading, error: seedTasksError }] = useMutation(SEED_TASKS);
    const [updateTask, { data: suppliedUpdateTaskData, loading: updateTaskLoading, error: updateTaskError }] = useMutation(UPDATE_A_TASK);
    */
    const [createTask, { loading: createTaskLoading, error: createTaskError }] = useMutation(CREATE_A_TASK);
    const [deleteTasks, { loading: deleteTasksLoading, error: deleteTasksError }] = useMutation(DELETE_ALL_TASKS);
    const [seedTasks, { loading: seedTasksLoading, error: seedTasksError }] = useMutation(SEED_TASKS);
    const [updateTask, { loading: updateTaskLoading, error: updateTaskError }] = useMutation(UPDATE_A_TASK);
    
    // with graphql, lets use CSR instead of SSR for now
    useEffect(() => {
        if (!getTasksData.tasks) return; // Wait until data is available

        const loadTasks = async () => {
            setErrorMsg(null);
            setIsLoading(true);
        
            try {
                setTasks(getTasksData.tasks);
                setIsLoading(getTasksLoading);
                if (getTasksError && getTasksError instanceof ApolloError) {
                    setErrorMsg(getTasksError.message);
                }
            } catch (e) {
                if (e instanceof Error) {
                    setErrorMsg(e.message ? `error: ${e.message}` : 'Something went wrong');
                }
            }
        };
        
        loadTasks();
    }, [getTasksData.tasks, getTasksError, getTasksLoading]);

    const createRow = async(title: string, detail: string) => {    
        setErrorMsg(null);
        setIsLoading(true);
        
        try {
            const { data: mutatedData } = await createTask({ variables: { title, detail } });
            
            // dev note: Use Functional setTasks to Avoid Stale State
            // This ensures the update works even if multiple tasks are added quickly, 
            // preventing race conditions from stale closures.
            setTasks(prev => [mutatedData.createTask, ...prev]);
            setIsLoading(createTaskLoading);
            if (createTaskError && createTaskError instanceof ApolloError) {
                setErrorMsg(createTaskError.message);
            }
        } catch (e) {
            if (e instanceof Error) {
                setErrorMsg(e.message ? `error: ${e.message}` : 'Something went wrong');
            }
        }
    }
    
    const deleteAllRows = async() => {  
        setErrorMsg(null);
        setIsLoading(true);
        
        try {
            await deleteTasks();
            setTasks([]);
            setIsLoading(deleteTasksLoading);
            if (deleteTasksError && deleteTasksError instanceof ApolloError) {
                setErrorMsg(deleteTasksError.message);
            }
        } catch (e) {
            if (e instanceof Error) {
                setErrorMsg(e.message ? `error: ${e.message}` : 'Something went wrong');
            }
        }
    }

    const seedTaskDB = async() => {
        setErrorMsg(null);
        setIsLoading(true);
        
        try {
            const { data: mutatedData } = await seedTasks();     
            setTasks(prev => [mutatedData.seedTasks, ...prev]);
            setIsLoading(seedTasksLoading);
            if (seedTasksError && seedTasksError instanceof ApolloError) {
                setErrorMsg(seedTasksError.message);
            }
        } catch (e) {
            if (e instanceof Error) {
                setErrorMsg(e.message ? `error: ${e.message}` : 'Something went wrong');
            }
        }
    }

    const updateRowFromId = async(id: number, title: string, detail: string, completed: boolean) => {  
        setErrorMsg(null);
        setIsLoading(true);
        
        try {
            const { data: mutatedData } = await updateTask({ variables: { id, title, detail, completed } });

            // dev note: update only the changed task in the list
            setTasks(prev =>
                prev.map(task => (task.id === mutatedData.updateTask.id ? mutatedData.updateTask : task))
            );
            setIsLoading(updateTaskLoading);
            if (updateTaskError && updateTaskError instanceof ApolloError) {
                setErrorMsg(updateTaskError.message);
            }
        } catch (e) {
            if (e instanceof Error) {
                setErrorMsg(e.message ? `error: ${e.message}` : 'Something went wrong');
            }
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