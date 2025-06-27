'use client'
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import type { Task } from "@/types/Task";
import { Dispatch, SetStateAction, MouseEvent, useCallback, memo } from "react";
import { mutate } from "swr";

export type TaskDetailWithSwrType = {
    row: Task,
    setTask: Dispatch<SetStateAction<Task | null>>, 
    deleteRowFromId: (id: number) => Promise<{ tasks: Task[] |  null }>,
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
};

const TaskDetailWithSwr = ({ row, setTask, deleteRowFromId, buttonDisabled, setButtonDisabled } : TaskDetailWithSwrType) => {
    const onClickHandler = useCallback(async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try { 
            setButtonDisabled(true);
            
            //const result = await deleteRowFromId(Number(row.id));
            await deleteRowFromId(Number(row.id));
            
            // Trigger client-side revalidation after server action completes
            mutate("Tasks-API-USE-SWR");
            
            setTask(null);
    
            setButtonDisabled(false);
        } catch(e) {
            throw new Error(`Delete row ${row.id} failed: ${e}`);
        }
    }, [setButtonDisabled, deleteRowFromId, setTask, setButtonDisabled, row]);

    return (
        <>
            <p>id: {row.id}</p>
            <p>title: {row.title}</p>
            <p>detail: {row.detail}</p>
            <p>completed? {row.completed ? "yes" : "no"}</p>
            <div>
                <button type="button" onClick={(e) => onClickHandler(e)} disabled={buttonDisabled}>Delete this record</button>
            </div>
        </>
    );    
};

export default memo(TaskDetailWithSwr);