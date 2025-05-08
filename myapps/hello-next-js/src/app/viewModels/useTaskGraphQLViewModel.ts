import { useState, useEffect } from 'react';
import { fetchGraphQL } from '../models/TaskGraphqlClient';
import { Task } from '../types/Task';

export const useTaskGraphQLViewModel = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // with graphql, lets use CSR instead of SSR for now
    useEffect(() => {
        const loadTasks = async () => {
            setError(null);
            setLoading(true);
        
            try {
                const data = await fetchGraphQL(`
                    query {
                      tasks {
                          id
                          title
                          detail
                          completed
                      }
                    }
                `);
                setTasks(data.tasks);
            } catch (e) {
                if (e instanceof Error) {
                    console.error("ERROR", e);
                    setError(e.message ? `error: ${e.message}` : 'Something went wrong');
                }
            } finally {
                setLoading(false);
            }
        };
        
        loadTasks();
    }, []);

    const createRow = async(title: string, detail: string) => {
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
            const data = await fetchGraphQL(mutation, variables);
            // dev note: Use Functional setTasks to Avoid Stale State
            // This ensures the update works even if multiple tasks are added quickly, 
            // preventing race conditions from stale closures.
            setTasks(prev => [data.createTask, ...prev]);
            } catch (err) {
            console.error(err);
        }
    }
    
    const deleteAllRows = async() => {
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
          await fetchGraphQL(mutation);
          setTasks([]);
        } catch (err) {
          console.error(err);
        }
    }

    const seedTaskDB = async() => {
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
          const data = await fetchGraphQL(mutation);        
          setTasks([data.seedTasks, ...tasks]);
        } catch (err) {
          console.error(err);
        }
    }

    const updateRowFromId = async(id: number, title: string, detail: string, completed: boolean) => {
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
          const data = await fetchGraphQL(mutation, variables);
          // dev note: update only the changed task in the list
          setTasks(prev =>
            prev.map(task => (task.id === data.updateTask.id ? data.updateTask : task))
          );
        } catch (err) {
          console.error(err);
        }
    }
  
    return {
        tasks,
        loading,
        error,
        seedTaskDB,
        deleteAllRows,
        createRow,
        updateRowFromId,
    };
}