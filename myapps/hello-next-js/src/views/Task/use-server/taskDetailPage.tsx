'use client';
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRowFromId, deleteRowFromId } from '@/viewModels/Task/use-server/getTasksViewModel';
import { checkAuthTokenCookieExist } from '@/viewModels/Task/use-server/getTasksUserViewModel';
import { TaskDetail } from '@/components/Task/use-server/TaskDetail';
import { Task } from '@/types/Task';
import { MONOREPO_PREFIX, TASKS_CRUD } from '@/lib/app/common';

export const TaskDetailPage = ({id}: {id: number}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);

      try {
        const result = await getRowFromId(id);
        setTask(result.task);
      } catch (err) {
        console.error("Failed to fetch task:", err);
        setTask(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, []); // run once only

  useEffect(() => {
      const checkUserLoggedIn = async () => {
          // for reference: the http only auth_token cookie is not accessible from the client-side
          const authTokenCookieExist = await checkAuthTokenCookieExist();
          if (authTokenCookieExist && !userAuthenticated) {
              setUserAuthenticated(true);
          }
          if (!authTokenCookieExist && userAuthenticated) {
              setUserAuthenticated(false);

              // TODO: a modal popup that says "you have been logged out"
          }
      };

      checkUserLoggedIn();
  }, [setUserAuthenticated, userAuthenticated]);

  if (loading) return <p>Loading...</p>;
  
  const body: React.ReactElement[] = [];
  if (userAuthenticated) {
    body.push(task && task !== null
      ? <TaskDetail 
            row={task} 
            setTask={setTask} 
            deleteRowFromId={deleteRowFromId} 
            buttonDisabled={buttonDisabled}
            setButtonDisabled={setButtonDisabled} 
        /> 
      : <p>{`The record ${id} is no longer exist`}</p>);
  } else {
    body.push(<p>You must be logged-in first to edit this task</p>);
  }
  body.push(
    <div>
      <Link href={`${MONOREPO_PREFIX}/${TASKS_CRUD}/use-server`}>Back to the table page</Link>
    </div>
  );  

  return body;
};
