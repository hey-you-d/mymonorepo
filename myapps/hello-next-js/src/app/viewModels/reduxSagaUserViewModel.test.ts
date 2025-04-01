import { runSaga } from 'redux-saga';
import { fetchUsersSaga } from "./reduxSagaUserViewModel"; // saga worker
import { fetchUsersSuccess, fetchUsersFailure } from '../models/ReduxSagaUserSlice';
import { call } from "redux-saga/effects";
import { fetchUsersApi, errorMsg } from './reduxSagaUserViewModel';

// Mock API Call
jest.mock('./reduxSagaUserViewModel', () => ({
    ...jest.requireActual('./reduxSagaUserViewModel'),
    fetchUsersApi: jest.fn()
}));

const usersData = [{id: 1, name: "John Doe", email: "john.doe@email.com"}];

describe("fetchUsersSaga", () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(usersData)
        }) as jest.Mock
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should dispatch fetchUsersSuccess when fetch is successful", async () => {
        const dispatched: any[] = [];
        const mockStore = { dispatch: (action: any) => dispatched.push(action) };

        await runSaga(mockStore, fetchUsersSaga).toPromise();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(dispatched).toEqual([
            fetchUsersSuccess(usersData),
        ]); 
    });

    it("should dispatch fetchUsersFailure when fetch is successful", async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: false, // simulates API failure
            json: async () => ({ message: 'Error Occured' })
        }) as jest.Mock;

        const dispatched: any[] = [];
        const mockStore = { dispatch: (action: any) => dispatched.push(action) };

        await runSaga(mockStore, fetchUsersSaga).toPromise();
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(dispatched).toEqual([
            fetchUsersFailure(errorMsg),
        ]); 

    });

    it("should handle successful API Call ", async () => {
        fetchUsersApi.mockResolvedValue(usersData);

        const dispatchedActions: any[] = [];

        // run the saga
        await runSaga(
            {
                dispatch: (action: any) => dispatchedActions.push(action),
            },
            fetchUsersSaga
        ).toPromise();

        // Check that correct success action was dispatched 
        expect(dispatchedActions).toContainEqual(fetchUsersSuccess(usersData)); 
    });

    it("should handle failed API Call ", async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: false, // simulates API failure
            json: async () => ({ message: 'Error Occured' })
        }) as jest.Mock;

        const dispatchedActions: any[] = [];

        // run the saga
        await runSaga(
            {
                dispatch: (action: any) => dispatchedActions.push(action),
            },
            fetchUsersSaga
        ).toPromise();

        // Check that correct success action was dispatched 
        expect(dispatchedActions).toContainEqual(fetchUsersFailure(errorMsg)); 
    });
});
