// dev note:
// This view component doesn't adhere to the established MVVM pattern. 
// Instead of calling a react hook (viewmodel component), it directly calls the reusable fetchGraphQL function.
// Potential TODO: 
// convert fetchGraphQL module into a model, and a viewmodel component - therefore 
// adhering the MVVM architecture.
'use client';
import { useEffect, useState } from 'react';
import { fetchGraphQL } from '@/bff/tasks/graphQL_client';
import { Task } from '@/app/types/Task';
import { TaskSeedDB } from '../components/TaskSeedDB';
import { TaskTable } from '../components/TaskTable';

export const TaskGraphQLPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        } catch (e: any) {
          console.error("ERROR", e);
          setError(typeof e === 'object' && e?.message ? `error: ${e.message}` : 'Something went wrong');
        } finally {
          setLoading(false);
        }
      };
    
      loadTasks();
    }, []);
        
    if (loading) return <p>Loading...</p>;
    //if (error) return <p>Error: {error}</p>; // TODO

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

    }

    console.log("Tasks ", tasks);
    return tasks && (
        <>
            <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTaskDB} deleteAllRows={deleteAllRows} />
            <TaskTable tasks={tasks} createRow={createRow} updateRowFromId={updateRowFromId} />
        </>
    );
}