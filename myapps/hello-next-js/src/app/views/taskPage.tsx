// The View connects the ViewModel and UI component
import { useTaskViewModel } from '../viewModels/useTasksViewModel';
import { TaskSeedDB } from '../components/TaskSeedDB';
import { TaskTable } from '../components/TaskTable';

export const TaskPage = () => {
  const { tasks, loading, seedTasksDB, deleteAllRows, getRowFromId } = useTaskViewModel();

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
      <TaskTable tasks={tasks} getRowFromId={getRowFromId} />
    </>
  );
};
