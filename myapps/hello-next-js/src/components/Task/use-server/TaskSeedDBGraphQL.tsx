'use client' 
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { Dispatch, SetStateAction } from 'react';
import { Task } from '@/types/Task';

type TaskSeedDBGraphQLType = {
    tasks: Task[],
    setTasks: Dispatch<SetStateAction<Task[]>>, 
    seedTaskDB: () => Promise<Task[] | undefined>, // !!! different return value from TaskSeedDBType
    deleteAllRows: () => Promise<Task[] | undefined>, // !!! different return value from TaskSeedDBType
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
}

export const TaskSeedDBGraphQL = ({ tasks, setTasks, seedTaskDB, deleteAllRows, buttonDisabled, setButtonDisabled } : TaskSeedDBGraphQLType) => {
    const onClickHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setButtonDisabled(true);
        
        const updatedTasks = tasks.length <= 0 ? await seedTaskDB() : await deleteAllRows();        

        if (updatedTasks) {
            setTasks(updatedTasks);
        }
        
        setButtonDisabled(false);
    }

    const renderButton: React.ReactElement = buttonDisabled ? (
        <button type="button" disabled>
            {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
        </button>
    ) : (
        <button type="button" onClick={onClickHandler}>
            {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
        </button>
    );
     
    return (
        <>
            <p>{`Currently, there are ${tasks.length} rows in the Tasks table.`}</p>
            {renderButton}
        </>
    );
};
