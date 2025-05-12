'use client';
// The View connects the ViewModel and UI component
import { useState, useMemo, useDeferredValue } from 'react';
import { Task } from '../types/Task';
import { TaskTable } from '../components/TaskTable';

type TaskTableType = {
    tasks: Task[], 
    createRow: (title: string, detail: string)=> Promise<void>,
    updateRowFromId: (id: number, title: string, detail: string, completed: boolean) => Promise<void>
}

export const TaskFilterWithDeferredValue = ({ tasks, createRow, updateRowFromId } : TaskTableType) => {
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    
    const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      setSearch(value);
    };

    // OR use deferredSearch in a memoized computation
    const filteredByDeferredValue = useMemo(() => {
      return tasks 
          ? tasks.filter(row => row.detail.toLowerCase().includes(deferredSearch.toLowerCase()))
          : [];
    }, [tasks, deferredSearch]);

    return tasks && (
        <>
          <h2>with useDeferredValue</h2>
          <br/>
          <input value={search} onChange={searchHandler} placeholder="Filter detail..." />
          <br/>
          <TaskTable tasks={filteredByDeferredValue} createRow={createRow} updateRowFromId={updateRowFromId} />
        </>
    );
};
