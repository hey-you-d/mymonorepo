// The View (presentation component) is a pure functional component focused on displaying data and 
// responding to user actions passed in as props.
import React  from 'react';

export const TaskSeedDB = ({ seedTaskDB, setTotalRows } : 
                            { seedTaskDB: () => Promise<void>,
                                setTotalRows: (total: number) => void }) => {
    const onClickHandler = (e: React.FormEvent) => {
        e.preventDefault();
        setTotalRows(10);      
        seedTaskDB();
    }
    
    return <button onClick={onClickHandler}>Seed DB</button>;
};
