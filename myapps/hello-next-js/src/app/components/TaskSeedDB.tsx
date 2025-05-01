// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import React from 'react';

type TaskSeedDBType = {
    totalRows: number, 
    seedTaskDB: () => Promise<void>,
    deleteAllRows: () => Promise<void>,
}

export const TaskSeedDB = ({ totalRows, seedTaskDB, deleteAllRows } : TaskSeedDBType) => {
    const onClickHandler = (e: React.FormEvent) => {
        e.preventDefault();    
        if (totalRows <= 0) {
            seedTaskDB();
        }  else {
            deleteAllRows();
        }
    }

    const buttonLabel = totalRows <= 0 ? "Seed DB" : "Delete all rows";
    
    return (
        <>
            <p>{`Currently, there are ${totalRows} rows in the Tasks table.`}</p>
            <button onClick={onClickHandler}>{buttonLabel}</button>
        </>
    )
};
