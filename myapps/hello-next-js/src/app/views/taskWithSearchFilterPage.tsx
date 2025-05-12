'use client';
// The View connects the ViewModel and UI component
import { useState, useMemo, useTransition, useDeferredValue } from 'react';

//import { useTaskViewModel } from '../viewModels/useTasksViewModel'; 
import { useTaskViewModelWithSwr } from '../viewModels/useTasksViewModelWithSwr'; 
//import { useTaskGraphQLViewModel } from '../viewModels/useTaskGraphQLViewModel'; 
//import { useTaskApolloClientViewModel } from '../viewModels/useTaskApolloClientViewModel'; 

import { TaskSeedDB } from '../components/TaskSeedDB';
import { TaskTable } from '../components/TaskTable';
import { Task } from '../types/Task';

export const TaskWithSearchFilterPage = () => {
    // dev note: no Frontend caching 
    //const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModel();
    // dev note: FE caching with Vercel SWR
    const { tasks, loading, error, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();
    // dev note: Data query with GraphQL (Apollo Server)
    //const { tasks, loading, error, seedTaskDB, deleteAllRows, createRow, updateRowFromId } = useTaskGraphQLViewModel();
    // dev note: FE caching (in-memory) with Apollo Client
    //const { tasks, loading, error, seedTaskDB, deleteAllRows, createRow, updateRowFromId } = useTaskApolloClientViewModel();
        
    const [search, setSearch] = useState("");
    const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);
    
    const [isPending, startTransition] = useTransition();

    const deferredSearch = useDeferredValue(search); // for memo filtering

    isPending && <p>Is Pending...</p>;
    loading && <p>Loading...</p>;
    
    const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      setSearch(value); // update input immediately
      
      // Defer state update using useTransition
      startTransition(() => {
        tasks && setFilteredTasks(
          tasks.filter(row => row.detail.toLowerCase().includes(value.toLowerCase()))
        );
      });
    };

    // OR use deferredSearch in a memoized computation
    const filteredByDeferredValue = useMemo(() => {
      return tasks 
        ? tasks.filter(row =>
            row.detail.toLowerCase().includes(deferredSearch.toLowerCase())
          )
        : [];
    }, [tasks, deferredSearch]);
    
    if (error) {
      return <p>{error.message}</p>;
    }
    
    return tasks && (
        <>
          <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
          <br/>
          <input value={search} onChange={searchHandler} placeholder="Filter detail..." />
          <br/>
          <h2>with useTransition</h2>
          <TaskTable tasks={filteredTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
          <h2>with useDeferredValue</h2>
          <TaskTable tasks={filteredByDeferredValue} createRow={createRow} updateRowFromId={updateRowFromId} />
        </>
    );
};
