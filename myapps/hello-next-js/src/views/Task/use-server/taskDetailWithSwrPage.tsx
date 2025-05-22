'use client';
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '@/viewModels/Task/use-server/getTasksViewModelWithSwr';
import { deleteRowFromId } from '@/viewModels/Task/use-server/getTasksViewModel';
import { TaskDetailWithSwr } from '@/components/Task/use-server/TaskDetailWithSwr';
import { Task } from '@/types/Task';
import { MONOREPO_PREFIX, TASKS_CRUD } from '@/lib/app/common';

export const TaskDetailWithSwrPage = ({id}: {id: number}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  // Use SWR to automatically fetch tasks (no need to set up the tasks state, and loading state)
  const { data: swrData, error: swrError, isLoading: swrLoading } = useSWR<Task[]>("Tasks-API-USE-SWR", fetcher);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);

      try {
        // for reference: get it from the cached data
        if (swrData) {
          setTask(swrData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch task:", err);
        setTask(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (!swrLoading) {
      fetchTask();
    }
  }, []); // run once only

  if (loading) return <p>Loading...</p>;
  if (swrLoading) return <p>from SWR - loading...</p>
  if (swrError) return <p>from SWR - error...</p>
  
  const body: React.ReactElement[] = [];
  body.push(task && task !== null
    ? <TaskDetailWithSwr row={task} setTask={setTask} deleteRowFromId={deleteRowFromId} buttonDisabled={buttonDisabled} setButtonDisabled={setButtonDisabled} /> 
    : <p>{`The record ${id} is no longer exist`}</p>);
  body.push(
    <div>
      <Link href={`${MONOREPO_PREFIX}/${TASKS_CRUD}/use-server`}>Back to the table page</Link>
    </div>
  );  

  return body;
};
