// Redux implementation example #2: 
// Next.js redux implementation using Redux saga while following the MVVM pattern & 
// fetching data on the server side (SSR)

import { call, put, takeLatest } from "redux-saga/effects";
import { fetchUsersFailure, fetchUsersRequest, fetchUsersSuccess } from "@/app/models/ReduxSagaUserSlice";

// viewmodel -> handle side effects

// API call function
export const errorMsg = "failed to fetch users";
export const fetchUsersApi = async() => {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    if(!response.ok) throw new Error(errorMsg);
    
    return response.json();
} 

// Saga worker
// eslint-disable-next-line   
export function* fetchUsersSaga(): Generator<any, void, any> {
    try {
        const users = yield call(fetchUsersApi); // call for API requests
        yield put(fetchUsersSuccess(users)); // put to update the Redux store 
// eslint-disable-next-line        
    } catch(error: any) {
        yield put(fetchUsersFailure(error.message));
    }
}

// Saga watcher
function* watchFetchUsers() {
    yield takeLatest(fetchUsersRequest.type, fetchUsersSaga); // takeLatest to handle the latest request
}

// Root Saga
export default function* rootSaga() {
    yield watchFetchUsers();
}
