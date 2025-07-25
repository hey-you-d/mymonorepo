'use client';
import { useState, useRef, useEffect } from "react";
import { useTaskViewModelWithSwr } from '@/viewModels/Task/use-client/useTasksViewModelWithSwr';
import TaskUser from "./taskUser";
import TaskSeedDB from '@/components/Task/use-client/TaskSeedDB';
import TaskTable from '@/components/Task/use-client/TaskTable';
import { Task } from "@/types/Task";
import styles from "@/app/page.module.css";

export const TaskWithSWRPage = () => {
  const { tasks, loading, error, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModelWithSwr();

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

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
      <h2>Frontend cached with Vercel SWR: MVVM client-side components rendered via Next.js Page Router</h2>
      {authContent}
      {!error && loadingMsg}
      {errorMsg}
      {seedContent}
      <p>filter task description: </p>
      <div className={styles.tasksFilterRow}>
        <div className={styles.tasksFilterCol1}><input ref={filterInputRef} placeholder="Filter detail..." /></div>
        <div className={styles.tasksFilterCol2}><button type="button" onClick={searchHandler}>Filter</button></div>
        <div className={styles.tasksFilterCol3}><button type="button" onClick={clearSearchHandler}>Clear</button></div>
      </div>
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
