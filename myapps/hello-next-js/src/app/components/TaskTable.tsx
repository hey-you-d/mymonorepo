'use client'

// for reference: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import React, { useCallback, useRef } from 'react';
import { Task } from "../types/Task";
import { MONOREPO_PREFIX, TASKS_CRUD } from "../../../global/common";

type TaskTableType = {
    tasks: Task[], 
    createRow: (title: string, detail: string)=> Promise<void>,
    updateRowFromId: (id: number, title: string, detail: string, completed: boolean) => Promise<void>
}

const isSafeInput = (str: string) => {
    // for reference: To prevent SQL injection attack
    // Only allow alphanumeric characters, basic punctuation, and whitespace
    const regex = /^[a-zA-Z0-9\s.,!?'"()\-_:;]{1,500}$/;
    return regex.test(str);
};

export const TaskTable = ({ tasks, createRow, updateRowFromId } : TaskTableType) => {
    const inputTitleRef = useRef<HTMLInputElement>(null);
    const inputDetailRef = useRef<HTMLInputElement>(null);
    
    const chkBoxHandler = (_: React.MouseEvent, id: number, title: string, detail: string, isCurrentlySelected: boolean) => {
        updateRowFromId(id, title, detail, !isCurrentlySelected);
    }

    const editTodoHandler = (e: React.MouseEvent, id: number) => {
        e.preventDefault();

        window.location.replace( `${MONOREPO_PREFIX}/${TASKS_CRUD}/edit/${id}`);
    }

    const addNewTodoHandler = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (inputTitleRef.current && inputDetailRef.current && 
            inputTitleRef.current.value.length > 0 && 
            isSafeInput(inputTitleRef.current.value) &&
            isSafeInput(inputDetailRef.current.value)) {
                createRow(inputTitleRef.current.value, inputDetailRef.current.value);
                inputTitleRef.current.value = "";
                inputDetailRef.current.value = "";
        } else {
            // TODO: visual indicator - e.g. red border styling
        }
    }, [createRow]);

    const tBody = (): React.ReactElement[] => {
        if (Array.isArray(tasks) && tasks.length > 0) {
            const output:React.ReactElement[] = [];
            
            tasks.forEach(aTask => {
                // make checkbox uncontrolled
                const checkbox = (
                    <input type="checkbox" id={`chkbox-${aTask.id}`} defaultChecked={aTask.completed} 
                            onClick={(e) => chkBoxHandler(e, aTask.id, aTask.title, aTask.detail, aTask.completed)} />);
                
                const button = (<button type="button" onClick={(e) => editTodoHandler(e, aTask.id)}>Edit</button>);    

                output.push(
                    <tr key={aTask.id}>
                        <td>{aTask.id}</td>
                        <td>{aTask.title}</td>
                        <td>{aTask.detail}</td>
                        <td>{checkbox}</td>
                        <td>{button}</td>
                    </tr>
                );
            });

            return output;
        } 

        return [
            <tr key="random string here">
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
        ];
    }

    const renderAddRowForm = useCallback((isDisabled: boolean): React.ReactElement[] => {
        const inputForTitle = !isDisabled
            ? <input type="text" ref={inputTitleRef} placeholder="Title" defaultValue="" />
            : <input type="text" placeholder="Title" defaultValue="" disabled></input>;

        const inputForDetail = !isDisabled
            ? <input type="text" ref={inputDetailRef} placeholder="Description" defaultValue="" />
            : <input type="text" placeholder="Description" defaultValue="" disabled></input>;

        const button = !isDisabled
            ? <button type="button" onClick={(e) => addNewTodoHandler(e)}>add</button>
            : <button disabled type="button">add</button>;

        return ([
            <>
                <td>Add new task:</td>
                <td>{inputForTitle}</td>
                <td>{inputForDetail}</td>
                <td></td>
                <td>{button}</td>
            </>
        ]);
    }, [addNewTodoHandler]);

    const tFooter = (): React.ReactElement[] => {
        if (Array.isArray(tasks) && tasks.length > 0) {
            const output:React.ReactElement[] = [];
            
            return [
                <>
                    <tr key="some-total-rows">
                        <td>Total Rows:</td>
                        <td>{tasks.length}</td>
                    </tr>
                    <tr key="add-row-disabled">
                        {renderAddRowForm(false)}
                    </tr>
                </>
            ];

            return output;
        } 

        return [
            <>
                <tr key="zero-total-row">
                    <td>Total Rows:</td>
                    <td>0</td>
                </tr>
                <tr key="add-row-enabled">
                    {renderAddRowForm(true)}
                </tr>
            </>
        ];
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
