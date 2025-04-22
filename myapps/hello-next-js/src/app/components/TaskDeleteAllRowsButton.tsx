// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import React  from 'react';

export const TaskDeleteAllRowsButton = ({ totalRows, deleteAllRows, setTotalRows } : 
                                        { totalRows: number, 
                                            deleteAllRows: () => Promise<void>, 
                                            setTotalRows: (total: number) => void }) => {
    const onClickHandler = (e: React.FormEvent) => {
        e.preventDefault();
        
        deleteAllRows();
        setTotalRows(0);
    }
    
    return (
        <>
            <p>{`Currently, there are ${totalRows} rows in the Tasks table.`}</p>
            <button onClick={onClickHandler}>Delete All Rows</button>
        </>
    )
};