'use client'

// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import React from 'react';
import { Task } from "../types/Task";
import { MONOREPO_PREFIX } from "../../../global/common";

type TaskTableType = {
    row: Task,
    tasks: Task[] | undefined,
    deleteRowFromId: (id: number) => Promise<void>,
}

export const TaskDetail = ({ row, tasks, deleteRowFromId } : TaskTableType) => {
    // dev note: the if condition below only applies to the non-graphql row deletion op.
    // the graphql version returns an updated tasks (sans the deleted row). 
    if (tasks && tasks.length <= 0) {
        // dev note: a delete row operation has just been performed by calling the deleteRowFromId().
        // recall, the deleteRowFromId will set the tasks state to [] upon successful delete op.
        // redirect back to the table page
        window.location.href=`${MONOREPO_PREFIX}/bff-tasks-db`;
    }

    return (
        <>
            <p>id: {row.id}</p>
            <p>title: {row.title}</p>
            <p>detail: {row.detail}</p>
            <p>completed? {row.completed ? "yes" : "no"}</p>
            <div><button type="button" onClick={() => deleteRowFromId(Number(row.id))}>Delete this record</button></div>
        </>
    );    
};
