'use client';
// The View connects the ViewModel and UI component
import { useState, useRef, useEffect } from "react";
import { useTaskViewModel } from '@/app/viewModels/Task/use-client/useTasksViewModel';
import { TaskSeedDB } from '@/app/components/TaskSeedDB';
import { TaskTable } from '@/app/components/TaskTable';
import { Task } from "@/app/types/Task";
import { TASKS_CRUD } from "../../../../../global/common";
import Link from "next/link";

export const TaskPage = () => {
  const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModel();

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);

  const filterInputField = useRef<HTMLInputElement>(null);

  let confirmedTasks: Task[] | undefined = tasks;
  useEffect(() => {
    const satisfiedConditions = tasks && tasks.length > 0 && filteredTasks.length < tasks.length;
    confirmedTasks = satisfiedConditions ? filteredTasks : tasks; 
  }, [tasks, filteredTasks]);
  
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

  const filterInputFieldExistAndNotEmpty = filterInputField && filterInputField.current && filterInputField.current.value != "";
  return tasks && confirmedTasks ? (
    <>
      <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
      <br/>
      <br/>
      <span>filter task description: </span><input ref={filterInputField} placeholder="Filter detail..." />
      <button type="button" onClick={searchHandler}>Filter</button>
      <button type="button" onClick={clearSearchHandler}>Clear</button> 
      <br/>
      <Link href={`${TASKS_CRUD}/with-search-filter`}>Dynamic Filter example</Link>
      <br/>
      <TaskTable tasks={filterInputFieldExistAndNotEmpty ? filteredTasks: confirmedTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
    </>
  ) : (<></>);
};
