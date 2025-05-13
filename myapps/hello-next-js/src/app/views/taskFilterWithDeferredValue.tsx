'use client';
// The View connects the ViewModel and UI component
import { useState, useMemo, useDeferredValue } from 'react';
import { TaskTableType } from '../types/Task';
import { TaskTable } from '../components/TaskTable';

export const TaskFilterWithDeferredValue = ({ tasks, createRow, updateRowFromId } : TaskTableType) => {
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    
    const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      setSearch(value);
    };

    const filteredByDeferredValue = useMemo(() => {
      return tasks 
          ? tasks.filter(row => row.detail.toLowerCase().includes(deferredSearch.toLowerCase()))
          : [];
    }, [tasks, deferredSearch]);

    return tasks ? (
        <>
          <h2>optimise the search/filter with useDeferredValue</h2>
          <br/>
          <span>filter task description: </span><input value={search} onChange={searchHandler} placeholder="Filter detail..." />
          <br/>
          <TaskTable tasks={filteredByDeferredValue} createRow={createRow} updateRowFromId={updateRowFromId} />
        </>
    ) : (<></>);
};
