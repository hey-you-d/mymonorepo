'use client';
// The View connects the ViewModel and UI component
//import { useTaskViewModel } from '../viewModels/useTasksViewModel'; // no Frontend caching 
import { useTaskViewModelWithSwr } from '../viewModels/useTasksViewModelWithSwr';
import { TaskSeedDB } from '../components/TaskSeedDB';
import { TaskTable } from '../components/TaskTable';

export const TaskPage = () => {
  //const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModel();
  const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();

  if (loading) return <p>Loading...</p>;

  return tasks ? (
    <>
      <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
      <TaskTable tasks={tasks} createRow={createRow} updateRowFromId={updateRowFromId} />
    </>
  ) : (<></>);
};
