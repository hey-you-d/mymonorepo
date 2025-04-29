// The View connects the ViewModel and UI component
import { useState, useEffect } from 'react';
import { useTaskViewModel } from '../viewModels/useTasksViewModel';
import { TaskDetail } from '../components/TaskDetail';
import { Task } from '@/app/types/Task';

export const TaskDetailPage = ({id}: {id: number}) => {
  const { tasks, loading, deleteRowFromId } = useTaskViewModel();
  
  const [row, setRow] = useState<Task | undefined>(undefined);

  useEffect(() => {
    if (tasks) {
        const row = tasks.find((el: Task) => el.id == Number(id));
        setRow(row);
    }     
  }, [id, tasks]);

  if (loading) return <p>Loading...</p>;

  return row 
    ? <TaskDetail row={row} tasks={tasks} deleteRowFromId={deleteRowFromId} />
    : <p>{`The record ${id} is no longer exist`}</p>;
};
