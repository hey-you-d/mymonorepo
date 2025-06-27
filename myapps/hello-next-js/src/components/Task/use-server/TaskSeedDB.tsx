'use client' 
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { Dispatch, SetStateAction, useCallback, useMemo, memo } from 'react';
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
    }, [setButtonDisabled, setTasks, tasks]);

    const renderButton = useMemo((): React.ReactElement => {
        return userAuthenticated 
            ? (
                <button type="button" onClick={onClickHandler} disabled={buttonDisabled}>
                    {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
                </button>
            ) : ( <button type="button" disabled>
                    {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
                </button> 
            );
    }, [userAuthenticated, onClickHandler, tasks, buttonDisabled]); 

    return (
        <>
            <p>{`Currently, there are ${tasks.length} rows in the Tasks table.`}</p>
            {renderButton}
        </>
    );
};

export default memo(TaskSeedDB);
