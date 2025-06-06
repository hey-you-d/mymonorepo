'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
//import { useTaskViewModel } from '@/app/viewModels/Task/use-client/useTasksViewModel';
import { useTaskViewModelWithSwr } from '@/viewModels/Task/use-client/useTasksViewModelWithSwr';
import { TaskDetail } from '@/components/Task/use-client/TaskDetail';
import { Task } from '@/types/Task';
import { MONOREPO_PREFIX, TASKS_CRUD } from '@/lib/app/common';

export const TaskDetailPage = ({id}: {id: number}) => {
  //const { tasks, loading, deleteRowFromId } = useTaskViewModel();
  const { tasks, loading, deleteRowFromId } = useTaskViewModelWithSwr();

  const [row, setRow] = useState<Task | undefined>(undefined);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (tasks) {
        const row = tasks.find((el: Task) => el.id == Number(id));
        setRow(row);
    }     
  }, [id, tasks]);

  if (loading) return <p>Loading...</p>;

  const body: React.ReactElement[] = []
  body.push(row 
    ? <TaskDetail 
        row={row} 
        tasks={tasks} 
        deleteRowFromId={deleteRowFromId} 
        buttonDisabled={buttonDisabled}
        setButtonDisabled={setButtonDisabled} 
      /> 
    : <p>{`The record ${id} is no longer exist`}</p>);

  body.push(<div><Link href={`${MONOREPO_PREFIX}/${TASKS_CRUD}`}>Back to the table page</Link></div>);  

  return body;
};
