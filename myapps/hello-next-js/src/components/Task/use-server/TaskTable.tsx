'use client'
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { useCallback, useRef, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from "@/types/Task";
import { MONOREPO_PREFIX, TASKS_CRUD } from "@/lib/app/common";

// for reference: 
// ** ->: the viewmodel fn returns the promise of updated Tasks, not 
// the promise of a single task (either a newly created one or newly updated one) 
type TaskTableDefaultType = {
    tasks: Task[],
    setTasks: Dispatch<SetStateAction<Task[]>>, 
    createRow: (tasks: Task[], title: string, detail: string)=> Promise<{ tasks: Task[] }>, // **
    updateRowFromId: (tasks: Task[], id: number, title: string, detail: string, completed: boolean) => Promise<{ tasks: Task[] }> // **
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
    userAuthenticated: boolean,
}
export type TaskTableType = TaskTableDefaultType;

const isSafeInput = (str: string) => {
    // for reference: To prevent SQL injection attack
    // Only allow alphanumeric characters, basic punctuation, and whitespace
    const regex = /^[a-zA-Z0-9\s.,!?'"()\-_:;]{1,500}$/;
    return regex.test(str);
};

export const TaskTable = ({ tasks, setTasks, createRow, updateRowFromId, buttonDisabled, setButtonDisabled, userAuthenticated } : TaskTableType) => {
    const appRouter = useRouter();
    const inputTitleRef = useRef<HTMLInputElement>(null);
    const inputDetailRef = useRef<HTMLInputElement>(null);
    
    const chkBoxHandler = useCallback(async (_: React.MouseEvent, id: number, title: string, detail: string, isCurrentlySelected: boolean) => {
        setButtonDisabled(true);
        const result: { tasks: Task[] } = await updateRowFromId(tasks, id, title, detail, !isCurrentlySelected);
        setTasks(result.tasks);
        setButtonDisabled(false);
    }, [setButtonDisabled, setTasks, updateRowFromId]);

    const editTodoHandler = useCallback((e: React.MouseEvent, id: number) => {
        e.preventDefault();
        appRouter.push(`${MONOREPO_PREFIX}/${TASKS_CRUD}/use-server/edit/${id}`);
    }, []);

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

    const tBody = (): React.ReactElement[] => {
        console.log("tbody ", buttonDisabled, userAuthenticated);
        if (Array.isArray(tasks) && tasks.length > 0) {
            const output:React.ReactElement[] = [];
            
            tasks.forEach(aTask => {
                // for reference: make checkbox an uncontrolled react component
                const checkboxTriggeredByButtonDisabled = buttonDisabled ? (
                    <input type="checkbox" id={`chkbox-${aTask.id}`} defaultChecked={aTask.completed} disabled />
                ) : (
                    <input type="checkbox" id={`chkbox-${aTask.id}`} defaultChecked={aTask.completed} 
                        onClick={(e) => chkBoxHandler(e, aTask.id, aTask.title, aTask.detail, aTask.completed)} />
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

    const renderAddRowForm = useCallback((isDisabled: boolean): React.ReactElement[] => {
        console.log('renderAddRowForm ', isDisabled, userAuthenticated);

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

    const tFooter = (): React.ReactElement[] => {
        console.log("tfooter ", buttonDisabled, userAuthenticated);
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
