'use client'

// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import { memo, useCallback, Dispatch, SetStateAction } from 'react';

export type TaskSeedDBType = {
    totalRows: number, 
    seedTaskDB: () => Promise<void>,
    deleteAllRows: () => Promise<void>,
    buttonDisabled: boolean,
    setButtonDisabled: Dispatch<SetStateAction<boolean>>,
    userAuthenticated: boolean,
}

const TaskSeedDB = ({ totalRows, seedTaskDB, deleteAllRows, buttonDisabled, setButtonDisabled, userAuthenticated } : TaskSeedDBType) => {
    const onClickHandler = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();    
        setButtonDisabled(true);
        if (totalRows <= 0) {
            try {
                await seedTaskDB();
            } catch(err) {
                // For reference: Optional - already logged inside seedTaskDB, so we don't need to log here
                // this try catch statement is needed to make this component to be unit-testable
                console.error("Optional - already logged inside seedTaskDB ", err);
            } 
        }  else {
            try {
                await deleteAllRows();
            } catch(err) {
                // For reference: Optional - already logged inside deleteAllRows, so we don't need to log here
                // this try catch statement is needed to make this component to be unit-testable
                console.error("Optional - already logged inside deleteAllRows ", err);
            }
        }
        setButtonDisabled(false);
    }, [seedTaskDB, deleteAllRows, setButtonDisabled, totalRows]);

    const renderButton: React.ReactElement = userAuthenticated 
        ? (
            <button type="button" onClick={(e) => onClickHandler(e)} disabled={buttonDisabled}>
                {totalRows <= 0 ? "Seed DB" : "Delete all rows"}
            </button>
        ) : ( <button type="button" disabled>
                {totalRows <= 0 ? "Seed DB" : "Delete all rows"}
            </button> );
     
    return (
        <>
            <p>{`Currently, there are ${totalRows} rows in the Tasks table.`}</p>
            {renderButton}
        </>
    )
};

export default memo(TaskSeedDB);
