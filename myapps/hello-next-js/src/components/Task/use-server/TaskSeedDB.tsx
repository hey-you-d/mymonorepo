'use client' 
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { Dispatch, SetStateAction, useCallback, memo } from 'react';
import type { Task } from '@/types/Task';

type TaskSeedDBType = {
    tasks: Task[],
    setTasks: Dispatch<SetStateAction<Task[]>>, 
    seedTaskDB: () => Promise<{ tasks: Task[] }>,
    deleteAllRows: () => Promise<{ tasks: Task[]}>,
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
    userAuthenticated: boolean,
}

const TaskSeedDB = ({ tasks, setTasks, seedTaskDB, deleteAllRows, buttonDisabled, setButtonDisabled, userAuthenticated } : TaskSeedDBType) => {
    const onClickHandler = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        setButtonDisabled(true);
        
        const updatedTasks = tasks.length <= 0 ? await seedTaskDB() : await deleteAllRows();        
        setTasks(updatedTasks.tasks);
        
        setButtonDisabled(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks, seedTaskDB, deleteAllRows]);
    // for reference: excluded from useCallback dependencies:
    // - setButtonDisabled & setTask are state setters and don't need to be a dependency 

    // for reference: renderButton is not wrapped in useMemo because:
    // - It depends on userAuthenticated, totalRows, buttonDisabled, and onClickHandler - some of these change frequently.
    // - The logic is just a simple ternary operator based on userAuthenticated and totalRows - this is very fast to compute.
    const renderButton = (): React.ReactElement => {
        return userAuthenticated 
            ? (
                <button type="button" onClick={onClickHandler} disabled={buttonDisabled}>
                    {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
                </button>
            ) : ( <button type="button" disabled>
                    {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
                </button> 
            );
    }; 

    return (
        <>
            <p>{`Currently, there are ${tasks.length} rows in the Tasks table.`}</p>
            {renderButton()}
        </>
    );
};

export default memo(TaskSeedDB);
