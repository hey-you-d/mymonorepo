'use client';
// The View connects the ViewModel and UI component
import { useTaskViewModelWithSwr } from '../viewModels/useTasksViewModelWithSwr'; 
import { TaskSeedDB } from '../components/TaskSeedDB';
import { TaskFilterWithDeferredValue } from './taskFilterWithDeferredValue';
import { TaskFilterWithUseTransition } from './taskFilterWithUseTransition';

const featureFlag = {
  withUseDeferredValue: true, // use this to optimise your filter feature 
  withUseTransition: false, // save yourself from potential headache, try not to use this
}

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
