'use client';
import { useState, useEffect } from "react";
import { useTaskViewModel } from '@/viewModels/Task/use-client/useTasksViewModel';
import TaskUser from "./taskUser";
import TaskSeedDB from '@/components/Task/use-client/TaskSeedDB';
import TaskTable from '@/components/Task/use-client/TaskTable';
import { Task } from "@/types/Task";

export const TaskPage = () => {
  const { tasks, loading, error, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModel();

  const [filterText, setFilterText] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

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

  useEffect(() => {
    setButtonDisabled(filterText.trim().length > 0);
  }, [setButtonDisabled, filterText]);
  
  const confirmedTasks = isFiltering ? filteredTasks : (tasks ? tasks : []);
  
  const loadingMsg = loading ? <p>Loading...</p> : <></>;
  const errorMsg = !error 
    ? <></>
    : (
      <div>
        <p>{error.name}</p>
        <p>{error.message}</p>
      </div>
    );
  const authContent = !tasks
    ? <></>
    : <TaskUser userAuthenticated={userAuthenticated} setUserAuthenticated={setUserAuthenticated} />;     
  const seedContent = !tasks
    ? <></>
    : (
      <>
        <TaskSeedDB 
          totalRows={tasks.length} 
          seedTaskDB={seedTasksDB} 
          deleteAllRows={deleteAllRows} 
          buttonDisabled={buttonDisabled}
          setButtonDisabled={setButtonDisabled}
          userAuthenticated={userAuthenticated}      
        />
      </>
    );

  return (
    <>
      <h2>Default (No frills) example: MVVM client-side components rendered via Next.js Page Router</h2>
      {authContent}
      {loadingMsg}
      {errorMsg}
      {seedContent}
      <span>filter task description: </span>
      <input type="text" placeholder="Filter detail..."  
        onChange={(e) => setFilterText(e.target.value)}
      />
      <TaskTable 
          tasks={confirmedTasks} 
          createRow={createRow} 
          updateRowFromId={updateRowFromId} 
          buttonDisabled={buttonDisabled}
          setButtonDisabled={setButtonDisabled}
          userAuthenticated={userAuthenticated}      
      />
    </>
  );
};
