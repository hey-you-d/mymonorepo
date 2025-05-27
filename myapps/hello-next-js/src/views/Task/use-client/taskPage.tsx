'use client';
import { useState, useEffect } from "react";
import { useTaskViewModel } from '@/viewModels/Task/use-client/useTasksViewModel';
import { TaskSeedDB } from '@/components/Task/use-client/TaskSeedDB';
import { TaskTable } from '@/components/Task/use-client/TaskTable';
import { Task } from "@/types/Task";

export const TaskPage = () => {
  const { tasks, loading, seedTasksDB, createRow, updateRowFromId, deleteAllRows } = useTaskViewModel();

  const [filterText, setFilterText] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks ?? []);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

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
  
  // for reference: ideally, render a skeleton image, but for now comment out 
  // the line below in order to visually demonstrate react component rehydration
  // after clicking the add-row button 
  //if (loading) return <p>Loading...</p>;

  return tasks ? (
    <>
      <h2>Default example: MVVM client-side components rendered with Next.js Page Router</h2>
      <span>filter task description: </span>
      <input type="text" placeholder="Filter detail..."  
        onChange={(e) => setFilterText(e.target.value)}
      />
      <TaskSeedDB 
        totalRows={tasks.length} 
        seedTaskDB={seedTasksDB} 
        deleteAllRows={deleteAllRows} 
        buttonDisabled={buttonDisabled}
        setButtonDisabled={setButtonDisabled}
      />
      <TaskTable 
        tasks={confirmedTasks} 
        createRow={createRow} 
        updateRowFromId={updateRowFromId} 
        buttonDisabled={buttonDisabled}
        setButtonDisabled={setButtonDisabled}
      />
    </>
  ) : (<></>);
};
