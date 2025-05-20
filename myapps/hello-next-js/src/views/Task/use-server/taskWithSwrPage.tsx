'use client';
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency
import { useState, useEffect } from "react";
import {
  fetcher,  
  createRow,
  updateRowFromId,
  deleteAllRows,
  seedTasksDB
} from '@/viewModels/Task/use-server/getTasksViewModelWithSwr';
import { TaskSeedDBWithSwr } from '@/components/Task/use-server/TaskSeedDBWithSwr';
import { TaskTableWithSwr } from '@/components/Task/use-server/TaskTableWithSwr';
import { Task } from "@/types/Task";
import useSWR from 'swr';
import { TASKS_CRUD } from "@/lib/app/common";
import Link from "next/link";
import { strictDeepEqual } from 'fast-equals';

export const TaskWithSwrPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filterText, setFilterText] = useState("");

    // Use SWR to automatically fetch tasks (no need to set up the tasks state, and loading state)
    const { data: swrData, error: swrError, isLoading: swrLoading } = useSWR<Task[]>("Tasks-API-USE-SWR", fetcher);

    useEffect(() => {
        const fetchCachedTasks = async () => {
            setLoading(true);
            try {
                if (swrData) {
                    setTasks(swrData);
                }
            } catch (err) {
                console.error("Error fetching cached tasks:", err);
            } finally {
                setLoading(false);
            }
        };

        // for reference: ensure the fn is not called whenever this component is re-hydrated
        if (!swrLoading && !strictDeepEqual(tasks, swrData)) {
            fetchCachedTasks();
        }
    }, [tasks, swrData, swrLoading, setTasks, setLoading]);

    const isFiltering = filterText.trim() !== "";
    const confirmedTasks = swrData && isFiltering
        ? swrData.filter(task =>
            task.detail.toLowerCase().includes(filterText.toLowerCase())
        )
        : swrData ;

    if (loading) return <p>Loading...</p>;
    if (swrLoading) return <p>from SWR - loading...</p>
    if (swrError) return <p>from SWR - error...</p>
    
    return swrData  && confirmedTasks ? (
        <>
        <TaskSeedDBWithSwr
            tasks={swrData }
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
            createRow={createRow}
            updateRowFromId={updateRowFromId}
        />
        </>
    ) : (<></>);
};
