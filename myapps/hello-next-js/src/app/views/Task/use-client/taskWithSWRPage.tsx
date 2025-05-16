'use client';
import { useState, useRef, useEffect } from "react";
import { useTaskViewModelWithSwr } from '../../../viewModels/Task/use-client/useTasksViewModelWithSwr';
import { TaskSeedDB } from '@/app/components/TaskSeedDB';
import { TaskTable } from '@/app/components/TaskTable';
import { Task } from "@/app/types/Task";
import { TASKS_CRUD } from "../../../../../global/common";
import Link from "next/link";

export const TaskWithSWRPage = () => {
  const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);

  const filterInputRef = useRef<HTMLInputElement>(null); 

  const isFiltering = filterInputRef.current?.value?.trim() !== "";

  useEffect(() => {
    if (!isFiltering && tasks) {
      setFilteredTasks(tasks);
    }
  }, [tasks, setFilteredTasks, isFiltering]);

  const confirmedTasks = isFiltering
    ? filteredTasks
    : tasks ?? [];
    
  const searchHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const value = filterInputRef.current?.value ?? "";
    if (tasks) {
      setFilteredTasks(
        tasks.filter(task => task.detail.toLowerCase().includes(value.toLowerCase()))
      );
    }
  };

  const clearSearchHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (filterInputRef.current) {
      filterInputRef.current.value = "";
    }
    if (tasks) {
      setFilteredTasks(tasks);
    }
  } 

  if (loading) return <p>Loading...</p>;

  return tasks ? (
    <>
      <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
      <br/>
      <br/>
      <span>filter task description: </span><input ref={filterInputRef} placeholder="Filter detail..." />
      <button type="button" onClick={searchHandler}>Filter</button>
      <button type="button" onClick={clearSearchHandler}>Clear</button> 
      <br/>
      <Link href={`${TASKS_CRUD}/with-search-filter`}>Dynamic Filter example</Link>
      <br/>
      <TaskTable tasks={confirmedTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
    </>
  ) : (<></>);
};
