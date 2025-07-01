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
import TaskSeedDBWithSwr from '@/components/Task/use-server/TaskSeedDBWithSwr';
import TaskTableWithSwr from '@/components/Task/use-server/TaskTableWithSwr';
import { TaskUser } from "./taskUser";
import { Task } from "@/types/Task";
import useSWR, { SWRConfiguration } from 'swr';
import { strictDeepEqual } from 'fast-equals';

export const TaskWithSwrPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filterText, setFilterText] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
    const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

    // configure useSWR to retry only once after an error (like a 500 DB error) by using its onErrorRetry option
    const swrErrorRetry: SWRConfiguration['onErrorRetry'] = (
        error: Error, 
        key: string, 
        config: SWRConfiguration, 
        revalidate: (options: { retryCount: number }) => void, 
        { retryCount }: { retryCount: number }) => {
            const status = (error as Error & { status?: number }).status;
            if (status === 500 || retryCount >= 1) return;
            revalidate({ retryCount });
    }

    // Use SWR to automatically fetch tasks (no need to set up the tasks state, and loading state)
    const { data: swrData, error: swrError, isLoading: swrLoading } = useSWR<Task[] | null>(
        "Tasks-API-USE-SWR", 
        fetcher, 
        { onErrorRetry: swrErrorRetry }
    );

    useEffect(() => {
        const fetchCachedTasks = async () => {
            setButtonDisabled(true);
            if (swrData) {
                setTasks(swrData);
                setButtonDisabled(false);
            }
        };

        // for reference: ensure the fn is not called whenever this component is re-hydrated
        if (!swrLoading && !strictDeepEqual(tasks, swrData) && !swrError) {
            fetchCachedTasks();
        }
    }, [tasks, swrData, swrLoading, swrError, setTasks]);

    useEffect(() => {
        setButtonDisabled(filterText.trim().length > 0);
    }, [setButtonDisabled, filterText])

    const isFiltering = filterText.trim() !== "";
    const confirmedTasks = swrData && isFiltering
        ? swrData.filter(task =>
            task.detail.toLowerCase().includes(filterText.toLowerCase())
        )
        : swrData ;

    const swrLoadingMsg = swrLoading ? <p>SWR Loading...</p> : <></>;
    const swrErrormsg = swrError ? <p>{(swrError as Error).name} - {(swrError as Error).message}</p> : <></>;
    
    const authContent = swrError
        ? <></>
        : <TaskUser userAuthenticated={userAuthenticated} setUserAuthenticated={setUserAuthenticated} />;     

    const seedContent = swrError || !swrData
        ? <></>
        : (
            <TaskSeedDBWithSwr
                tasks={swrData}
                seedTaskDB={seedTasksDB}
                deleteAllRows={deleteAllRows}
                buttonDisabled={buttonDisabled}
                setButtonDisabled={setButtonDisabled}
                userAuthenticated={userAuthenticated}
            />
        );
        
    const filterContent = swrError
        ? <></>
        : (
            <>
                <span>Filter task description: </span>
                <input
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Filter detail..."
                />
            </>
        );  
        

    return (
        <>
            <h2>Frontend cached with Vercel SWR: Model + ViewModel server-side components, & View client-side components rendered with Next.js App Router</h2>
            {authContent}
            {swrLoadingMsg}
            {swrErrormsg}
            {seedContent}
            <br />
            {filterContent}
            <br />
            <TaskTableWithSwr
                tasks={confirmedTasks ?? []}
                createRow={createRow}
                updateRowFromId={updateRowFromId}
                buttonDisabled={buttonDisabled}
                setButtonDisabled={setButtonDisabled}
                userAuthenticated={userAuthenticated}
            />
        </>
    );
};
