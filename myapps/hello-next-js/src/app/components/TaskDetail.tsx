// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import React from 'react';
import { Task } from "../types/Task";
import { MONOREPO_PREFIX } from "../../../constants/common";

type TaskTableType = {
    row: Task,
    tasks: Task[],
    deleteRowFromId: (id: number) => Promise<void>,
}

export const TaskDetail = ({ row, tasks, deleteRowFromId } : TaskTableType) => {
    if (tasks.length <= 0) {
        // a delete row operation has just been performed by calling the deleteRowFromId().
        // recall, the deleteRowFromId will set the tasks state to [] upon successful delete op.
        // redirect back to the table page
        window.location.href=`${MONOREPO_PREFIX}/bff-tasks-db`;
    }

    return row && row.id ? 
    (
        <>
            <p>id: {row.id}</p>
            <p>title: {row.title}</p>
            <p>detail: {row.detail}</p>
            <p>completed? {row.completed ? "yes" : "no"}</p>
            <div><button type="button" onClick={() => deleteRowFromId(Number(row.id))}>Delete this record</button></div>
        </>
    ) : <p>None</p>
};
