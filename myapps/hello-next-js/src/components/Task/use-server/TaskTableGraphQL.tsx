'use client'
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency

// for reference #2: The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { useCallback, useRef, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from "@/types/Task";
import { MONOREPO_PREFIX, TASKS_CRUD } from "@/lib/app/common";

type TaskTableDefaultType = {
    tasks: Task[],
    setTasks: Dispatch<SetStateAction<Task[]>>, 
    createRow: (tasks: Task[], title: string, detail: string) => Promise<Task | undefined>, // !!! different return value from TaskSeedDBType
    updateRowFromId: (tasks: Task[], id: number, title: string, detail: string, completed: boolean) => Promise<Task | undefined>, // !!! different return value from TaskSeedDBType
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

export const TaskTableGraphQL = ({ tasks, setTasks, createRow, updateRowFromId, buttonDisabled, setButtonDisabled, userAuthenticated } : TaskTableType) => {
    const appRouter = useRouter();
    const inputTitleRef = useRef<HTMLInputElement>(null);
    const inputDetailRef = useRef<HTMLInputElement>(null);
    
    const chkBoxHandler = async (_: React.MouseEvent, id: number, title: string, detail: string, isCurrentlySelected: boolean) => {
        setButtonDisabled(true);
        const result = await updateRowFromId(tasks, id, title, detail, !isCurrentlySelected);
        
        if (result) {
            // for reference: updateRowFromId returns an array containing the updated row, so we update the state with tasks instead
            // to trigger re-render
            const updatedTasks = tasks.map((item, index) => 
                tasks[index].id === result.id ? result : item
            );
            setTasks(updatedTasks);
        }
        setButtonDisabled(false);
    }

    const editTodoHandler = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        appRouter.push(`${MONOREPO_PREFIX}/${TASKS_CRUD}/use-server/edit/${id}`);
    }

    const addNewTodoHandler = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        if (inputTitleRef.current && inputDetailRef.current && 
            inputTitleRef.current.value.length > 0 && 
            isSafeInput(inputTitleRef.current.value) &&
            isSafeInput(inputDetailRef.current.value)) {
                setButtonDisabled(true);
                
                const result = await createRow(tasks, inputTitleRef.current.value, inputDetailRef.current.value);

                inputTitleRef.current.value = "";
                inputDetailRef.current.value = "";
                
                if (result) {
                    // for reference: createRow returns an array of a newly created row, so we update the state with tasks instead
                    // to trigger re-render
                    setTasks([result,...tasks]);
                }
                
                setButtonDisabled(false);
        } else {
            // TODO: visual indicator - e.g. red border styling
        }
    }, [createRow, setTasks, tasks, setButtonDisabled]);

    const tBody = (): React.ReactElement[] => {
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
    }

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

    const tFooter = (): React.ReactElement[] => {
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
