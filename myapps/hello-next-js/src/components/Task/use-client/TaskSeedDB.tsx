'use client'

// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { Dispatch, SetStateAction } from 'react';

type TaskSeedDBType = {
    totalRows: number, 
    seedTaskDB: () => Promise<void>,
    deleteAllRows: () => Promise<void>,
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
    userAuthenticated: boolean,
}

export const TaskSeedDB = ({ totalRows, seedTaskDB, deleteAllRows, buttonDisabled, setButtonDisabled, userAuthenticated } : TaskSeedDBType) => {
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

    const renderButtonTriggeredByButtonDisabled: React.ReactElement = buttonDisabled ? (
        <button type="button" disabled>
            {totalRows <= 0 ? "Seed DB" : "Delete all rows"}
        </button>
    ) : (
        <button type="button" onClick={onClickHandler}>
            {totalRows <= 0 ? "Seed DB" : "Delete all rows"}
        </button>
    );

    const renderButton: React.ReactElement = userAuthenticated 
        ? renderButtonTriggeredByButtonDisabled
        : ( <button type="button" disabled>
                {totalRows <= 0 ? "Seed DB" : "Delete all rows"}
            </button> );
     
    return (
        <>
            <p>{`Currently, there are ${totalRows} rows in the Tasks table.`}</p>
            {renderButton}
        </>
    )
};
