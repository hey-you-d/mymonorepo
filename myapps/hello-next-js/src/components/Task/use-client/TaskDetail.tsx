'use client'

// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { Dispatch, SetStateAction, MouseEvent } from 'react';
import { Task } from "@/types/Task";
import { MONOREPO_PREFIX, TASKS_CRUD } from "@/lib/app/common";

export type TaskDetailType = {
    row: Task,
    tasks: Task[] | undefined,
    deleteRowFromId: (id: number) => Promise<void>,
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
}

export const TaskDetail = ({ row, tasks, deleteRowFromId, buttonDisabled, setButtonDisabled } : TaskDetailType) => {
    // for reference: the if condition below only applies to the non-graphql row deletion op.
    // the graphql version returns an updated tasks (sans the deleted row). 
    if (tasks && tasks.length <= 0) {
        // for reference: a delete row operation has just been performed by calling the deleteRowFromId().
        // recall, the deleteRowFromId will set the tasks state to [] upon successful delete op.
        // redirect back to the table page
        window.location.href=`${MONOREPO_PREFIX}${TASKS_CRUD}`;
    }

    const onClickHandler = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        setButtonDisabled(true);
        try { 
            await deleteRowFromId(Number(row.id));
            setButtonDisabled(false);
        } catch(e) {
            throw new Error(`Delete row ${row.id} failed: ${e}`);
        }
    }

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
