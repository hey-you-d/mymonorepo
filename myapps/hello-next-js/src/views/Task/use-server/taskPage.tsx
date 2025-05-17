'use client';
import { useState, useEffect } from "react";
import { 
  createRow, 
  updateRowFromId, 
  deleteAllRows, 
  getTasksDBRows, 
  seedTasksDB 
} from '@/viewModels/Task/use-server/getTasksViewModel';
import { TaskSeedDB } from '@/components/TaskSeedDB';
import { TaskTable } from '@/components/TaskTable';
import { Task } from "@/types/Task";
import { TASKS_CRUD } from "@/lib/app/common";
import Link from "next/link";

export const TaskPage = () => {
  const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const isFiltering = filterText.trim() !== "";

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);

      const { tasks } = await getTasksDBRows();
      setTasks(tasks)
      
      setLoading(false);
    };
        
    fetchTask();

    if (tasks) {
      setFilteredTasks(
        isFiltering
          ? tasks.filter(task =>
              task.detail.toLowerCase().includes(filterText.toLowerCase())
            )
          : tasks
      );
    }
  }, [tasks, setFilterText, setLoading, isFiltering, filterText]);

  const confirmedTasks = isFiltering ? filteredTasks : tasks;

  if (loading) return <p>Loading...</p>;

  return tasks && confirmedTasks ? (
    <>
      <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
      <br/>
      <br/>
      <span>filter task description: </span>
      <input onChange={(e) => setFilterText(e.target.value)} placeholder="Filter detail..." />
      <br/>
      <Link href={`${TASKS_CRUD}/use-server/with-search-filter`}>Dynamic Filter example</Link>
      <br/>
      <TaskTable tasks={confirmedTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
    </>
  ) : (<></>);
};
