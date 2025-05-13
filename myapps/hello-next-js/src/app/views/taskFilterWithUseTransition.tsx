'use client';
// The View connects the ViewModel and UI component
import { useState, useTransition } from 'react';
import { TaskTable } from '../components/TaskTable';
import { Task, TaskTableType } from '../types/Task';

export const TaskFilterWithUseTransition = ({ tasks, createRow, updateRowFromId } : TaskTableType) => {
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState("");
    const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  
    if (isPending) return <p>Is Pending...</p>;
    
    const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      
      startTransition(() => {
        if (tasks) {
            setFilteredTasks(
              tasks.filter(row => row.detail.toLowerCase().includes(value.toLowerCase()))
            );
        }
      });
    };

    console.log("filteredTasks ", filteredTasks);

    return tasks ? (
        <>
          <h2>optimise the search/filter feature with useTransition</h2>
          <input value={search} onChange={searchHandler} placeholder="Filter detail..." />
          <br/>
          <TaskTable tasks={filteredTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
        </>
    ) : (<></>);
};
