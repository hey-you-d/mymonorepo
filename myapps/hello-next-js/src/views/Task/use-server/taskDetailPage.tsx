'use client';
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRowFromId, deleteRowFromId } from '@/viewModels/Task/use-server/getTasksViewModel';
import { TaskDetail } from '@/components/Task/use-server/TaskDetail';
import { Task } from '@/types/Task';
import { MONOREPO_PREFIX, TASKS_CRUD } from '@/lib/app/common';

export const TaskDetailPage = ({id}: {id: number}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);

      try {
        const result = await getRowFromId(id);
        console.log("views/use-server/taskDetailPage ", result);
        setTask(result.task);
      } catch (err) {
        console.error("Failed to fetch task:", err);
        //setTask(task);
        setTask(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, []);

  if (loading) return <p>Loading...</p>;
  
  const body: React.ReactElement[] = [];
  console.log("VIEW - BEFORE RENDER ", task);
  body.push(task
    ? <TaskDetail row={task} setTask={setTask} deleteRowFromId={deleteRowFromId} /> 
    : <p>{`The record ${id} is no longer exist`}</p>);
  body.push(
    <div>
      <Link href={`${MONOREPO_PREFIX}/${TASKS_CRUD}/use-server`}>Back to the table page</Link>
    </div>
  );  

  return body;
};
