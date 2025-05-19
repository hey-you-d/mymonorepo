'use client';
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency
import { useState, useEffect } from "react";
import {
  fetcher,  
  createRow,
  updateRowFromId,
  deleteAllRows,
  //getTasksDBRows,
  seedTasksDB
} from '@/viewModels/Task/use-server/getTasksViewModelWithSwr';
import { TaskSeedDBWithSwr } from '@/components/Task/use-server/TaskSeedDBWithSwr';
import { TaskTableWithSwr } from '@/components/Task/use-server/TaskTableWithSwr';
import { Task } from "@/types/Task";
import useSWR from 'swr';
import { TASKS_CRUD } from "@/lib/app/common";
import Link from "next/link";

export const TaskWithSwrPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filterText, setFilterText] = useState("");

    // Use SWR to automatically fetch tasks (no need to set up the tasks state, and loading state)
    const { data, error, isLoading } = useSWR<Task[]>("Tasks-API-USE-SWR", fetcher);

    if (isLoading) <p>from SWR - loading...</p>
    if (error) <p>from SWR - error...</p>

    // Fetch tasks on mount
    useEffect(() => {
        /*
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const { tasks } = await getTasksDBRows();
                setTasks(tasks);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
        */
        const fetchCachedTasks = async () => {
            setLoading(true);
            try {
                if (data) {
                    setTasks(data);
                }
            } catch (err) {
                console.error("Error fetching tasks:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCachedTasks();
    }, []);

    const isFiltering = filterText.trim() !== "";
    const confirmedTasks = isFiltering
        ? tasks.filter(task =>
            task.detail.toLowerCase().includes(filterText.toLowerCase())
        )
        : tasks;

    if (loading) return <p>Loading...</p>;
    
    return (
        <>
        <TaskSeedDBWithSwr
            tasks={tasks}
            setTasks={setTasks}
            seedTaskDB={seedTasksDB}
            deleteAllRows={deleteAllRows}
        />
        <br />
        <span>Filter task description: </span>
        <input
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter detail..."
        />
        <br />
        <Link href={`${TASKS_CRUD}/use-server/`}>
            Back to the default use-server Task Page
        </Link>
        <br />
        <TaskTableWithSwr
            tasks={confirmedTasks}
            setTasks={setTasks}
            createRow={createRow}
            updateRowFromId={updateRowFromId}
        />
        </>
    );
};
