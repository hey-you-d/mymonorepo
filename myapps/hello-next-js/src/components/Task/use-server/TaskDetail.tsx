'use client'
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { Task } from "@/types/Task";

type TaskTableType = {
    row: Task,
    deleteRowFromId: (id: number) => Promise<{ tasks: Task[] }>,
}

export const TaskDetail = ({ row, deleteRowFromId } : TaskTableType) => {
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
