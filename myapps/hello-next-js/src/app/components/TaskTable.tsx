// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import React from 'react';
import { Task } from "../types/Task";

type TaskTableType = {
    tasks: Task[], 
}

export const TaskTable = ({ tasks } : TaskTableType) => {
    const addNewTodoHandler = (e: React.FormEvent) => {
        e.preventDefault();
        
    }

    let tBody: React.ReactElement[] = [];
    tasks.forEach(aTask => {
        const checkbox = aTask.completed 
            ? <input type="checkbox" id={`chkbox-${aTask.id}`} checked></input>
            : <input type="checkbox" id={`chkbox-${aTask.id}`}></input>
        tBody.push(
            <tr>
                <td>{aTask.id}</td>
                <td>{aTask.title}</td>
                <td>{aTask.detail}</td>
                <td>{checkbox}</td>
            </tr>
        );
    });

    return (
        <table>
            <caption><h1>Todo list</h1></caption>
            <thead>
                <tr>
                    <th>
                        ID
                    </th>
                    <th>
                        Task
                    </th>
                    <th>
                        Description 
                    </th>
                    <th>
                        Completed?
                    </th>
                </tr>
            </thead>
            <tbody>
                {tBody}
            </tbody>
            <tfoot>
                <tr>
                    <td>Total Rows:</td>
                    <td>{tasks.length}</td>
                </tr>
                <tr>
                    <td>new todo:</td>
                    <td><input type="text" id="form-new-todo-title" placeholder="Title"></input></td>
                    <td><input type="text" id="form-new-todo-detail" placeholder="Description"></input></td>
                    <td><button onSubmit={addNewTodoHandler}>add</button></td>
                </tr>
            </tfoot>
        </table>
    )
};
