'use client';
// The View connects the ViewModel and UI component
import { useState, useTransition } from 'react';

import { TaskTable } from '../components/TaskTable';
import { Task } from '../types/Task';

type TaskTableType = {
    tasks: Task[], 
    createRow: (title: string, detail: string)=> Promise<void>,
    updateRowFromId: (id: number, title: string, detail: string, completed: boolean) => Promise<void>
}

export const TaskFilterWithUseTransition = ({ tasks, createRow, updateRowFromId } : TaskTableType) => {
    const [isPending, startTransition] = useTransition();

    const [search] = useState("");
    const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);
  
    if (isPending) return <p>Is Pending...</p>;
    
    const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Defer state update using useTransition
      startTransition(() => {
        if (tasks) {
            setFilteredTasks(
            tasks.filter(row => row.detail.toLowerCase().includes(value.toLowerCase()))
            );
        }
      });
    };

    return tasks ? (
        <>
          <h2>with useTransition</h2>
          <br/>
          <input value={search} onChange={searchHandler} placeholder="Filter detail..." />
          <br/>
          <TaskTable tasks={filteredTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
        </>
    ) : (<></>);
};
