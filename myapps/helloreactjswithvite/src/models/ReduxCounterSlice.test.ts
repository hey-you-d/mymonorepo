import reduxCounterReducer, { increment, decrement, setValue } from "./ReduxCounterSlice";

describe("ReduxCounterReducer", () => {
    let initialState: { value: number };

    beforeEach(() => {
        initialState = { value: 0 };
    });

    it("should handle increment function", () => {
        const action = increment();
        const state = reduxCounterReducer(initialState, action);

        expect(state.value).toBe(1);
    });

    it("should handle decrement function", () => {
        const action = decrement();
        const state = reduxCounterReducer(initialState, action);

        expect(state.value).toBe(-1);
    });

    it("should handle setValue function", () => {
        const action = setValue(10);
        const state = reduxCounterReducer(initialState, action);

        expect(state.value).toBe(10);
    });

    it("should not modify state when no action is passed", () => {
        const state = reduxCounterReducer(initialState, { type: 'unknown' });

        expect(state.value).toBe(0);
    });
});