'use client';
// The View connects the ViewModel and UI component
import React, { useCallback, useRef } from 'react';
import { Task } from "../types/Task";
import { MONOREPO_PREFIX } from "../../../constants/common";

//import { useTaskViewModel } from '../viewModels/useTasksViewModel'; 
import { useTaskViewModelWithSwr } from '../viewModels/useTasksViewModelWithSwr'; 
//import { useTaskGraphQLViewModel } from '../viewModels/useTaskGraphQLViewModel'; 
//import { useTaskApolloClientViewModel } from '../viewModels/useTaskApolloClientViewModel'; 

import { TaskSeedDB } from '../components/TaskSeedDB';
 
export const TaskWithSearchFilterPage = () => {
    // dev note: no Frontend caching 
    //const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModel();
    // dev note: FE caching with Vercel SWR
    const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();
    // dev note: Data query with GraphQL (Apollo Server)
    //const { tasks, loading, error, seedTaskDB, deleteAllRows, createRow, updateRowFromId } = useTaskGraphQLViewModel();
    // dev note: FE caching (in-memory) with Apollo Client
    //const { tasks, loading, error, seedTaskDB, deleteAllRows, createRow, updateRowFromId } = useTaskApolloClientViewModel();
        
    if (loading) return <p>Loading...</p>;
    
    return tasks && (
        <>
          <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
          <TaskTable tasks={tasks} createRow={createRow} updateRowFromId={updateRowFromId} />
        </>
    );
};

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

const TaskTable = ({ tasks, createRow, updateRowFromId } : TaskTableType) => {
    const inputTitleRef = useRef<HTMLInputElement>(null);
    const inputDetailRef = useRef<HTMLInputElement>(null);
    
    const chkBoxHandler = (_: React.MouseEvent, id: number, title: string, detail: string, isCurrentlySelected: boolean) => {
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
