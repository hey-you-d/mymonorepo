// The View connects the ViewModel and UI component
import { useState, useEffect } from 'react';
import Link from 'next/link';
//import { useTaskViewModel } from '../viewModels/useTasksViewModel';
import { useTaskViewModelWithSwr } from '../viewModels/useTasksViewModelWithSwr';
import { TaskDetail } from '../components/TaskDetail';
import { Task } from '@/app/types/Task';
import { MONOREPO_PREFIX } from '../../../constants/common';

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

  body.push(<div><Link href={`${MONOREPO_PREFIX}/bff-tasks-db`}>Back to the table page</Link></div>);  

  return body;
};
