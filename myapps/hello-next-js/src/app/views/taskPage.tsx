'use client';
// The View connects the ViewModel and UI component
import { useState } from "react";
//import { useTaskViewModel } from '../viewModels/useTasksViewModel'; // no Frontend caching 
import { useTaskViewModelWithSwr } from '../viewModels/useTasksViewModelWithSwr';
import { TaskSeedDB } from '../components/TaskSeedDB';
import { TaskTable } from '../components/TaskTable';
import { Task } from "../types/Task";

export const TaskPage = () => {
  //const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModel();
  const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();

  const [search, setSearch] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);

  if (loading) return <p>Loading...</p>;

  const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    if (tasks) {
        setFilteredTasks(
          tasks.filter(row => row.detail.toLowerCase().includes(value.toLowerCase()))
        );
    }
  };

  return tasks ? (
    <>
      <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
      <br/>
      <br/>
      <span>filter task description: </span><input value={search} onChange={searchHandler} placeholder="Filter detail..." />
      <br/>
      <TaskTable tasks={filteredTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
    </>
  ) : (<></>);
};
