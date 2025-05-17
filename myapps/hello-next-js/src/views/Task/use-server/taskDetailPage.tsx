'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRowFromId, deleteRowFromId, getTasksDBRows } from '@/viewModels/Task/use-server/getTasksViewModel';
import { TaskDetail } from '@/components/TaskDetail';
import { Task } from '@/types/Task';
import { MONOREPO_PREFIX, TASKS_CRUD } from '@/lib/app/common';

export const TaskDetailPage = ({id}: {id: number}) => {
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);

      const { tasks } = await getRowFromId(1);
      setTask(tasks[0]);

      const result = await getTasksDBRows();
      setTasks(result.tasks)
      
      setLoading(false);
    };
    
    fetchTask();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  const body: React.ReactElement[] = []
  body.push(task 
    ? <TaskDetail row={task} tasks={tasks} deleteRowFromId={deleteRowFromId} /> 
    : <p>{`The record ${id} is no longer exist`}</p>);

  body.push(<div><Link href={`${MONOREPO_PREFIX}/${TASKS_CRUD}`}>Back to the table page</Link></div>);  

  return body;
};
