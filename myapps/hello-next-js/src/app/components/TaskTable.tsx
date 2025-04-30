// DEV NOTE: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import React, { useRef } from 'react';
import { Task } from "../types/Task";
import { MONOREPO_PREFIX } from "../../../constants/common";

type TaskTableType = {
    tasks: Task[], 
    createRow: (title: string, detail: string)=> Promise<void>,
    updateRowFromId: (id: number, title: string, detail: string, completed: boolean) => Promise<void>
}

const isSafeInput = (str: string) => {
    // DEV NOTE: To prevent SQL injection attack
    // Only allow alphanumeric characters, basic punctuation, and whitespace
    const regex = /^[a-zA-Z0-9\s.,!?'"()\-_:;]{1,500}$/;
    return regex.test(str);
};

export const TaskTable = ({ tasks, createRow, updateRowFromId } : TaskTableType) => {
    const inputTitleRef = useRef<HTMLInputElement>(null);
    const inputDetailRef = useRef<HTMLInputElement>(null);
    
    const chkBoxHandler = (e: React.MouseEvent,id: number, title: string, detail: string, isCurrentlySelected: boolean) => {
        e.preventDefault();
        updateRowFromId(id, title, detail, !isCurrentlySelected);
    }

    const editTodoHandler = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        window.location.replace( `${MONOREPO_PREFIX}/bff-tasks-db/${id}`);
    }

    const addNewTodoHandler = (e: React.MouseEvent) => {
        e.preventDefault();
        if (inputTitleRef.current && inputDetailRef.current && 
            inputTitleRef.current.value.length > 0 && 
            isSafeInput(inputTitleRef.current.value) &&
            isSafeInput(inputDetailRef.current.value)) {
                createRow(inputTitleRef.current.value, inputDetailRef.current.value);
        } else {
            // TODO: red border styling
        }
    }

    let tBody: React.ReactElement[] = [];
    let tFooter: React.ReactElement[] = [];
    // TODO: refactor the if condition below
    if (Array.isArray(tasks) && tasks.length > 0) {
        // DEV NOTE: tbody content
        tasks.forEach(aTask => {
            const checkbox = aTask.completed 
                ? <input type="checkbox" id={`chkbox-${aTask.id}`} checked 
                    onClick={(e) => chkBoxHandler(e, aTask.id, aTask.title, aTask.detail, true)} />
                : <input type="checkbox" id={`chkbox-${aTask.id}`} 
                    onClick={(e) => chkBoxHandler(e, aTask.id, aTask.title, aTask.detail, false)} />

            tBody.push(
                <tr key={aTask.id}>
                    <td>{aTask.id}</td>
                    <td>{aTask.title}</td>
                    <td>{aTask.detail}</td>
                    <td>{checkbox}</td>
                    <td><button type="button" onClick={(e) => editTodoHandler(e, aTask.id)}>Edit</button></td>
                </tr>
            );
        });
        // DEV NOTE: tfoot content
        tFooter.push(
            <>
                <tr>
                    <td>Total Rows:</td>
                    <td>{tasks.length}</td>
                </tr>
                <tr>
                    <td>new todo:</td>
                    <td><input type="text" ref={inputTitleRef} placeholder="Title" /></td>
                    <td><input type="text" ref={inputDetailRef} placeholder="Description" /></td>
                    <td><button type="button" onClick={(e) => addNewTodoHandler(e)}>add</button></td>
                </tr>
            </>
        );
    } else {
        // DEV NOTE: tbody content
        tBody.push(
            <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
        );
        // DEV NOTE: tfoot content
        tFooter.push(
            <>
                <tr>
                    <td>Total Rows:</td>
                    <td>0</td>
                </tr>
                <tr>
                    <td>new todo:</td>
                    <td><input type="text" id="form-new-todo-title" placeholder="Title" disabled></input></td>
                    <td><input type="text" id="form-new-todo-detail" placeholder="Description" disabled></input></td>
                    <td><button disabled type="button" onClick={addNewTodoHandler}>add</button></td>
                </tr>
            </>
        );
    }

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
                    <th/>
                </tr>
            </thead>
            <tbody>
               {tBody}
            </tbody>
            <tfoot>
               {tFooter}
            </tfoot>
        </table>
    )
};
