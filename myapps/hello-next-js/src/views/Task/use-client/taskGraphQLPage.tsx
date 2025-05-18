'use client';
import { useTaskGraphQLViewModel } from '../../../viewModels/Task/use-client/useTaskGraphQLViewModel'; 
import { TaskSeedDB } from '@/components/Task/use-client/TaskSeedDB';
import { TaskTable } from '@/components/Task/use-client/TaskTable';

export const TaskGraphQLPage = () => {
    const { tasks, loading, error, seedTaskDB, deleteAllRows, createRow, updateRowFromId } = useTaskGraphQLViewModel();
        
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return tasks ? (
        <>
            <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTaskDB} deleteAllRows={deleteAllRows} />
            <TaskTable tasks={tasks} createRow={createRow} updateRowFromId={updateRowFromId} />
        </>
    ) : (<></>);
}