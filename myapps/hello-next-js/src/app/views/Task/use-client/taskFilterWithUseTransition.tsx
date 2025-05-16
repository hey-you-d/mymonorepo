'use client';
import { useState, useTransition } from 'react';
import { TaskTable } from '@/app/components/TaskTable';
import { Task, TaskTableType } from '@/app/types/Task';
import { TASKS_CRUD } from '@/global/common';
import Link from "next/link";

// for reference: experiment only - the useTransition feature doesn't seem to be suitable for this feature
// gotcha: the input field losing focus after each keypress.

// under the hood:
// - You call setSearch(value) (good — this updates immediately).
// - You call startTransition(() => setFilteredTasks(...)) (intended - marks this state update as low priority).
// - React schedules the setFilteredTasks update, which causes the component to re-render when it's ready.
// - If your TaskTable or component tree depends heavily on this derived state, it may be causing the input to re-render or re-mount.
// - As a result, React loses the DOM focus on the input. (the above gotcha)

// resolution: 
// save yourself from the potential headache, better rely on useDeferredValue
export const TaskFilterWithUseTransition = ({ tasks, createRow, updateRowFromId } : TaskTableType) => {
    // for reference: 
    // recall, react state updates are blocking
    // - react will process the state update immediately
    // - re-render synchronously
    // - hence, potentially delay the responsiveness, especially if the re-render is expensive
    // real-world analogy:
    // without useTransition: "hold on, let me finish sorting this massive table b4 I listen to you typing"
    // with useTransition: "Go ahead and type - I'll handle the filtering in the background"
    // the state update becomes a non-blocking operation. ract will prioritize keeping the input field 
    // responsive and defer this update to the background if needed. 
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState("");
    const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);

    if (isPending) return (<p>Is Pending...</p>);

    const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value); // for reference: update immediately for the controlled input
      
      startTransition(() => {
        if (tasks) {
            // for reference: expensive update deferred - I want to set a state, and delay the state update
            setFilteredTasks(
              tasks.filter(row => row.detail.toLowerCase().includes(value.toLowerCase()))
            );
        }
      });
    };

    const confirmedTasks: Task[] | undefined = tasks && tasks.length > 0 ? filteredTasks : tasks; 

    return tasks && !isPending ? (
        <>
          <h2>optimise the search/filter feature with useTransition</h2>
          <br/>
          <span>filter task description: </span><input value={search} onChange={searchHandler} placeholder="Filter detail..." />
          <br/>
          <Link href={TASKS_CRUD}>button triggered Filter example</Link>
          <br/>
          <TaskTable tasks={confirmedTasks} createRow={createRow} updateRowFromId={updateRowFromId} />
        </>
    ) : (<p>Is Pending...</p>);
};
