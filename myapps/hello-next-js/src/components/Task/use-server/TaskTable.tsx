'use client'
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { useCallback, useMemo, memo, useRef, Dispatch, SetStateAction } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Task } from "@/types/Task";
import { MONOREPO_PREFIX, TASKS_CRUD, isSafeInput } from "@/lib/app/common";

// for reference: 
// ** ->: the viewmodel fn returns the promise of updated Tasks, not 
// the promise of a single task (either a newly created one or newly updated one) 
type TaskTableDefaultType = {
    tasks: Task[],
    setTasks: Dispatch<SetStateAction<Task[]>>, 
    createRow: (tasks: Task[], title: string, detail: string)=> Promise<{ tasks: Task[] }>, // **
    updateRowFromId: (tasks: Task[], id: number, title: string, detail: string, completed: boolean) => Promise<{ tasks: Task[] | null }> // **
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
    userAuthenticated: boolean,
}
export type TaskTableType = TaskTableDefaultType;

const TaskTable = ({ tasks, setTasks, createRow, updateRowFromId, buttonDisabled, setButtonDisabled, userAuthenticated } : TaskTableType) => {
    const appRouter = useRouter();
    const inputTitleRef = useRef<HTMLInputElement>(null);
    const inputDetailRef = useRef<HTMLInputElement>(null);
    
    const pathName = usePathname();
    
    const chkBoxHandler = useCallback(async (_: React.MouseEvent, id: number, title: string, detail: string, isCurrentlySelected: boolean) => {
        setButtonDisabled(true);
        const result: { tasks: Task[] | null } = await updateRowFromId(tasks, id, title, detail, !isCurrentlySelected);
        setTasks(result.tasks ?? tasks);
        setButtonDisabled(false);
    }, [setButtonDisabled, setTasks, updateRowFromId, tasks]);

    const editTodoHandler = useCallback((e: React.MouseEvent, id: number) => {
        e.preventDefault();
        appRouter.push(`${MONOREPO_PREFIX}/${TASKS_CRUD}/use-server/edit/${id}?from=${pathName}`);
    }, [appRouter, pathName]);

    const addNewTodoHandler = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        if (inputTitleRef.current && inputDetailRef.current && 
            inputTitleRef.current.value.length > 0 && 
            isSafeInput(inputTitleRef.current.value) &&
            isSafeInput(inputDetailRef.current.value)) {
                setButtonDisabled(true);
                
                const result: { tasks: Task[] } = await createRow(tasks, inputTitleRef.current.value, inputDetailRef.current.value);

                inputTitleRef.current.value = "";
                inputDetailRef.current.value = "";
                
                setTasks(result.tasks);
                
                setButtonDisabled(false);
        } else {
            // TODO: visual indicator - e.g. red border styling
        }
    }, [createRow, setTasks, tasks, setButtonDisabled]);

    const tBody = useMemo((): React.ReactElement[] => {
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
    }, [tasks, userAuthenticated, chkBoxHandler, editTodoHandler]);

    const renderAddRowForm = useCallback((isDisabled: boolean): React.ReactElement[] => {
        const inputForTitle = <input type="text" ref={inputTitleRef} placeholder="Title" defaultValue="" />;
        const inputForDetail = <input type="text" ref={inputDetailRef} placeholder="Description" defaultValue="" />;
        const buttonTriggeredByIsDisabled = !isDisabled
            ? <button type="button" onClick={(e) => addNewTodoHandler(e)}>add</button>
            : <button type="button" disabled>add</button>;

        const button = userAuthenticated
            ? buttonTriggeredByIsDisabled
            : <button type="button" disabled>add</button>;

        return ([
            <>
                <td>Add new task:</td>
                <td>{inputForTitle}</td>
                <td>{inputForDetail}</td>
                <td></td>
                <td>{button}</td>
            </>
        ]);
    }, [addNewTodoHandler, userAuthenticated]);

    const tFooter = useMemo((): React.ReactElement[] => {
        if (Array.isArray(tasks) && tasks.length > 0) {
            return [
                <>
                    <tr key="some-total-rows">
                        <td>Total Rows:</td>
                        <td>{tasks.length}</td>
                    </tr>
                    <tr key="add-row-disabled">
                        {renderAddRowForm(buttonDisabled)}
                    </tr>
                </>
            ];
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
    }, [tasks, renderAddRowForm, buttonDisabled]);

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

export default memo(TaskTable);
