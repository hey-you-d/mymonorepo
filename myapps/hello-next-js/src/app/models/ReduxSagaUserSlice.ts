// Redux implementation example #2: 
// Next.js redux implementation using Redux saga while following the MVVM pattern & 
// fetching data on the server side (SSR)

// model -> state, reducers, actions
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ReduxSagaUser = {
    id: number,
    name: string,
    email: string,
};

type ReduxSagaUserState = {
    reduxSagaUsers: ReduxSagaUser[],
    loading: boolean,
    error: string | null,
};

const initialState:ReduxSagaUserState  = {
    reduxSagaUsers: [],
    loading: false,
    error: null,
}

const reduxSagaUserSlice = createSlice({
    name: 'redux saga user',
    initialState,
    reducers: {
        fetchUsersRequest: (state) => {
            state.loading = true; 
            state.error = null; 
        },
        fetchUsersSuccess: (state, action: PayloadAction<ReduxSagaUser[]>) => { 
            state.reduxSagaUsers = action.payload; 
            state.loading = false;
        },
        fetchUsersFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
    }
});

export const { fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure } = reduxSagaUserSlice.actions;

const reduxSagaUserReducer = reduxSagaUserSlice.reducer;
export default reduxSagaUserReducer;
