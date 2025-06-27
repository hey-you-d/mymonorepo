'use client';
// for reference: don't let the folder name mislead you, a view component cannot be a server component.
// the uniform folder name is for the sake of consistency
import { useState, useEffect } from "react";
import {
    createRow,
    updateRowFromId,
    deleteAllRows,
    getTasksDBRows,
    seedTaskDB
} from '@/viewModels/Task/use-server/getTaskGraphQLViewModel';
import { TaskUserGraphQL } from "./taskUserGraphQL";
import TaskSeedDBGraphQL from '@/components/Task/use-server/TaskSeedDBGraphQL';
import TaskTableGraphQL from '@/components/Task/use-server/TaskTableGraphQL';
import { Task } from "@/types/Task";

export const TaskGraphQLPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
    const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

    // Fetch tasks on mount
    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            setButtonDisabled(true);
            try {
                const tasks = await getTasksDBRows();
                if (tasks) {
                    setTasks(tasks);
                }
                setButtonDisabled(false);
            } catch (e) {
                if (e instanceof Error) {
                    console.error("taskGraphQLPage | Failed to fetch tasks db rows:", e?.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []); // run once only

    if (loading) return <p>Loading...</p>;

    return (
        <>
          <h2>Data fetching & querying with Apollo Graphql: Model + ViewModel server-side components, & View client-side components rendered with Next.js App Router</h2>
          <TaskUserGraphQL userAuthenticated={userAuthenticated} setUserAuthenticated={setUserAuthenticated} />
          <TaskSeedDBGraphQL
            tasks={tasks}
            setTasks={setTasks}
            seedTaskDB={seedTaskDB}
            deleteAllRows={deleteAllRows}
            buttonDisabled={buttonDisabled}
            setButtonDisabled={setButtonDisabled}
            userAuthenticated={userAuthenticated}
          />
          <TaskTableGraphQL
            tasks={tasks}
            setTasks={setTasks}
            createRow={createRow}
            updateRowFromId={updateRowFromId}
            buttonDisabled={buttonDisabled}
            setButtonDisabled={setButtonDisabled}
            userAuthenticated={userAuthenticated}
          />
        </>
    );
}
