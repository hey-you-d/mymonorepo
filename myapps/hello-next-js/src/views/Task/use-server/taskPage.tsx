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
import TaskSeedDB from '@/components/Task/use-server/TaskSeedDB';
import TaskTable from '@/components/Task/use-server/TaskTable';
import { TaskUser } from "./taskUser";
import { Task } from "@/types/Task";
import { catchedErrorMessage } from "@/lib/app/error";

const fnSignature = "use-server | view | TaskPage"; 

export const TaskPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterText, setFilterText] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        // in real world scenario, this sort of error msg must not be visible to public.
        // A detailed error msg should only be sent to a remote logging service, whereas client will be presented
        // with a simplified error msg such as: "An error has been encountered (HTML status code: 500)". 
        const errMsg = await catchedErrorMessage(fnSignature, "useEffect - getTasksDBRows", err as Error);
        setError(errMsg);
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
      <>
        <span>Filter task description: </span>
        <input
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter detail..."
        /> 
      </>   
  );

  const authContent = error
    ? <></>
    : <TaskUser userAuthenticated={userAuthenticated} setUserAuthenticated={setUserAuthenticated} />;

  const seedContent = error
    ? <></>
    : <TaskSeedDB
        tasks={tasks}
        setTasks={setTasks}
        seedTaskDB={seedTasksDB}
        deleteAllRows={deleteAllRows}
        buttonDisabled={buttonDisabled}
        setButtonDisabled={setButtonDisabled}
        userAuthenticated={userAuthenticated}
      />;

  return (
    <>
      <h2>Default (No frills) example: Model + ViewModel server-side components, & View client-side components rendered with Next.js App Router</h2>
      {authContent}
      {error}
      {seedContent}
      <br />
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
