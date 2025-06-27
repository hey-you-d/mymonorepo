'use client'
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import type { Task } from "@/types/Task";
import { Dispatch, SetStateAction, MouseEvent, useCallback, memo } from "react";

type TaskTableType = {
    row: Task,
    setTask: Dispatch<SetStateAction<Task | null>>, 
    deleteRowFromId: (id: number) => Promise<{ tasks: Task[] |  null }>,
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
}

const TaskDetail = ({ row, setTask, deleteRowFromId, buttonDisabled, setButtonDisabled } : TaskTableType) => {
    const onClickHandler = useCallback(async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        setButtonDisabled(true);
        
        try { 
            //const result = await deleteRowFromId(Number(row.id));
            await deleteRowFromId(Number(row.id));
            setTask(null);
    
            setButtonDisabled(false);
        } catch(e) {
            throw new Error(`Delete row ${row.id} failed: ${e}`);
        }
    }, [setButtonDisabled, deleteRowFromId, row]);

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

export default memo(TaskDetail);