'use client';
// The View connects the ViewModel and UI component
import { useTaskViewModelWithSwr } from '@/app/viewModels/Task/use-client/useTasksViewModelWithSwr'; 
import { TaskSeedDB } from '@/app/components/TaskSeedDB';
import { TaskFilterWithDeferredValue } from './taskFilterWithDeferredValue';
import { TaskFilterWithUseTransition } from './taskFilterWithUseTransition';
import { TABLE_FILTER_OPTIMISATION as featureFlag } from "../../../../../feature-flags/tasksBff";

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
