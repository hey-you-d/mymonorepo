'use client';
import { useState } from 'react';
import { useTaskGraphQLViewModel } from '../../../viewModels/Task/use-client/useTaskGraphQLViewModel'; 
import TaskUser from "./taskUser";
import TaskSeedDB from '@/components/Task/use-client/TaskSeedDB';
import TaskTable from '@/components/Task/use-client/TaskTable';

export const TaskGraphQLPage = () => {
    const { tasks, loading, error, seedTaskDB, deleteAllRows, createRow, updateRowFromId } = useTaskGraphQLViewModel();
       
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
    const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

    const loadingMsg = loading ? <p>Loading...</p> : <></>;
    const errorMsg = !error 
        ? <></>
        : <div><p>{error}</p></div>;
    const authContent = !tasks
        ? <></>
        : <TaskUser userAuthenticated={userAuthenticated} setUserAuthenticated={setUserAuthenticated} />;     
    const seedContent = !tasks 
        ? <></>
        : (
            <TaskSeedDB 
                totalRows={tasks.length} 
                seedTaskDB={seedTaskDB} 
                deleteAllRows={deleteAllRows} 
                buttonDisabled={buttonDisabled}
                setButtonDisabled={setButtonDisabled}
                userAuthenticated={userAuthenticated}      
            />
        ); 

    return tasks ? (
        <>
            <h2>Data fetching & querying with Apollo Graphql Server</h2>
            {authContent}
            {!error && loadingMsg}
            {errorMsg}
            {seedContent}
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