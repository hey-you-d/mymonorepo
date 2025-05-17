'use client';
import { useState, useEffect } from "react";
import { useTaskViewModel } from '@/viewModels/Task/use-client/useTasksViewModel';
import { TaskSeedDB } from '@/components/TaskSeedDB';
import { TaskTable } from '@/components/TaskTable';
import { Task } from "@/types/Task";
import { TASKS_CRUD } from "@/lib/app/common";
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

  if (loading) return <p>Loading...</p>;

  return tasks ? (
    <>
      <TaskSeedDB totalRows={tasks.length} seedTaskDB={seedTasksDB} deleteAllRows={deleteAllRows} />
      <br/>
      <br/>
      <span>filter task description: </span><input onChange={(e) => setFilterText(e.target.value)} placeholder="Filter detail..." />
      <br/>
      <Link href={`${TASKS_CRUD}/with-search-filter`}>Dynamic Filter example</Link>
      <br/>
      <TaskTable tasks={confirmedTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
    </>
  ) : (<></>);
};
