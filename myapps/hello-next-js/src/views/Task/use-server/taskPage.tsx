'use client';
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency
import { useState, useEffect } from "react";
import {
  createRow,
  updateRowFromId,
  deleteAllRows,
  getTasksDBRows,
  seedTasksDB
} from '@/viewModels/Task/use-server/getTasksViewModel';
import { TaskSeedDB } from '@/components/Task/use-server/TaskSeedDB';
import { TaskTable } from '@/components/Task/use-server/TaskTable';
import { TaskUser } from "./taskUser";
import { Task } from "@/types/Task";

export const TaskPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterText, setFilterText] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setButtonDisabled(true);
      try {
        const { tasks } = await getTasksDBRows();
        setTasks(tasks);
        setButtonDisabled(false);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []); // run once only

  useEffect(() => {
    setButtonDisabled(filterText.trim().length > 0);
  }, [setButtonDisabled, filterText]);

  const isFiltering = filterText.trim() !== "";
  const confirmedTasks = isFiltering
    ? tasks.filter(task =>
        task.detail.toLowerCase().includes(filterText.toLowerCase())
      )
    : tasks;

  if (loading) return <p>Loading...</p>;

  const renderFilterField = ( 
      <input
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Filter detail..."
      />    
  );

  return (
    <>
      <h2>Default example: Model + ViewModel server-side components, & View client-side components rendered with Next.js App Router</h2>
      <TaskUser userAuthenticated={userAuthenticated} setUserAuthenticated={setUserAuthenticated} />
      <TaskSeedDB
        tasks={tasks}
        setTasks={setTasks}
        seedTaskDB={seedTasksDB}
        deleteAllRows={deleteAllRows}
        buttonDisabled={buttonDisabled}
        setButtonDisabled={setButtonDisabled}
        userAuthenticated={userAuthenticated}
      />
      
      <br />
      <span>Filter task description: </span>
      {renderFilterField}
      <br />
      <TaskTable
        tasks={confirmedTasks}
        setTasks={setTasks}
        createRow={createRow}
        updateRowFromId={updateRowFromId}
        buttonDisabled={buttonDisabled}
        setButtonDisabled={setButtonDisabled}
        userAuthenticated={userAuthenticated}
      />
    </>
  );
};
