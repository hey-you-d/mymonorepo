'use client'

// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { Dispatch, SetStateAction } from 'react';
import { Task } from '@/types/Task';

type TaskSeedDBType = {
    totalRows: number, 
    seedTaskDB: () => Promise<void>,
    deleteAllRows: () => Promise<void>,
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
}

export const TaskSeedDB = ({ totalRows, seedTaskDB, deleteAllRows, buttonDisabled, setButtonDisabled } : TaskSeedDBType) => {
    const onClickHandler = async (e: React.FormEvent) => {
        e.preventDefault();    
        setButtonDisabled(true);
        if (totalRows <= 0) {
            await seedTaskDB();
        }  else {
            await deleteAllRows();
        }
        setButtonDisabled(false);
    }

    const buttonLabel = totalRows <= 0 ? "Seed DB" : "Delete all rows";
    const renderButton: React.ReactElement = buttonDisabled ? (
        <button type="button" disabled>
            {buttonLabel}
        </button>
    ) : (
        <button type="button" onClick={onClickHandler}>
            {buttonLabel}
        </button>
    );

    return (
        <>
            <p>{`Currently, there are ${totalRows} rows in the Tasks table.`}</p>
            {renderButton}
        </>
    )
};
