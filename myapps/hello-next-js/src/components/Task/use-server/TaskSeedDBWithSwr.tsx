'use client' 
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { Dispatch, SetStateAction } from 'react';
import { mutate } from 'swr';
import type { Task } from '@/types/Task';

// For reference: **
// the viewmodel fn will call revalidateTag to refresh the tasks array instead of returning the updated tasks array
export type TaskSeedDBType = {
    tasks: Task[],
    seedTaskDB: () => Promise<void>, // **
    deleteAllRows: () => Promise<void>, // **
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
    userAuthenticated: boolean,
}

export const TaskSeedDBWithSwr = ({ tasks, seedTaskDB, deleteAllRows, buttonDisabled, setButtonDisabled, userAuthenticated } : TaskSeedDBType) => {
    const onClickHandler = async (e: React.FormEvent) => {
        e.preventDefault();  

        setButtonDisabled(true);
        
        if (tasks.length <= 0) {
            await seedTaskDB()
        } else { 
            await deleteAllRows();
        }
        
        // Trigger client-side revalidation after server action completes
        mutate("Tasks-API-USE-SWR");

        setButtonDisabled(false);
    }

    const renderButtonTriggeredByButtonDisabled: React.ReactElement = buttonDisabled ? (
        <button type="button" disabled>
            {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
        </button>
    ) : (
        <button type="button" onClick={onClickHandler}>
            {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
        </button>
    );

    const renderButton: React.ReactElement = userAuthenticated 
    ? ( <button type="button" onClick={onClickHandler} disabled={buttonDisabled}>
            {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
        </button>
    ) : ( <button type="button" disabled>
            {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
        </button> );
     
    return (
        <>
            <p>{`Currently, there are ${tasks.length} rows in the Tasks table.`}</p>
            { renderButton }
        </>
    );
};
