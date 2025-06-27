'use client'

// for reference: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { memo, useState, useMemo, useCallback, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/router';
import type { Task } from "@/types/Task";
import { MONOREPO_PREFIX, TASKS_CRUD, isSafeInput } from "@/lib/app/common";

export type TaskTableType = {
    tasks: Task[], 
    createRow: (tasks: Task[], title: string, detail: string)=> Promise<void>,
    updateRowFromId: (tasks: Task[], id: number, title: string, detail: string, completed: boolean) => Promise<void>
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
    userAuthenticated: boolean,
}

const TaskTable = ({ tasks, createRow, updateRowFromId, buttonDisabled, setButtonDisabled, userAuthenticated } : TaskTableType) => {
    const [title, setTitle] = useState("");
    const [detail, setDetail] = useState("");

    const router = useRouter();

    const chkBoxHandler = useCallback((_: React.MouseEvent, id: number, title: string, detail: string, isCurrentlySelected: boolean) => {
        updateRowFromId(tasks, id, title, detail, !isCurrentlySelected);
    }, [updateRowFromId, tasks]);
    
    const editTodoHandler = useCallback((e: React.MouseEvent, id: number) => {
        e.preventDefault();

        // render the following next.js Page route: /pages/task-crud-fullstack/edit/[id].tsx
        window.location.replace( `${MONOREPO_PREFIX}/${TASKS_CRUD}/edit/${id}?from=${router.asPath}`);
    }, [router.asPath]);
    // for reference: excluded from useCallback dependencies:
    // - MONOREPO_PREFIX and TASKS_CRUD are constants and don't need to be dependencies
    // - router object is stable in Next.js and doesn't change between renders
    
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
        // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [createRow, tasks, title, detail]);
    // for reference: excluded from useCallback dependencies:
    // - setButtonDisabled is a state setter and doesn't need to be a dependency
    // for reference: included in useCallback dependencies:
    // - Including title and detail means the function recreates every time user types
    // - tasks changes frequently, causing unnecessary recreations

    const tBody = useMemo<React.ReactElement[]>((): React.ReactElement[] => {
        if (Array.isArray(tasks) && tasks.length > 0) {
            const output:React.ReactElement[] = [];
            
            tasks.forEach(aTask => {
                const checkbox = userAuthenticated
                    ? <input type="checkbox" id={`chkbox-${aTask.id}`} defaultChecked={aTask.completed} disabled={buttonDisabled}
                            onClick={(e) => chkBoxHandler(e, aTask.id, aTask.title, aTask.detail, aTask.completed)} />
                    : <input type="checkbox" id={`chkbox-${aTask.id}`} defaultChecked={aTask.completed} disabled />;
                 
                const button = userAuthenticated
                    ? <button type="button" onClick={(e) => editTodoHandler(e, aTask.id)} disabled={buttonDisabled}>Edit</button>
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
    }, [tasks, userAuthenticated, editTodoHandler, buttonDisabled, chkBoxHandler]);

    // for reference: neither useCallback nor useMemo will help because dependencies changes frequently: 
    // - title and detail change on every keystroke 
    // - buttonDisabled toggles during operations
    // - userAuthenticated can change during the session
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const renderAddRowForm = (isDisabled: boolean): React.ReactElement => {
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
    };

    const tFooter = useMemo<React.ReactElement>((): React.ReactElement => {
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
    }, [renderAddRowForm, tasks, buttonDisabled]);

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

export default  memo(TaskTable);
