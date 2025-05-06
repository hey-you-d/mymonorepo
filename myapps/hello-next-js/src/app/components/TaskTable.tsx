// DEV NOTE: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import React, { useCallback, useRef } from 'react';
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
        window.location.replace( `${MONOREPO_PREFIX}/bff-tasks-db/edit/${id}`);
    }

    const addNewTodoHandler = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (inputTitleRef.current && inputDetailRef.current && 
            inputTitleRef.current.value.length > 0 && 
            isSafeInput(inputTitleRef.current.value) &&
            isSafeInput(inputDetailRef.current.value)) {
                createRow(inputTitleRef.current.value, inputDetailRef.current.value);
        } else {
            // TODO: red border styling
        }
    }, [createRow]);

    const tBody = (): React.ReactElement[] => {
        console.log("tBody ", tasks);
        if (Array.isArray(tasks) && tasks.length > 0) {
            const output:React.ReactElement[] = [];
            
            tasks.forEach(aTask => {
                const checkbox = aTask.completed 
                    ? <input type="checkbox" id={`chkbox-${aTask.id}`} checked 
                        onClick={(e) => chkBoxHandler(e, aTask.id, aTask.title, aTask.detail, true)} />
                    : <input type="checkbox" id={`chkbox-${aTask.id}`} 
                        onClick={(e) => chkBoxHandler(e, aTask.id, aTask.title, aTask.detail, false)} />
    
                output.push(
                    <tr key={aTask.id}>
                        <td>{aTask.id}</td>
                        <td>{aTask.title}</td>
                        <td>{aTask.detail}</td>
                        <td>{checkbox}</td>
                        <td><button type="button" onClick={(e) => editTodoHandler(e, aTask.id)}>Edit</button></td>
                    </tr>
                );
            });

            return output;
        } 

        return[(
            <tr key="random string here">
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
        )];
    }

    const renderAddRowForm = useCallback((isDisabled: boolean): React.ReactElement[] => {
        const output: React.ReactElement[] = [];
        
        output.push(<td>new todo:</td>);
        if (!isDisabled) {
            output.push(
                <>
                    <td><input type="text" ref={inputTitleRef} placeholder="Title" /></td>
                    <td><input type="text" ref={inputDetailRef} placeholder="Description" /></td>
                    <td><button type="button" onClick={(e) => addNewTodoHandler(e)}>add</button></td>
                </>
            );
        } else {
            output.push(
                <>
                    <td><input type="text" placeholder="Title" disabled></input></td>
                    <td><input type="text" placeholder="Description" disabled></input></td>
                    <td><button disabled type="button">add</button></td>
                </>
            );
        }

        return output;
    }, [addNewTodoHandler]);

    const tFooter = (): React.ReactElement[] => {
        if (Array.isArray(tasks) && tasks.length > 0) {
            const output:React.ReactElement[] = [];
            
            output.push(
                <>
                    <tr>
                        <td>Total Rows:</td>
                        <td>{tasks.length}</td>
                    </tr>
                    <tr>
                        {renderAddRowForm(false)}
                    </tr>
                </>
            );

            return output;
        } 

        return[(
            <>
                <tr>
                    <td>Total Rows:</td>
                    <td>0</td>
                </tr>
                <tr>
                    {renderAddRowForm(true)}
                </tr>
            </>
        )];
    };

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
               {tBody()}
            </tbody>
            <tfoot>
               {tFooter()}
            </tfoot>
        </table>
    )
};
