'use client';
import { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
//import { useTaskViewModel } from '@/app/viewModels/Task/use-client/useTasksViewModel';
import { useTaskViewModelWithSwr } from '@/viewModels/Task/use-client/useTasksViewModelWithSwr';
import useTaskUserViewModel from '@/viewModels/Task/use-client/useTaskUserViewModel';
import { TaskDetail } from '@/components/Task/use-client/TaskDetail';
import type { Task } from '@/types/Task';
import { MONOREPO_PREFIX, TASKS_CRUD } from '@/lib/app/common';

export const TaskDetailPage = ({id}: {id: number}) => {
  //const { tasks, loading, deleteRowFromId } = useTaskViewModel();
  const { tasks, loading, deleteRowFromId } = useTaskViewModelWithSwr();
  const { checkAuthTokenCookieExist, logoutUser } = useTaskUserViewModel();

  const [row, setRow] = useState<Task | undefined>(undefined);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (tasks) {
        const row = tasks.find((el: Task) => el.id == Number(id));
        setRow(row);
    }     
  }, [id, tasks]);

  useLayoutEffect(() => {
        const checkUserLoggedIn = async () => {
            // for reference: the http only auth_token cookie is not accessible from the client-side
            try {
              const authTokenCookieExist = await checkAuthTokenCookieExist();
              if (authTokenCookieExist.outcome && !userAuthenticated) {
                  setUserAuthenticated(true);
              }
              if (!authTokenCookieExist.outcome && userAuthenticated) {
                  setUserAuthenticated(false);
                  
                  // TODO: a modal popup that says "you have been logged out"
              }
            } catch(err) {
              // For reference: Optional - already logged inside checkAuthTokenCookieExist, so we don't need to log here
              // this try catch statement is needed to make this component to be unit-testable
              console.error("Optional - already logged inside checkAuthTokenCookieExist ", err);
            }
        };
  
        checkUserLoggedIn();
    }, [setUserAuthenticated, userAuthenticated, checkAuthTokenCookieExist, logoutUser]);
  

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
