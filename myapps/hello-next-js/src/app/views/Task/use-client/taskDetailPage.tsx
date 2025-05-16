'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
//import { useTaskViewModel } from '@/app/viewModels/Task/use-client/useTasksViewModel';
import { useTaskViewModelWithSwr } from '@/app/viewModels/Task/use-client/useTasksViewModelWithSwr';
import { TaskDetail } from '@/app/components/TaskDetail';
import { Task } from '@/app/types/Task';
import { MONOREPO_PREFIX, TASKS_CRUD } from '@/lib/app/common';

export const TaskDetailPage = ({id}: {id: number}) => {
  //const { tasks, loading, deleteRowFromId } = useTaskViewModel();
  const { tasks, loading, deleteRowFromId } = useTaskViewModelWithSwr();

  const [row, setRow] = useState<Task | undefined>(undefined);

  useEffect(() => {
    if (tasks) {
        const row = tasks.find((el: Task) => el.id == Number(id));
        setRow(row);
    }     
  }, [id, tasks]);

  if (loading) return <p>Loading...</p>;

  const body: React.ReactElement[] = []
  body.push(row 
    ? <TaskDetail row={row} tasks={tasks} deleteRowFromId={deleteRowFromId} /> 
    : <p>{`The record ${id} is no longer exist`}</p>);

  body.push(<div><Link href={`${MONOREPO_PREFIX}/${TASKS_CRUD}`}>Back to the table page</Link></div>);  

  return body;
};
