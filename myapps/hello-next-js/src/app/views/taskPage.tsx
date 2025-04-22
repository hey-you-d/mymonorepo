// The View connects the ViewModel and UI component
import { useState } from 'react';
import { useTaskViewModel } from '../viewModels/useTasksViewModel';
import { TaskSeedDB } from '../components/TaskSeedDB';
import { TaskDeleteAllRowsButton } from '../components/TaskDeleteAllRowsButton';

export const TaskPage = () => {
  const { tasks, loading, seedTasksDB, getTasksDBRows, deleteAllRows } = useTaskViewModel();
  const [ totalRows, setTotalRows ] = useState<number>(tasks.length);

  if (loading) return <p>Loading...</p>;

  console.log("VIEWS TASK PAGE ", totalRows);

  return totalRows <= 0 
    ? <TaskSeedDB seedTaskDB={seedTasksDB} setTotalRows={setTotalRows} /> 
    : <TaskDeleteAllRowsButton totalRows={totalRows} deleteAllRows={deleteAllRows} setTotalRows={setTotalRows} /> ;
};
