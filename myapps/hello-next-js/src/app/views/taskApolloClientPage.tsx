'use client';
import { useTaskApolloClientViewModel } from '../viewModels/useTaskApolloClientViewModel'; 
import { TaskSeedDB } from '../components/TaskSeedDB';
import { TaskTable } from '../components/TaskTable';

export const TaskApolloClientPage = () => {
    const { tasks, loading, error, seedTaskDB, deleteAllRows, createRow, updateRowFromId } = useTaskApolloClientViewModel();
        
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return tasks ? (
        <>
            <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTaskDB} deleteAllRows={deleteAllRows} />
            <TaskTable tasks={tasks} createRow={createRow} updateRowFromId={updateRowFromId} />
        </>
    ) : (<></>);
}
