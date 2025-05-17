import reduxSagaUserReducer, { fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure } from "./ReduxSagaUserSlice";

const initialState = {
    reduxSagaUsers: [],
    loading: false,
    error: null,
}

describe("ReduxSagaUserSlice reducers", () => {
    it("should handle fetchUsersRequest", () => {
        const action = fetchUsersRequest();
        const state = reduxSagaUserReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it("should handle fetchUsersSuccess", () => {
        const action = fetchUsersSuccess([{ id: 1, name: "John Doe", email: "john@example.com" }]);
        const state = reduxSagaUserReducer(initialState, action);

        expect(state.reduxSagaUsers).toEqual(action.payload);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it("should handle fetchUsersFailure", () => {
        const errorMsg = "Error Occured";
        const action = fetchUsersFailure(errorMsg);
        const state = reduxSagaUserReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMsg);
    });
});
