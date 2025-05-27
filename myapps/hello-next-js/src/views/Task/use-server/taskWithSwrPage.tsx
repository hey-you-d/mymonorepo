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
import { strictDeepEqual } from 'fast-equals';

export const TaskWithSwrPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filterText, setFilterText] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

    // Use SWR to automatically fetch tasks (no need to set up the tasks state, and loading state)
    const { data: swrData, error: swrError, isLoading: swrLoading } = useSWR<Task[]>("Tasks-API-USE-SWR", fetcher);

    useEffect(() => {
        const fetchCachedTasks = async () => {
            setLoading(true);
            setButtonDisabled(true);
            try {
                if (swrData) {
                    setTasks(swrData);
                    setButtonDisabled(false);
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

    useEffect(() => {
        setButtonDisabled(filterText.trim().length > 0);
    }, [setButtonDisabled, filterText])

    const isFiltering = filterText.trim() !== "";
    const confirmedTasks = swrData && isFiltering
        ? swrData.filter(task =>
            task.detail.toLowerCase().includes(filterText.toLowerCase())
        )
        : swrData ;

    if (loading || swrLoading) return <p>Loading...</p>;
    if (swrError) return <p>from SWR - error...</p>
    
    return swrData  && confirmedTasks ? (
        <>
            <h2>Frontend cached with Vercel SWR: Model + ViewModel server-side components, & View client-side components rendered with Next.js App Router</h2>
            <TaskSeedDBWithSwr
                tasks={swrData }
                seedTaskDB={seedTasksDB}
                deleteAllRows={deleteAllRows}
                buttonDisabled={buttonDisabled}
                setButtonDisabled={setButtonDisabled}
            />
            <br />
            <span>Filter task description: </span>
            <input
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter detail..."
            />
            <br />
            <TaskTableWithSwr
                tasks={confirmedTasks}
                createRow={createRow}
                updateRowFromId={updateRowFromId}
                buttonDisabled={buttonDisabled}
                setButtonDisabled={setButtonDisabled}
            />
        </>
    ) : (<></>);
};
