'use client';
import { useTaskViewModelWithSwr } from '@/viewModels/Task/use-client/useTasksViewModelWithSwr'; 
import { TaskSeedDB } from '@/components/Task/use-client/TaskSeedDB';
import { TaskFilterWithDeferredValue } from './taskFilterWithDeferredValue';
import { TaskFilterWithUseTransition } from './taskFilterWithUseTransition';
import { TABLE_FILTER_OPTIMISATION as featureFlag } from "@/lib/app/featureFlags";

export const TaskWithSearchFilterPage = () => {
    const { tasks, loading, error, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();

    if (loading) return (<p>Loading...</p>);
    if (error) return (<p>{error.message}</p>);

    return tasks ? (
        <>
          <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
          {featureFlag.withUseDeferredValue && 
            <TaskFilterWithDeferredValue tasks={tasks} createRow={createRow} updateRowFromId={updateRowFromId} />
          }
          {featureFlag.withUseTransition &&
            <TaskFilterWithUseTransition tasks={tasks} createRow={createRow} updateRowFromId={updateRowFromId} />
          }  
        </>
    ) : (<></>);
};
