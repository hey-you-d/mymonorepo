// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import React, { useState } from 'react';
import { Task } from "../types/Task";

type TaskTableType = {
    id: number,
    tasks: Task[], 
    getRowFromId: (id: number) => Promise<void>,
    deleteRowFromId: (id: number) => Promise<void>,
}

export const TaskDetail = ({ id, tasks, getRowFromId, deleteRowFromId } : TaskTableType) => {
    const [row, setRow] = useState<Task | undefined>(undefined);

    React.useEffect(() => {
            const row = tasks.find((el) => el.id == Number(id));
            //console.log("TaskDetail ", id, row);
            setRow(row);
            //getRowFromId(id);
         
    }, [id, tasks, getRowFromId]);

    const deleteRowHandler = (e: React.MouseEvent) => {
        e.preventDefault();

        deleteRowFromId(Number(id));
    }

    return row && row.id ? 
    (
        <>
            <p>id: {row.id}</p>
            <p>title: {row.title}</p>
            <p>detail: {row.detail}</p>
            <p>completed? {row.completed ? "yes" : "no"}</p>
            <div><button type="button" onClick={(e) => deleteRowHandler(e)}>Delete this record</button></div>
        </>
    ) : <p>None</p>
};
