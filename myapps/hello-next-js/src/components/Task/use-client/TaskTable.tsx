'use client'

// for reference: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { Task } from "@/types/Task";
import { MONOREPO_PREFIX, TASKS_CRUD } from "@/lib/app/common";

export type TaskTableType = {
    tasks: Task[], 
    createRow: (tasks: Task[], title: string, detail: string)=> Promise<void>,
    updateRowFromId: (tasks: Task[], id: number, title: string, detail: string, completed: boolean) => Promise<void>
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
    userAuthenticated: boolean,
}

const isSafeInput = (str: string) => {
    // for reference: To prevent SQL injection attack
    // Only allow alphanumeric characters, basic punctuation, and whitespace
    //const regex = /^[a-zA-Z0-9\s.,!?'"()\-_:;]{1,500}$/;
    //return regex.test(str);

    // Length check
    if (str.length === 0 || str.length > 500) return false;

    // Character whitelist - removed potentially dangerous chars
    const allowedChars = /^[a-zA-Z0-9\s.,!?()\-_:]+$/;
    if (!allowedChars.test(str)) return false;

    // Blacklist dangerous patterns
    const dangerousPatterns = [
        /--;/,                    // SQL comment
        /\/\*/,                   // Multi-line comment start
        /\*\//,                   // Multi-line comment end
        /<script/i,               // Script tag
        /javascript:/i,           // JavaScript protocol
        /on\w+\s*=/i,            // Event handlers
        /drop|delete|insert|update|select|union|exec/i // SQL keywords
    ];

    return !dangerousPatterns.some(pattern => pattern.test(str));
};

export const TaskTable = ({ tasks, createRow, updateRowFromId, buttonDisabled, setButtonDisabled, userAuthenticated } : TaskTableType) => {
    const [title, setTitle] = useState("");
    const [detail, setDetail] = useState("");

    const chkBoxHandler = (_: React.MouseEvent, id: number, title: string, detail: string, isCurrentlySelected: boolean) => {
        updateRowFromId(tasks, id, title, detail, !isCurrentlySelected);
    }

    const editTodoHandler = (e: React.MouseEvent, id: number) => {
        e.preventDefault();

        window.location.replace( `${MONOREPO_PREFIX}/${TASKS_CRUD}/edit/${id}`);
    }

    const addNewTodoHandler = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (title.length > 0 && detail.length > 0 && isSafeInput(title) && isSafeInput(detail)) {
            setButtonDisabled(true);
            await createRow(tasks, title, detail);
            setTitle("");
            setDetail("");
            setButtonDisabled(false);
        } else {
            // TODO: visual indicator - e.g. red border styling
        }    
    }, [createRow, tasks, title, detail, setButtonDisabled]);

    const tBody = (): React.ReactElement[] => {
        if (Array.isArray(tasks) && tasks.length > 0) {
            const output:React.ReactElement[] = [];
            
            tasks.forEach(aTask => {
                const checkboxTriggeredByButtonDisabled = !buttonDisabled ? (
                    <input type="checkbox" id={`chkbox-${aTask.id}`} defaultChecked={aTask.completed} 
                            onClick={(e) => chkBoxHandler(e, aTask.id, aTask.title, aTask.detail, aTask.completed)} />
                ) : (
                    <input type="checkbox" id={`chkbox-${aTask.id}`} defaultChecked={aTask.completed} disabled />
                );

                const checkbox = userAuthenticated
                    ? checkboxTriggeredByButtonDisabled
                    : <input type="checkbox" id={`chkbox-${aTask.id}`} defaultChecked={aTask.completed} disabled />;
                  
                    
                const buttonTriggeredByButtonDisabled = buttonDisabled ? (
                    <button type="button" disabled>Edit</button>        
                ) : (
                    <button type="button" onClick={(e) => editTodoHandler(e, aTask.id)}>Edit</button>
                );

                const button = userAuthenticated
                    ? buttonTriggeredByButtonDisabled
                    : <button type="button" disabled>Edit</button>;

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

    const renderAddRowForm = useCallback((isDisabled: boolean): React.ReactElement => {
        const inputTitle = <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />;
        const inputDetail = <input type="text" placeholder="Description" value={detail} onChange={e => setDetail(e.target.value)} />;
        const buttonTriggeredByIsDisabled = !isDisabled
            ? <button type="button" onClick={(e) => addNewTodoHandler(e)}>add</button>
            : <button type="button" disabled>add</button>;

        const button = userAuthenticated
            ? buttonTriggeredByIsDisabled
            : <button type="button" disabled>add</button>;

        return (
            <tr key="add-new-row">
                <td>Add new task:</td>
                <td>{inputTitle}</td>
                <td>{inputDetail}</td>
                <td></td>
                <td>{button}</td>
            </tr>
        );
    }, [addNewTodoHandler, title, detail, userAuthenticated]);

    const tFooter = (): React.ReactElement => {
        if (Array.isArray(tasks) && tasks.length > 0) {
            return (
                <>
                    <tr key="some-total-rows">
                        <td>Total Rows:</td>
                        <td>{tasks.length}</td>
                    </tr>
                    {renderAddRowForm(buttonDisabled)}
                </>
            );
        } 

        return (
            <>
                <tr key="zero-total-row">
                    <td>Total Rows:</td>
                    <td>0</td>
                </tr>
                {renderAddRowForm(true)}
            </>
        );
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
