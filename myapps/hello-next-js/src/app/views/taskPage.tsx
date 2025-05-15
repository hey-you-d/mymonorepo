'use client';
// The View connects the ViewModel and UI component
import { useState, useRef } from "react";
//import { useTaskViewModel } from '../viewModels/useTasksViewModel'; // no Frontend caching 
import { useTaskViewModelWithSwr } from '../viewModels/useTasksViewModelWithSwr';
import { TaskSeedDB } from '../components/TaskSeedDB';
import { TaskTable } from '../components/TaskTable';
import { Task } from "../types/Task";
import Link from "next/link";

export const TaskPage = () => {
  //const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModel();
  const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);

  const filterInputField = useRef<HTMLInputElement>(null);

  if (loading) return <p>Loading...</p>;
  
  const searchHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (tasks && filterInputField)  {
        const value = filterInputField.current !== null ? filterInputField.current.value : ""; 
        setFilteredTasks(
          tasks.filter(row => row.detail.toLowerCase().includes(value.toLowerCase()))
        );
    }
  };

  const clearSearchHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (tasks && filterInputField && filterInputField.current !== null )  {
        filterInputField.current.value = "";
        setFilteredTasks(tasks);
    }
  } 

  const confirmedTasks: Task[] | undefined = tasks && tasks.length > 0 ? filteredTasks : tasks; 

  return tasks && confirmedTasks ? (
    <>
      <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
      <br/>
      <br/>
      <span>filter task description: </span><input ref={filterInputField} placeholder="Filter detail..." />
      <button type="button" onClick={searchHandler}>Filter</button>
      <button type="button" onClick={clearSearchHandler}>Clear</button> 
      <br/>
      <Link href="/bff-tasks-db/with-search-filter">Dynamic Filter example</Link>
      <br/>
      <TaskTable tasks={confirmedTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
    </>
  ) : (<></>);
};
