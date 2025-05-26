'use client';
import { useState, useRef, useEffect } from "react";
import { useTaskViewModelWithSwr } from '@/viewModels/Task/use-client/useTasksViewModelWithSwr';
import { TaskSeedDB } from '@/components/Task/use-client/TaskSeedDB';
import { TaskTable } from '@/components/Task/use-client/TaskTable';
import { Task } from "@/types/Task";

export const TaskWithSWRPage = () => {
  const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  const filterInputRef = useRef<HTMLInputElement>(null); 

  const isFiltering = filterInputRef.current?.value?.trim() !== "";

  useEffect(() => {
    if (!isFiltering && tasks) {
      setFilteredTasks(tasks);
    }
  }, [tasks, setFilteredTasks, isFiltering]);

  useEffect(() => {
    setButtonDisabled(filteredTasks.length != tasks?.length);
  }, [setButtonDisabled, filteredTasks, tasks]);

  const confirmedTasks = isFiltering
    ? filteredTasks
    : tasks ?? [];
    
  const searchHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const value = filterInputRef.current?.value ?? "";
    if (tasks) {
      setButtonDisabled(true);
      setFilteredTasks(
        tasks.filter(task => task.detail.toLowerCase().includes(value.toLowerCase()))
      );
      setButtonDisabled(false);
    }
  };

  const clearSearchHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (filterInputRef.current) {
      filterInputRef.current.value = "";
    }
    if (tasks) {
      setButtonDisabled(true);
      setFilteredTasks(tasks);
      setButtonDisabled(false);
    }
  } 

  if (loading) return <p>Loading...</p>;

  return tasks ? (
    <>
      <h2>Frontend cached with Vercel SWR: MVVM client-side components rendered with Next.js App Router</h2>
      <TaskSeedDB 
        totalRows={tasks.length} 
        seedTaskDB={seedTasksDB} 
        deleteAllRows={deleteAllRows} 
        buttonDisabled={buttonDisabled}
        setButtonDisabled={setButtonDisabled}
      />
      <br/>
      <br/>
      <span>filter task description: </span><input ref={filterInputRef} placeholder="Filter detail..." />
      <button type="button" onClick={searchHandler}>Filter</button>
      <button type="button" onClick={clearSearchHandler}>Clear</button> 
      <br/>
      <TaskTable 
        tasks={confirmedTasks} 
        createRow={createRow} 
        updateRowFromId={updateRowFromId} 
        buttonDisabled={buttonDisabled}
        setButtonDisabled={setButtonDisabled}  
      />
    </>
  ) : (<></>);
};
