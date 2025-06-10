'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
//import { useTaskViewModel } from '@/app/viewModels/Task/use-client/useTasksViewModel';
import { useTaskViewModelWithSwr } from '@/viewModels/Task/use-client/useTasksViewModelWithSwr';
import useTaskUserViewModel from '@/viewModels/Task/use-client/useTaskUserViewModel';
import { TaskDetail } from '@/components/Task/use-client/TaskDetail';
import { Task } from '@/types/Task';
import { MONOREPO_PREFIX, TASKS_CRUD } from '@/lib/app/common';

export const TaskDetailPage = ({id}: {id: number}) => {
  //const { tasks, loading, deleteRowFromId } = useTaskViewModel();
  const { tasks, loading, deleteRowFromId } = useTaskViewModelWithSwr();
  const { checkAuthTokenCookieExist } = useTaskUserViewModel();

  const [row, setRow] = useState<Task | undefined>(undefined);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (tasks) {
        const row = tasks.find((el: Task) => el.id == Number(id));
        setRow(row);
    }     
  }, [id, tasks]);

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
    body.push(row 
      ? <TaskDetail 
          row={row} 
          tasks={tasks} 
          deleteRowFromId={deleteRowFromId} 
          buttonDisabled={buttonDisabled}
          setButtonDisabled={setButtonDisabled} 
        /> 
      : <p>{`The record ${id} is no longer exist`}</p>);
  } else {
    body.push(<p>You must be logged-in first to edit this task</p>);
  }
  body.push(<div><Link href={`${MONOREPO_PREFIX}/${TASKS_CRUD}`}>Back to the table page</Link></div>);  

  return body;
};
