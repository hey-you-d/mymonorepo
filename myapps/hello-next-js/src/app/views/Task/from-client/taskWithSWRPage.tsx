'use client';
// The View connects the ViewModel and UI component
import { useState, useRef, useEffect } from "react";
import { useTaskViewModelWithSwr } from '../../../viewModels/Task/use-client/useTasksViewModelWithSwr';
import { TaskSeedDB } from '../../../components/TaskSeedDB';
import { TaskTable } from '../../../components/TaskTable';
import { Task } from "../../../types/Task";
import Link from "next/link";

export const TaskWithSWRPage = () => {
  const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);

  const filterInputField = useRef<HTMLInputElement>(null);

  let confirmedTasks: Task[] | undefined = tasks;
  useEffect(() => {
    const satisfiedConditions = tasks && tasks.length > 0 && filteredTasks.length < tasks.length;
    confirmedTasks = satisfiedConditions ? filteredTasks : tasks; 

    console.log("CT ", confirmedTasks);
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
      <Link href="/bff-tasks-db/with-search-filter">Dynamic Filter example</Link>
      <br/>
      <TaskTable tasks={filterInputFieldExistAndNotEmpty ? filteredTasks: confirmedTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
    </>
  ) : (<></>);
};
