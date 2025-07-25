'use client';
import { useEffect, useState, useMemo, useDeferredValue } from 'react';
import type { TaskTableType } from '@/types/Task';
import TaskTable from '@/components/Task/use-client/TaskTable';

// dev note - use-case scenario of useDeferredValue:
// Imagine you're running a live product search on an e-commerce site
// Every time a customer types into the search bar (search state updates), you want to filter and display matching products.
// But searching with every keystroke (especially with large data) might lag the UI.
// So instead of updating the UI instantly with each keystroke, you use useDeferredValue to 
// let the UI wait just a moment, and only react after the user has paused typing.

// dev note 2 - useDeferredValue -vs- Debounce:
// What it delays: The usage of a changing value -vs- The update of the value itself
// When filtering runs:	Immediately on render, but with deferred value -vs-	After a delay (e.g. 300ms), only once
// Cancelability:	No explicit control	-vs- Fully controllable (timeout can be cleared)
// Use case:	Optimizing rendering in concurrent React	-vs- Delaying function calls like API requests
// Timing:	Not configurable — React decides -vs-	Configurable (setTimeout, e.g. 300ms debounce)
export const TaskFilterWithDeferredValue = ({ tasks, createRow, updateRowFromId, buttonDisabled, setButtonDisabled, userAuthenticated } : TaskTableType) => {
    const [search, setSearch] = useState("");
    
    const deferredSearch = useDeferredValue(search);
    
    useEffect(() => {
        setButtonDisabled(search.trim().length > 0);
    }, [setButtonDisabled, search]);

    const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      setSearch(value);
    };

    // for reference: useDeferredValue will keep the filtering logic non-blocking as it defers the search state while 
    // the tasks remain the same. The filtering will remain smooth, but you'll avoid making state updates a non-blocking
    // operation 
    const filteredByDeferredValue = useMemo(() => {
      return tasks 
          ? tasks.filter(row => row.detail.toLowerCase().includes(deferredSearch.toLowerCase()))
          : [];
    }, [tasks, deferredSearch]);

    return tasks ? (
        <>
          <br/>
          <span>filter task description: </span><input value={search} onChange={searchHandler} placeholder="Filter detail..." />
          <br/>
          <TaskTable 
            tasks={filteredByDeferredValue} 
            createRow={createRow} 
            updateRowFromId={updateRowFromId} 
            buttonDisabled={buttonDisabled}
            setButtonDisabled={setButtonDisabled} 
            userAuthenticated={userAuthenticated}
          />
        </>
    ) : (<></>);
};
