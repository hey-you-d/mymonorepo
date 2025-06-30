'use client';
import { useState } from 'react';
import { useTaskViewModelWithSwr } from '@/viewModels/Task/use-client/useTasksViewModelWithSwr'; 
import TaskUser from "./taskUser";
import TaskSeedDB from '@/components/Task/use-client/TaskSeedDB';
import { TaskFilterWithDeferredValue } from './taskFilterWithDeferredValue';
import { TaskFilterWithUseTransition } from './taskFilterWithUseTransition';
import { TABLE_FILTER_OPTIMISATION as featureFlag } from "@/lib/app/featureFlags";

export const TaskWithSearchFilterPage = () => {
    const { tasks, loading, error, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();

    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
    const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

    const loadingMsg = loading ? <p>Loading...</p> : <></>;
    const errorMsg = !error 
      ? <></>
      : (
        <div>
          <p>{error.name}</p>
          <p>{error.message}</p>
        </div>
      );
    const authContent = !tasks
      ? <></>
      : <TaskUser userAuthenticated={userAuthenticated} setUserAuthenticated={setUserAuthenticated} />;     
    const seedContent = !tasks
      ? <></>
      : (
        <>
          <TaskSeedDB 
            totalRows={tasks.length} 
            seedTaskDB={seedTasksDB} 
            deleteAllRows={deleteAllRows} 
            buttonDisabled={buttonDisabled}
            setButtonDisabled={setButtonDisabled}
            userAuthenticated={userAuthenticated}      
          />
        </>
      );

    return (
        <>
          <h2>Table filtering feature optimised with React hook useDeferredValue</h2>
          {authContent}
          {!error && loadingMsg}
          {errorMsg}
          {seedContent}
          {featureFlag.withUseDeferredValue && 
            <TaskFilterWithDeferredValue 
              tasks={tasks ?? []} 
              createRow={createRow} 
              updateRowFromId={updateRowFromId}
              buttonDisabled={buttonDisabled}
              setButtonDisabled={setButtonDisabled}
              userAuthenticated={userAuthenticated} 
            />
          }
          {featureFlag.withUseTransition &&
            <TaskFilterWithUseTransition 
              tasks={tasks ?? []} 
              createRow={createRow} 
              updateRowFromId={updateRowFromId}
              buttonDisabled={buttonDisabled}
              setButtonDisabled={setButtonDisabled} 
              userAuthenticated={userAuthenticated}
            />
          }  
        </>
    );
};
