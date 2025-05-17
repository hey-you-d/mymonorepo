'use client';
// Redux implementation example #2: 
// Next.js redux implementation using Redux saga while following the MVVM patternW

// view -> display data from redux
import { useEffect } from "react";
import { fetchUsersRequest } from "../models/ReduxSagaUserSlice";
import { ReduxSagaAppState } from "../reduxSagaStore";
import { useSelector, useDispatch } from "react-redux";

const ReduxSagaExamplePage = () => {
    const { reduxSagaUsers, loading, error } = useSelector((state: ReduxSagaAppState) => state.reduxSagaUser)

    // do it on the client side instead
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchUsersRequest())
    }, [dispatch])

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    

    return (
        <div>
            <h3>Users list</h3>
            <ul>
                { reduxSagaUsers.map((user) => (
                    <li key={user.id}>{user.name} - {user.email}</li>
                )) }
            </ul>
        </div>
    );
}

export default ReduxSagaExamplePage;