import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const reduxCounterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
        increment: (state) => { state.value += 1; },
        decrement: (state) => { state.value -= 1; },
        setValue: (state, action: PayloadAction<number>) => {
            state.value = action.payload;
        },
    }
});

export const { increment, decrement, setValue } = reduxCounterSlice.actions;

const reduxCounterReducer = reduxCounterSlice.reducer;
export default reduxCounterReducer;
