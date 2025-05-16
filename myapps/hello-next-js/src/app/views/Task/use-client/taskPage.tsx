'use client';
// The View connects the ViewModel and UI component
import { useState, useEffect } from "react";
import { useTaskViewModel } from '@/app/viewModels/Task/use-client/useTasksViewModel';
import { TaskSeedDB } from '@/app/components/TaskSeedDB';
import { TaskTable } from '@/app/components/TaskTable';
import { Task } from "@/app/types/Task";
import { TASKS_CRUD } from "../../../../../global/common";
import Link from "next/link";

export const TaskPage = () => {
  const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModel();

  const [filterText, setFilterText] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);

  const isFiltering = filterText.trim() !== "";

  useEffect(() => {
    if (tasks) {
      setFilteredTasks(
        isFiltering
          ? tasks.filter(task =>
              task.detail.toLowerCase().includes(filterText.toLowerCase())
            )
          : tasks
      );
    }
  }, [tasks, setFilterText, isFiltering, filterText]);

  const confirmedTasks = isFiltering ? filteredTasks : tasks;

  const searchHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFilterText(filterText);
    setFilteredTasks(
      tasks.filter(task => task.detail.toLowerCase().includes(filterText.toLowerCase()))
    );
  };

  const clearSearchHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFilterText("");
    setFilteredTasks(tasks);
  } 

  if (loading) return <p>Loading...</p>;

  return tasks ? (
    <>
      <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
      <br/>
      <br/>
      <span>filter task description: </span><input onChange={(e) => setFilterText(e.target.value)} placeholder="Filter detail..." />
      <button type="button" onClick={searchHandler}>Filter</button>
      <button type="button" onClick={clearSearchHandler}>Clear</button> 
      <br/>
      <Link href={`${TASKS_CRUD}/with-search-filter`}>Dynamic Filter example</Link>
      <br/>
      <TaskTable tasks={confirmedTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
    </>
  ) : (<></>);
};
