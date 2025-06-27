'use client';
import { useState } from 'react';
import { useTaskApolloClientViewModel } from '@/viewModels/Task/use-client/useTaskApolloClientViewModel';
import TaskUser from "./taskUser";
import TaskSeedDB from '@/components/Task/use-client/TaskSeedDB';
import TaskTable from '@/components/Task/use-client/TaskTable';

export const TaskApolloClientPage = () => {
    const { tasks, loading, error, seedTaskDB, deleteAllRows, createRow, updateRowFromId } = useTaskApolloClientViewModel();
    
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
    const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return tasks ? (
        <>
            <h2>Data fetching & querying with Apollo Graphql Server & Client</h2>
            <TaskUser userAuthenticated={userAuthenticated} setUserAuthenticated={setUserAuthenticated} />
            <TaskSeedDB 
                totalRows={tasks.length} 
                seedTaskDB={seedTaskDB} 
                deleteAllRows={deleteAllRows} 
                buttonDisabled={buttonDisabled}
                setButtonDisabled={setButtonDisabled}
                userAuthenticated={userAuthenticated}
            />
            <TaskTable 
                tasks={tasks} 
                createRow={createRow} 
                updateRowFromId={updateRowFromId} 
                buttonDisabled={buttonDisabled}
                setButtonDisabled={setButtonDisabled} 
                userAuthenticated={userAuthenticated}
            />
        </>
    ) : (<></>);
}
