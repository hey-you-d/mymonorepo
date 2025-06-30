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
import { catchedErrorMessage } from "@/lib/app/error";

const fnSignature = "use-server | view | taskGraphQLPage";

export const TaskGraphQLPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
    const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
            } catch (err) {
                // in real world scenario, this sort of error msg must not be visible to public.
                // A detailed error msg should only be sent to a remote logging service, whereas client will be presented
                // with a simplified error msg such as: "An error has been encountered (HTML status code: 500)". 
                const errMsg = await catchedErrorMessage(fnSignature, "useEffect - getTasksDBRows", err as Error);
                setError(errMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []); // run once only

    const loadingMsg = loading ? <p>Loading...</p> : <></>;
    
    const authContent = error
    ? <></>
    : <TaskUserGraphQL userAuthenticated={userAuthenticated} setUserAuthenticated={setUserAuthenticated} />;

    const seedContent = error
    ? <></>
    : (
        <TaskSeedDBGraphQL
            tasks={tasks}
            setTasks={setTasks}
            seedTaskDB={seedTaskDB}
            deleteAllRows={deleteAllRows}
            buttonDisabled={buttonDisabled}
            setButtonDisabled={setButtonDisabled}
            userAuthenticated={userAuthenticated}
          />
    );

    return (
        <>
          <h2>Data fetching & querying with Apollo Graphql: Model + ViewModel server-side components, & View client-side components rendered with Next.js App Router</h2>
          {authContent}
          {error}
          {loadingMsg}
          {seedContent}
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
