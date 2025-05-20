'use client' 
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { mutate } from 'swr';
import { Task } from '@/types/Task';

type TaskSeedDBType = {
    tasks: Task[],
    seedTaskDB: () => Promise<{ tasks: Task[] }>,
    deleteAllRows: () => Promise<{ tasks: Task[]}>,
}

export const TaskSeedDBWithSwr = ({ tasks, seedTaskDB, deleteAllRows } : TaskSeedDBType) => {
    const onClickHandler = async (e: React.FormEvent) => {
        e.preventDefault();  
        
        if (tasks.length <= 0) {
            await seedTaskDB()
        } else { 
            await deleteAllRows();
        }
        
        // Trigger client-side revalidation after server action completes
        mutate("Tasks-API-USE-SWR");
    }
     
    return (
        <>
            <p>{`Currently, there are ${tasks.length} rows in the Tasks table.`}</p>
            <button onClick={onClickHandler}>
                {tasks.length <= 0 ? "Seed DB" : "Delete all rows"}
            </button>
        </>
    );
};
