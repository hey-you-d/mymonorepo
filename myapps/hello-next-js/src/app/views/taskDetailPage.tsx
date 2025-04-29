// The View connects the ViewModel and UI component
import { useTaskViewModel } from '../viewModels/useTasksViewModel';
import { TaskDetail } from '../components/TaskDetail';

export const TaskDetailPage = ({id}: {id: number}) => {
  const { tasks, loading, getRowFromId, deleteRowFromId } = useTaskViewModel();
  
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <TaskDetail id={id} tasks={tasks} getRowFromId={getRowFromId} deleteRowFromId={deleteRowFromId} />
    </>
  );
};
